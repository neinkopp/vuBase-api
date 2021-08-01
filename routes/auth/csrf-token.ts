import expressRouter from "express";
// Router settings
const router = expressRouter.Router();

router.get("/csrf-token", (req, res) => {
	res.json({ csrfToken: req.csrfToken() });
});

export = router;
