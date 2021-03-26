import expressRouter from "express";
import login from "./login";
import logout from "./logout";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const router = expressRouter.Router();

router.use(login);
router.use(logout);

router.get("/", async (req, res) => {
	if (req.session.roomId) {
		const uuid = req.session.roomId;
		const roomName = await prisma.room
			.findFirst({
				select: {
					name: true,
				},
				where: { uuid },
			})
			.then((res) => res?.name)
			.catch((e) => {
				console.log(e);
				res.sendStatus(500);
				return;
			});
		if (roomName) {
			res.json({
				authorized: true,
				room: req.session.roomId,
				roomName,
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
