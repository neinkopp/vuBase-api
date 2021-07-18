import expressRouter from "express";
const router = expressRouter.Router();

// Admin logout
router.get("/logout", (req, res) => {
	try {
		if (req.session.roomId) {
			// empty adminId to only log admin out of admin panel (not room)
			req.session.adminId = "";
		} else {
			// Fully destroy admin session
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
