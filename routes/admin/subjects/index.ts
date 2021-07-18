import expressRouter from "express";
const router = expressRouter.Router();

import fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create new subject
router.post("/", async (req, res) => {
	const name = req.body.name;
	const uuid = uuidv4();
	try {
		const result = await prisma.subject.create({
			data: {
				name,
				uuid,
			},
			select: {
				id: false,
				uuid: true,
				name: true,
			},
		});
		res.status(201).json(result);
	} catch (e) {
		if (e.code === "P2002") {
			// Unique constraint violation
			res.status(400).json({
				error: "Name already exists",
			});
		} else {
			console.log(e);
			res.sendStatus(500);
		}
	}
});

// Get subject list
router.get("/", (_, res) => {
	prisma.subject
		.findMany({
			select: {
				name: true,
				uuid: true,
			},
		})
		.then((data) => res.send(data))
		.catch((e) => {
			console.log(e);
			res.sendStatus(500);
		});
});

// Get specific subject data
router.patch("/:uuid", async (req, res) => {
	try {
		const uuid = req.params.uuid;
		const name = req.body.name;
		const result = await prisma.subject.update({
			where: { uuid },
			data: { name },
		});
		res.status(201).json({ name: result.name, uuid: result.uuid });
	} catch (e) {
		console.log(e);
		res.sendStatus(500);
	}
});

// Delete subject (with all videos in it)
router.delete("/:uuid", async (req, res) => {
	const uuid = req.params.uuid;
	try {
		// Verifies that no videos are being encoded
		const videosNotProcessed = await prisma.video.findFirst({
			where: {
				subjectId: uuid,
				processing: {
					isNot: {
						progress: 3,
					},
				},
			},
		});

		if (videosNotProcessed) {
			res.sendStatus(400);
			return;
		}

		// FInd all videos to delete
		const videosToDelete = await prisma.subject.findFirst({
			where: { uuid },
			select: {
				videos: {
					select: {
						uuid: true,
					},
				},
			},
		});

		// Delete all processing entries for videos with subject
		const deleteProcessingStatus = await prisma.processing.deleteMany({
			where: {
				video: {
					subjectId: uuid,
				},
			},
		});

		if (videosToDelete) {
			// Delete all video files for each entry
			videosToDelete.videos.map((v) => {
				const appRoot = process.env.NODE_APP_ROOT;
				fs.rmSync(appRoot + "/storage/" + v.uuid, {
					recursive: true,
					force: true,
				});
			});
		}

		// Delete all video entries in db
		const deleteVideoEntries = await prisma.video.deleteMany({
			where: {
				subjectId: uuid,
			},
		});

		prisma.subject
			.delete({
				where: { uuid },
			})
			.then(() => {
				res.sendStatus(204);
			});
	} catch (e) {
		console.log(e);
		res.sendStatus(500);
	}
});

export = router;
