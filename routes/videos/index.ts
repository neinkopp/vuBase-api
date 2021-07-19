import expressRouter from "express";
import { PrismaClient } from "@prisma/client";
import shortUUID, { uuid } from "short-uuid";
import fs from "fs";

// short UUID translator
const translator = shortUUID();

const router = expressRouter.Router();

// Generate Prisma client
const prisma = new PrismaClient();

// Get video list
router.get("/", async (req, res) => {
	if (!req.session.roomId) {
		// Not authenticated into any room
		res.sendStatus(401);
		return;
	}
	try {
		const uuid = req.session.roomId;

		// List all online videos in room
		const videos = await prisma.room.findFirst({
			where: {
				uuid,
			},
			select: {
				videos: {
					where: {
						processing: {
							status: {
								equals: 3,
							},
						},
					},
					select: {
						uuid: true,
						title: true,
						desc: true,
						subject: {
							select: {
								name: true,
							},
						},
					},
					orderBy: {
						title: "asc",
					},
				},
			},
		});

		// Translate each long UUIDv4 into short-uuid
		const filteredVideos = videos?.videos.map((v) => {
			return {
				...v,
				uuid: translator.fromUUID(v.uuid),
			};
		});
		res.send(filteredVideos);
	} catch (e) {
		res.sendStatus(500);
		console.log(e);
	}
});

// Get specific video; serve HLS chunks/playlist
router.get("/:uuid/:url(*)", (req, res) => {
	if (!req.session.roomId) {
		res.sendStatus(401);
		return;
	}
	if (!require.main) {
		res.sendStatus(500);
		return;
	}
	if (!req.params.uuid) {
		res.sendStatus(400);
		return;
	} else if (!req.session.roomId) {
		res.status(401).json({
			message: "Wrong room",
			paramsUuid: req.params.uuid,
		});
		return;
	}

	const uuid = req.session.roomId;

	console.log(req.params.uuid);
	console.log(req.params.url);

	// Verify that video is online
	prisma.room
		.findFirst({
			where: {
				uuid,
				videos: {
					some: {
						uuid: req.params.uuid,
					},
				},
			},
			select: {
				videos: {
					where: {
						processing: {
							status: {
								equals: 3,
							},
						},
					},
				},
			},
		})
		.then((data) => {
			if (!data) {
				res.status(403).json({
					message: "Wrong room",
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
		})
		.catch((e) => {
			console.log(e);
			res.sendStatus(500);
		});
});

export = router;
