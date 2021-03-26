import expressRouter from "express";
import login from "./login";
import logout from "./logout";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const router = expressRouter.Router();

router.use(login);
router.use(logout);

router.get("/", async (req, res) => {
	if (req.session.adminId) {
		const username = req.session.adminId;
		const isAuth = await prisma.adminUser
			.update({
				data: {
					latest_login: new Date().toISOString(),
				},
				select: {
					latest_login: true,
				},
				where: { username },
			})
			.then((res) => res?.latest_login)
			.catch((e) => {
				console.log(e);
				res.sendStatus(500);
				return;
			});
		if (isAuth) {
			res.json({
				authorized: true,
				message: "User is authorized.",
			});
			return;
		} else {
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

export = router;
