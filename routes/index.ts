import expressRouter from "express";
const router = expressRouter.Router();

import admin from "./admin";
import auth from "./auth";
import videos from "./videos";

// Router settings

router.use("/admin", admin);
router.use("/auth", auth);
router.use("/videos", videos);

export = router;
