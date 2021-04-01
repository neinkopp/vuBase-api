import expressRouter from "express";
const router = expressRouter.Router();

router.get("/logout", (req, res) => {
	try {
		if (req.session.adminId) {
			req.session.adminId = undefined;
		} else {
			req.session.destroy((err) => {
				if (err) {
					console.log(err);
					res.sendStatus(500);
					return;
				}
			});
		}
		res.json({
			loggedOut: true,
			message: "User logged out successfully",
		});
	} catch (e) {
		res.sendStatus(500);
		console.log(e);
	}
});

export = router;
