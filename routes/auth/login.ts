import expressRouter from "express";
const router = expressRouter.Router();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// argon2 for password verification
import argon2 from "argon2";

// User login
router.post("/login", async (req, res) => {
	if (!req.body.room || !req.body.password) {
		res.sendStatus(400);
		return;
	}

	// Check if user is already logged in
	if (req.session.roomId) {
		const uuid = req.session.roomId;
		const roomName = await prisma.room
			.findFirst({
				select: {
					name: true,
				},
				where: {
					uuid: req.session.roomId,
				},
			})
			.catch((e) => {
				console.log(e);
				res.sendStatus(500);
				return;
			});
		res.json({
			loggedIn: null,
			uuid,
			message: "User already logged into '" + roomName + "'",
		});
		return;
	}

	// User inputs
	const name = String(req.body.room);
	const password = String(req.body.password);

	// Retrieve id, name and hashed password of desired room
	const checkRoom = await prisma.room.findFirst({
		select: {
			uuid: true,
			name: true,
			pass_hashed: true,
		},
		where: {
			name,
		},
	});

	// Verify user credentials
	try {
		if (checkRoom) {
			await argon2.verify(checkRoom.pass_hashed, password).then((bool) => {
				if (bool) {
					// Login user
					const uuid = checkRoom.uuid;
					req.session.roomId = uuid;
					res.status(200).json({
						loggedIn: true,
						uuid,
						message: "User logged in successfully",
					});
					return;
				} else {
					res.status(401).json({
						loggedIn: false,
						message: "Wrong credentials",
					});
					return;
				}
			});
		} else {
			res.status(401).json({
				loggedIn: false,
				message: "Wrong credentials",
			});
			return;
		}
	} catch (e) {
		console.log(e);
		res.status(500).json({
			loggedIn: false,
			message: "Internal Server Error",
		});
	}
});

export = router;
