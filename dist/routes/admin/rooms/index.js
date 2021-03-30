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
var argon2_1 = __importDefault(require("argon2"));
var uuid_1 = require("uuid");
router.post("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var uuid, name, pass_hashed, result, e_1, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.body.name || !req.body.password) {
                    res.sendStatus(400);
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 7, , 8]);
                uuid = uuid_1.v4();
                name = req.body.name;
                return [4 /*yield*/, argon2_1["default"].hash(req.body.password)];
            case 2:
                pass_hashed = _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, prisma.room.create({
                        data: { uuid: uuid, name: name, pass_hashed: pass_hashed }
                    })];
            case 4:
                result = _a.sent();
                res.status(201).json({ name: result.name, uuid: result.uuid });
                return [3 /*break*/, 6];
            case 5:
                e_1 = _a.sent();
                if (e_1.code === "P2002") {
                    res.status(400).json({
                        error: "Name already exists"
                    });
                }
                else {
                    res.sendStatus(500);
                }
                return [3 /*break*/, 6];
            case 6: return [3 /*break*/, 8];
            case 7:
                e_2 = _a.sent();
                console.log(e_2);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
router.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.room.findMany({
                        select: { uuid: true, name: true }
                    })];
            case 1:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 3];
            case 2:
                e_3 = _a.sent();
                res.sendStatus(500);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.patch("/:uuid", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var uuid, name, updateRoom, sendResults, pass_hashed, pass_hashed;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.uuid) {
                    res.sendStatus(400);
                    return [2 /*return*/];
                }
                uuid = req.params.uuid;
                name = req.body.name;
                updateRoom = function (data) { return __awaiter(void 0, void 0, void 0, function () {
                    var results, e_4;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, prisma.room.update({
                                        data: data,
                                        where: {
                                            uuid: uuid
                                        }
                                    })];
                            case 1:
                                results = _a.sent();
                                sendResults(results);
                                return [3 /*break*/, 3];
                            case 2:
                                e_4 = _a.sent();
                                console.log(e_4);
                                res.sendStatus(500);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); };
                sendResults = function (data) {
                    res.json(data);
                };
                if (!(req.body.name && req.body.password)) return [3 /*break*/, 3];
                return [4 /*yield*/, argon2_1["default"].hash(req.body.password)];
            case 1:
                pass_hashed = _a.sent();
                return [4 /*yield*/, updateRoom({ name: name, pass_hashed: pass_hashed })];
            case 2:
                _a.sent();
                return [3 /*break*/, 9];
            case 3:
                if (!req.body.name) return [3 /*break*/, 5];
                return [4 /*yield*/, updateRoom({ name: name })];
            case 4:
                _a.sent();
                return [3 /*break*/, 9];
            case 5:
                if (!req.body.password) return [3 /*break*/, 8];
                return [4 /*yield*/, argon2_1["default"].hash(req.body.password)];
            case 6:
                pass_hashed = _a.sent();
                return [4 /*yield*/, updateRoom({ name: name, pass_hashed: pass_hashed })];
            case 7:
                _a.sent();
                return [3 /*break*/, 9];
            case 8: return [2 /*return*/, res.sendStatus(400)];
            case 9: return [2 /*return*/];
        }
    });
}); });
router["delete"]("/:uuid", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var uuid, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.uuid) {
                    return [2 /*return*/, res.sendStatus(400)];
                }
                uuid = req.params.uuid;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.room["delete"]({
                        where: { uuid: uuid }
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/, res.sendStatus(204)];
            case 3:
                e_5 = _a.sent();
                return [2 /*return*/, res.status(500).json({
                        error: "Internal Server error"
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/:uuid/verify/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var uuid, result, verify, e_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.uuid || !req.body.password) {
                    res.sendStatus(400);
                    return [2 /*return*/];
                }
                uuid = req.params.uuid;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, prisma.room.findFirst({
                        where: { uuid: uuid }
                    })];
            case 2:
                result = _a.sent();
                if (!result || typeof result.pass_hashed == "undefined") {
                    res.sendStatus(400);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, argon2_1["default"].verify(result.pass_hashed, req.body.password)];
            case 3:
                verify = _a.sent();
                return [2 /*return*/, res.json(verify)];
            case 4:
                e_6 = _a.sent();
                res.sendStatus(500);
                console.log(e_6);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.post("/:uuid/videos", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var uuid, body, e_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.uuid) {
                    res.sendStatus(400);
                    return [2 /*return*/];
                }
                uuid = req.params.uuid;
                body = req.body;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                if (!(body.video && typeof body.video === "string")) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.room.update({
                        where: { uuid: uuid },
                        data: {
                            videos: {
                                connect: {
                                    uuid: body.video
                                }
                            }
                        }
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                res.sendStatus(400);
                return [2 /*return*/];
            case 4:
                res.sendStatus(201);
                return [3 /*break*/, 6];
            case 5:
                e_7 = _a.sent();
                res.sendStatus(500);
                console.log(e_7);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.get("/:uuid/videos", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var uuid, videos, e_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.uuid) {
                    res.sendStatus(400);
                    return [2 /*return*/];
                }
                uuid = req.params.uuid;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.room.findFirst({
                        where: { uuid: uuid },
                        select: {
                            videos: {
                                select: {
                                    uuid: true,
                                    title: true,
                                    desc: true,
                                    subject: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    })];
            case 2:
                videos = _a.sent();
                res.send(videos);
                return [3 /*break*/, 4];
            case 3:
                e_8 = _a.sent();
                res.sendStatus(500);
                console.log(e_8);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router["delete"]("/:uuid/videos/:video", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var uuid, video, e_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.uuid || !req.params.video) {
                    res.sendStatus(400);
                }
                uuid = req.params.uuid;
                video = req.params.video;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.room.update({
                        where: { uuid: uuid },
                        data: {
                            videos: {
                                disconnect: {
                                    uuid: video
                                }
                            }
                        }
                    })];
            case 2:
                _a.sent();
                res.sendStatus(204);
                return [3 /*break*/, 4];
            case 3:
                e_9 = _a.sent();
                res.sendStatus(500);
                console.log(e_9);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
//# sourceMappingURL=index.js.map