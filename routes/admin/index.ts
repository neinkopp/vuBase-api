import expressRouter, { NextFunction, Request, Response } from "express";
const router = expressRouter.Router();

import auth from "./adminAuth";
import subjects from "./subjects";
import rooms from "./rooms";
import videos from "./videos";

// Generate Prisma client
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// isAuth middleware
const isAuth = async (req: Request, res: Response, next: NextFunction) => {
	if (req.session.adminId) {
		const isAuth = await prisma.adminUser
			.update({
				data: {
					latest_login: new Date().toISOString(),
				},
				select: {
					latest_login: true,
				},
				where: { username: req.session.adminId },
			})
			.then((res) => res?.latest_login)
			.catch((e) => {
				console.log(e);
				res.sendStatus(500);
				return false;
			});
		if (isAuth) {
			return next();
		} else {
			return res.sendStatus(401);
		}
	} else {
		res.sendStatus(401);
		return false;
	}
};

// Router settings
// Use isAuth middleware when needed
router.use("/auth", auth);
router.use("/subjects", isAuth, subjects);
router.use("/rooms", isAuth, rooms);
router.use("/videos", isAuth, videos);

export = router;
