import { NextFunction, Request, Response } from "express";
import expressRouter from "express";
const router = expressRouter.Router();

import admin from "./admin";
import auth from "./auth";
import videos from "./videos";

// const checkUser = (req: Request, res: Response, next: NextFunction) => {
// 	if (req.session.user) {
// 		next();
// 	} else {
// 		console.log(req.headers.cookie);
// 		return res.status(401).json({
// 			authorized: false,
// 			message: "You are not authorized to view this page.",
// 		});
// 	}
// };

router.use("/admin", admin);
router.use("/auth", auth);
router.use("/videos", videos);

export = router;
