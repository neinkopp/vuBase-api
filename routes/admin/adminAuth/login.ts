import expressRouter from "express";
const router = expressRouter.Router();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// argon2 for password hashing
import argon2 from "argon2";

// Admin login
router.post("/login", async (req, res) => {
	if (!req.body.username || !req.body.password) {
		res.sendStatus(400);
		return;
	}

	const username = String(req.body.username);
	const password = String(req.body.password);

	// Find user in db
	const adminUser = await prisma.adminUser.findFirst({
		select: {
			username: true,
			pass_hashed: true,
		},
		where: {
			username,
		},
	});

	try {
		if (adminUser) {
			// Verify password
			await argon2.verify(adminUser.pass_hashed, password).then((bool) => {
				if (bool) {
					const username = adminUser.username;
					req.session.adminId = username;
					res.status(200).json({
						loggedIn: true,
						username,
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
