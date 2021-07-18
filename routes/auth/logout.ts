import expressRouter from "express";
const router = expressRouter.Router();

// User logout
router.get("/logout", (req, res) => {
	try {
		if (req.session.adminId) {
			// empty roomId to only log admin out of room (not admin panel)
			req.session.roomId = "";
		} else {
			// Fully destroy user session
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
