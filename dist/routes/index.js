"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var express_1 = __importDefault(require("express"));
var router = express_1["default"].Router();
var admin_1 = __importDefault(require("./admin"));
var auth_1 = __importDefault(require("./auth"));
var videos_1 = __importDefault(require("./videos"));
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
router.use("/admin", admin_1["default"]);
router.use("/auth", auth_1["default"]);
router.use("/videos", videos_1["default"]);
module.exports = router;
//# sourceMappingURL=index.js.map