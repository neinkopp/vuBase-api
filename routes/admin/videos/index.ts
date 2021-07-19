// Admin video functions

import expressRouter, { NextFunction, Request, Response } from "express";
const router = expressRouter.Router();

import fs from "fs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import path from "path";

// import video processing class
import VideoProcessing from "./processing";

// May use for debugging
const checkReferer = (req: Request, res: Response, next: NextFunction) => {
	if (
		!req.headers.referer ||
		!/(http:|https:)\/\/localhost:3000\/.*|(http:|https:)\/\/192.168.178.74:3000\/.*/g.test(
			req.headers.referer
		)
	) {
		return res.status(410).send();
	} else {
		next();
	}
};

// Upload video
router.post("/", (req, res) => {
	if (!req.body.title || !req.body.subject || !req.body.motionFactor) {
		return res.status(400).json("Bad Request.");
	}
	// Check subject uuid
	if (
		!req.body.subject.match(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
		)
	) {
		return res
			.status(400)
			.json({ message: "The specified UUID is not valid." });
	}

	// Generate uuid for video
	const uploadId = uuidv4();

	if (!req.files || !req.files.video) {
		return res.status(400).send();
	}

	const video = req.files.video as UploadedFile;

	// instanciate new VideoProcessing with event handlers
	const processing = new VideoProcessing(video, {
		...req.body,
		uuid: uploadId,
	});
	processing.on("start", () => {
		res.status(202).json({
			location: video.tempFilePath,
			accepted: true,
			id: uploadId,
			message: "Der Auftrag wird bearbeitet.",
		});
	});
	processing.on("abort", (code) => {
		res.status(code).json({
			accepted: false,
		});
	});
	processing.start();
});

// Get video list
router.get("/", async (_, res) => {
	try {
		const videos = await prisma.video.findMany({
			select: {
				uuid: true,
				title: true,
				desc: true,
				subject: {
					select: {
						uuid: true,
						name: true,
					},
				},
				added: true,
				rooms: {
					select: {
						name: true,
						uuid: true,
					},
				},
				processing: {
					select: {
						status: true,
						progress: true,
					},
				},
			},
		});
		res.send(videos);
	} catch (e) {
		console.log(e);
		res.sendStatus(500);
	}
});

// Get specific video data
router.get("/:uuid", async (req, res) => {
	const uuid = req.params.uuid;
	try {
		const video = await prisma.video.findFirst({
			where: { uuid },
			select: {
				uuid: true,
				title: true,
				desc: true,
				added: true,
				subjectId: true,
			},
		});
		res.send(video);
	} catch (e) {
		console.log(e);
		res.sendStatus(500);
	}
});

// Patch video data
router.patch("/:uuid", async (req, res) => {
	const uuid = req.params.uuid;
	const params: {
		title?: string;
		desc?: string;
	} = {};
	req.body.title ? (params.title = req.body.title) : null;
	req.body.desc ? (params.desc = req.body.desc) : null;

	try {
		const patch = await prisma.video.update({
			data: params,
			where: { uuid },
			select: {
				uuid: true,
				title: true,
				desc: true,
			},
		});
		res.send(patch);
	} catch (e) {
		if (e.code === "P2002") {
			res.status(400).json({
				error: "Name already exists",
			});
		} else if (e.code === "P2000") {
			res.status(400).json({
				error: "Value Too Long",
			});
		} else {
			res.sendStatus(500);
		}
	}
});

// Delete video
router.delete("/:uuid", async (req, res) => {
	const uuid = req.params.uuid;

	if (!require.main) {
		return;
	}

	if (!uuid) {
		res.sendStatus(400);
	}
	try {
		// If video has "error" or "online" status
		const videoOnline = await prisma.processing.findFirst({
			where: {
				uuid,
				OR: [
					{
						status: 0,
					},
					{
						status: 3,
					},
				],
			},
			select: { status: true },
		});
		if (videoOnline) {
			try {
				// Delete physical video
				fs.rmSync(path.dirname(require.main.filename) + "/storage/" + uuid, {
					recursive: true,
					force: true,
				});
				// Delete video data
				await prisma.processing.delete({
					where: { uuid },
				});
				await prisma.video.delete({
					where: { uuid },
				});
				res.sendStatus(204);
			} catch (e) {
				console.log(e);
				res.sendStatus(500);
			}
		} else {
			return res.status(400).json({
				error: "Video not online",
			});
		}
	} catch (e) {
		console.log(e);
		res.sendStatus(500);
	}
});

// Get video upload status and progress
router.get("/:uuid/progress", async (req, res) => {
	const uuid = req.params.uuid;
	try {
		const progress = await prisma.processing.findFirst({
			where: { uuid },
			select: {
				status: true,
				progress: true,
			},
		});
		res.send(progress);
	} catch (e) {
		res.sendStatus(500);
		console.log(e);
	}
});

// Get HLS stream for video preview
router.get("/:uuid/:url(*)", async (req, res) => {
	try {
		const videoOnline = await prisma.video.findFirst({
			where: {
				uuid: req.params.uuid,
				processing: {
					status: 3,
				},
			},
			select: {
				uuid: true,
			},
		});
		if (!videoOnline) {
			res.status(400).json({
				message: "Not fully processed",
			});
		} else {
			// Serve files out of storage folder
			const filePath = req.params.uuid + "/" + req.params.url;
			if (filePath.indexOf(".") !== filePath.lastIndexOf(".")) {
				res.status(400).json({
					message: "File path not allowed",
				});
				return;
			}

			fs.createReadStream(process.env.NODE_APP_ROOT + "/storage/" + filePath)
				.on("error", (e) => {
					console.log(e);
					res.sendStatus(404);
					return;
				})
				.pipe(res);
		}
	} catch (e) {
		console.log(e);
		res.sendStatus(500);
	}
});

export = router;
