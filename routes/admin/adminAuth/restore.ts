import expressRouter from "express";
const router = expressRouter.Router();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// User credential restore system
router.post("/restore", async (req, res) => {
	// Get username and restore key from request
	const username = req.body.username;
	const key = req.body.key;
	// Remove whitespace from user input and verify reset account secret
	if (!username || !key) {
		res.sendStatus(400);
	} else if (key.replace(/\s/g, "") !== process.env.RESET_ACCOUNT_SECRET) {
		console.log(
			"Specified was " +
				key.replace(/\s/g, "") +
				" but reset secret was " +
				process.env.RESET_ACCOUNT_SECRET
		);
		res.status(401).json({
			loggedIn: false,
			message: "Wrong credentials",
		});
	} else {
		// Log in admin for password change
		const adminUser = await prisma.adminUser.findFirst({
			select: {
				username: true,
			},
			where: {
				username,
			},
		});
		if (adminUser) {
			req.session.adminId = adminUser.username;
			res.status(200).json({
				loggedIn: true,
				username,
				message: "User logged in successfully",
			});
		} else {
			res.status(401).json({
				loggedIn: false,
				message: "Wrong credentials",
			});
		}
	}
});

export = router;
