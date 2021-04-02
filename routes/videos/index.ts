import expressRouter from "express";
import { PrismaClient } from "@prisma/client";
import shortUUID, { uuid } from "short-uuid";
const translator = shortUUID();
import fs from "fs";

const router = expressRouter.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
	if (!req.session.roomId) {
		res.sendStatus(401);
		return;
	}
	try {
		const uuid = req.session.roomId;
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

router.get("/:uuid*", (req, res) => {
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
				fs.createReadStream(process.env.NODE_APP_ROOT + "/storage/" + req.url)
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
