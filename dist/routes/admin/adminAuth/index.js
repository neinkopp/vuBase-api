"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var express_1 = __importDefault(require("express"));
var login_1 = __importDefault(require("./login"));
var logout_1 = __importDefault(require("./logout"));
var restore_1 = __importDefault(require("./restore"));
var csrf_token_1 = __importDefault(require("./csrf-token"));
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// argon2 for password hashing
var argon2_1 = __importDefault(require("argon2"));
// Router settings
var router = express_1["default"].Router();
router.use(login_1["default"]);
router.use(logout_1["default"]);
router.use(restore_1["default"]);
router.use(csrf_token_1["default"]);
// Check if admin is authenticated
router.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var username, isAuth;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.session.adminId) return [3 /*break*/, 2];
                username = req.session.adminId;
                return [4 /*yield*/, prisma.adminUser
                        .update({
                        data: {
                            latest_login: new Date().toISOString()
                        },
                        select: {
                            username: true,
                            latest_login: true
                        },
                        where: { username: username }
                    })["catch"](function (e) {
                        console.log(e);
                        res.sendStatus(500);
                        return;
                    })];
            case 1:
                isAuth = _a.sent();
                if (isAuth) {
                    res.json({
                        authorized: true,
                        username: isAuth.username,
                        message: "User is authorized."
                    });
                    return [2 /*return*/];
                }
                else {
                    console.log(3);
                    req.session.destroy(function (err) {
                        if (err) {
                            console.log(err);
                            res.sendStatus(500);
                            return;
                        }
                    });
                    res.json({
                        authorized: false,
                        message: "User is unauthorized."
                    });
                }
                return [3 /*break*/, 3];
            case 2:
                res.json({
                    authorized: false,
                    message: "User is unauthorized."
                });
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
// Edit admin profile settings
router.patch("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var insertChanges_1;
    return __generator(this, function (_a) {
        if (!req.session.adminId) {
            res.sendStatus(401);
            return [2 /*return*/];
        }
        else if (!req.body.password.trim() && !req.body.username.trim()) {
            res.sendStatus(400);
            return [2 /*return*/];
        }
        else {
            insertChanges_1 = function (data) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, prisma.adminUser.update({
                                where: {
                                    username: req.session.adminId
                                },
                                data: data
                            })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); };
            // Different scenarios for each case
            if (req.body.password) {
                argon2_1["default"].hash(req.body.password.trim()).then(function (p) {
                    var data = {
                        pass_hashed: p,
                        username: req.body.username.trim()
                            ? req.body.username.trim()
                            : undefined
                    };
                    insertChanges_1(data)
                        .then(function (d) {
                        req.session.adminId = d.username;
                        res.status(201).json({
                            username: d.username
                        });
                        return;
                    })["catch"](function (e) {
                        if (e.code === "P2002") {
                            return res.sendStatus(400);
                        }
                        else {
                            console.log(e);
                            return res.sendStatus(500);
                        }
                    });
                });
            }
            else {
                insertChanges_1({ username: req.body.username.trim() })
                    .then(function (d) {
                    req.session.adminId = d.username;
                    res.status(201).json({
                        username: d.username
                    });
                    return;
                })["catch"](function (e) {
                    if (e.code === "P2002") {
                        return res.sendStatus(400);
                    }
                    else {
                        console.log(e);
                        return res.sendStatus(500);
                    }
                });
            }
        }
        return [2 /*return*/];
    });
}); });
module.exports = router;
//# sourceMappingURL=index.js.map