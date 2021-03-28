import expressRouter from "express";
const router = expressRouter.Router();

import fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
			res.status(400).json({
				error: "Name already exists",
			});
		} else {
			console.log(e);
			res.sendStatus(500);
		}
	}
});

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

router.delete("/:uuid", async (req, res) => {
	const uuid = req.params.uuid;
	try {
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

		const deleteProcessingStatus = await prisma.processing.deleteMany({
			where: {
				video: {
					subjectId: uuid,
				},
			},
		});

		if (videosToDelete) {
			videosToDelete.videos.map((v) => {
				const appRoot = process.env.NODE_APP_ROOT;
				fs.rmSync(appRoot + "/storage/" + v.uuid, {
					recursive: true,
					force: true,
				});
			});
		}

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
