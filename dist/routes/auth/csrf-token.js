"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var express_1 = __importDefault(require("express"));
// Router settings
var router = express_1["default"].Router();
router.get("/csrf-token", function (req, res) {
    res.json({ csrfToken: req.csrfToken() });
});
module.exports = router;
//# sourceMappingURL=csrf-token.js.map