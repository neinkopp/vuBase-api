import expressRouter from "express";
const router = expressRouter.Router();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

router.post("/restore", async (req, res) => {
	const username = req.body.username;
	const key = req.body.key;
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
