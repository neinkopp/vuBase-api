"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var express_1 = __importDefault(require("express"));
var router = express_1["default"].Router();
router.get("/logout", function (req, res) {
    try {
        if (req.session.adminId) {
            req.session.roomId = "";
        }
        else {
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