"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var express_1 = __importDefault(require("express"));
var router = express_1["default"].Router();
// Admin logout
router.get("/logout", function (req, res) {
    try {
        if (req.session.roomId) {
            // empty adminId to only log admin out of admin panel (not room)
            req.session.adminId = "";
        }
        else {
            // Fully destroy admin session
            req.session.destroy(function (err) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }
            });
        }
        res.json({
            loggedOut: true,
            message: "User logged out successfully"
        });
    }
    catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
});
module.exports = router;
//# sourceMappingURL=logout.js.map