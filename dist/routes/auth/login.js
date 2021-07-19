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
var router = express_1["default"].Router();
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// argon2 for password verification
var argon2_1 = __importDefault(require("argon2"));
// User login
router.post("/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var uuid, roomName, name, password, checkRoom, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.body.room || !req.body.password) {
                    res.sendStatus(400);
                    return [2 /*return*/];
                }
                if (!req.session.roomId) return [3 /*break*/, 2];
                uuid = req.session.roomId;
                return [4 /*yield*/, prisma.room
                        .findFirst({
                        select: {
                            name: true
                        },
                        where: {
                            uuid: req.session.roomId
                        }
                    })["catch"](function (e) {
                        console.log(e);
                        res.sendStatus(500);
                        return;
                    })];
            case 1:
                roomName = _a.sent();
                res.json({
                    loggedIn: null,
                    uuid: uuid,
                    message: "User already logged into '" + roomName + "'"
                });
                return [2 /*return*/];
            case 2:
                name = String(req.body.room);
                password = String(req.body.password);
                return [4 /*yield*/, prisma.room.findFirst({
                        select: {
                            uuid: true,
                            name: true,
                            pass_hashed: true
                        },
                        where: {
                            name: name
                        }
                    })];
            case 3:
                checkRoom = _a.sent();
                _a.label = 4;
            case 4:
                _a.trys.push([4, 8, , 9]);
                if (!checkRoom) return [3 /*break*/, 6];
                return [4 /*yield*/, argon2_1["default"].verify(checkRoom.pass_hashed, password).then(function (bool) {
                        if (bool) {
                            // Login user
                            var uuid = checkRoom.uuid;
                            req.session.roomId = uuid;
                            res.status(200).json({
                                loggedIn: true,
                                uuid: uuid,
                                message: "User logged in successfully"
                            });
                            return;
                        }
                        else {
                            res.status(401).json({
                                loggedIn: false,
                                message: "Wrong credentials"
                            });
                            return;
                        }
                    })];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                res.status(401).json({
                    loggedIn: false,
                    message: "Wrong credentials"
                });
                return [2 /*return*/];
            case 7: return [3 /*break*/, 9];
            case 8:
                e_1 = _a.sent();
                console.log(e_1);
                res.status(500).json({
                    loggedIn: false,
                    message: "Internal Server Error"
                });
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
//# sourceMappingURL=login.js.map