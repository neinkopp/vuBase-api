import expressRouter from "express";
const router = expressRouter.Router();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// argon2 for password verification
import argon2 from "argon2";

import { v4 as uuidv4 } from "uuid";

// Create room with password
router.post("/", async (req, res) => {
	if (!req.body.name || !req.body.password) {
		res.sendStatus(400);
		return;
	}

	try {
		const uuid = uuidv4();
		const name = req.body.name;
		// Hash room password
		const pass_hashed = await argon2.hash(req.body.password);

		try {
			// Create room entry
			const result = await prisma.room.create({
				data: { uuid, name, pass_hashed },
			});
			res.status(201).json({ name: result.name, uuid: result.uuid });
		} catch (e) {
			if (e.code === "P2002") {
				res.status(400).json({
					error: "Name already exists",
				});
			} else {
				res.sendStatus(500);
			}
		}
	} catch (e) {
		console.log(e);
	}
});

// Get list of all rooms
router.get("/", async (req, res) => {
	try {
		const result = await prisma.room.findMany({
			select: { uuid: true, name: true },
		});
		res.json(result);
	} catch (e) {
		res.sendStatus(500);
	}
});

// Patch room params including password
router.patch("/:uuid", async (req, res) => {
	if (!req.params.uuid) {
		res.sendStatus(400);
		return;
	}

	const uuid = req.params.uuid;
	const name = req.body.name;

	interface UpdateData {
		name?: string;
		pass_hashed?: string;
	}

	const updateRoom = async (data: UpdateData) => {
		try {
			const results = await prisma.room.update({
				data,
				where: {
					uuid,
				},
			});
			sendResults(results);
		} catch (e) {
			console.log(e);
			res.sendStatus(500);
		}
	};

	const sendResults = (data: UpdateData) => {
		res.json(data);
	};

	if (req.body.name && req.body.password) {
		const pass_hashed = await argon2.hash(req.body.password);
		await updateRoom({ name, pass_hashed });
	} else if (req.body.name) {
		await updateRoom({ name });
	} else if (req.body.password) {
		const pass_hashed = await argon2.hash(req.body.password);
		await updateRoom({ name, pass_hashed });
	} else {
		return res.sendStatus(400);
	}
});

// Delete room
router.delete("/:uuid", async (req, res) => {
	if (!req.params.uuid) {
		return res.sendStatus(400);
	}
	const uuid = req.params.uuid;
	try {
		await prisma.room.delete({
			where: { uuid },
		});
		return res.sendStatus(204);
	} catch (e) {
		return res.status(500).json({
			error: "Internal Server error",
		});
	}
});

// Verify that password works (for debugging)
router.post("/:uuid/verify/", async (req, res) => {
	if (!req.params.uuid || !req.body.password) {
		res.sendStatus(400);
		return;
	}
	const uuid = req.params.uuid;
	try {
		const result = await prisma.room.findFirst({
			where: { uuid },
		});
		if (!result || typeof result.pass_hashed == "undefined") {
			res.sendStatus(400);
			return;
		}
		const verify = await argon2.verify(result.pass_hashed, req.body.password);
		return res.json(verify);
	} catch (e) {
		res.sendStatus(500);
		console.log(e);
	}
});

// Add video to room
router.post("/:uuid/videos", async (req, res) => {
	if (!req.params.uuid) {
		res.sendStatus(400);
		return;
	}
	const uuid = req.params.uuid;
	const body = req.body;
	try {
		if (body.video && typeof body.video === "string") {
			await prisma.room.update({
				where: { uuid },
				data: {
					videos: {
						connect: {
							uuid: body.video,
						},
					},
				},
			});
		} else {
			res.sendStatus(400);
			return;
		}
		res.sendStatus(201);
	} catch (e) {
		res.sendStatus(500);
		console.log(e);
	}
});

// Get list of all videos in room
router.get("/:uuid/videos", async (req, res) => {
	if (!req.params.uuid) {
		res.sendStatus(400);
		return;
	}
	const uuid = req.params.uuid;
	try {
		const videos = await prisma.room.findFirst({
			where: { uuid },
			select: {
				videos: {
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
				},
			},
		});
		res.send(videos);
	} catch (e) {
		res.sendStatus(500);
		console.log(e);
	}
});

// Remove video from room
router.delete("/:uuid/videos/:video", async (req, res) => {
	if (!req.params.uuid || !req.params.video) {
		res.sendStatus(400);
	}
	const uuid = req.params.uuid;
	const video = req.params.video;
	try {
		await prisma.room.update({
			where: { uuid },
			data: {
				videos: {
					disconnect: {
						uuid: video,
					},
				},
			},
		});
		res.sendStatus(204);
	} catch (e) {
		res.sendStatus(500);
		console.log(e);
	}
});

export = router;
