import expressRouter from "express";
import login from "./login";
import logout from "./logout";
import restore from "./restore";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// argon2 for password hashing
import argon2 from "argon2";

// Router settings
const router = expressRouter.Router();

router.use(login);
router.use(logout);
router.use(restore);

// Check if admin is authenticated
router.get("/", async (req, res) => {
	if (req.session.adminId) {
		const username = req.session.adminId;
		const isAuth = await prisma.adminUser
			.update({
				data: {
					latest_login: new Date().toISOString(),
				},
				select: {
					username: true,
					latest_login: true,
				},
				where: { username },
			})
			.catch((e) => {
				console.log(e);
				res.sendStatus(500);
				return;
			});
		if (isAuth) {
			res.json({
				authorized: true,
				username: isAuth.username,
				message: "User is authorized.",
			});
			return;
		} else {
			console.log(3);
			req.session.destroy((err) => {
				if (err) {
					console.log(err);
					res.sendStatus(500);
					return;
				}
			});
			res.json({
				authorized: false,
				message: "User is unauthorized.",
			});
		}
	} else {
		res.json({
			authorized: false,
			message: "User is unauthorized.",
		});
	}
});

// Edit admin profile settings
router.patch("/", async (req, res) => {
	if (!req.session.adminId) {
		res.sendStatus(401);
		return;
	} else if (!req.body.password.trim() && !req.body.username.trim()) {
		res.sendStatus(400);
		return;
	} else {
		const insertChanges = async (data: {
			username?: string;
			pass_hashed?: string;
		}) =>
			await prisma.adminUser.update({
				where: {
					username: req.session.adminId,
				},
				data,
			});

		// Different scenarios for each case
		if (req.body.password) {
			argon2.hash(req.body.password.trim()).then((p) => {
				const data = {
					pass_hashed: p,
					username: req.body.username.trim()
						? req.body.username.trim()
						: undefined,
				};
				insertChanges(data)
					.then((d) => {
						req.session.adminId = d.username;
						res.status(201).json({
							username: d.username,
						});
						return;
					})
					.catch((e) => {
						if (e.code === "P2002") {
							return res.sendStatus(400);
						} else {
							console.log(e);
							return res.sendStatus(500);
						}
					});
			});
		} else {
			insertChanges({ username: req.body.username.trim() })
				.then((d) => {
					req.session.adminId = d.username;
					res.status(201).json({
						username: d.username,
					});
					return;
				})
				.catch((e) => {
					if (e.code === "P2002") {
						return res.sendStatus(400);
					} else {
						console.log(e);
						return res.sendStatus(500);
					}
				});
		}
	}
});

export = router;
