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
var fs_1 = __importDefault(require("fs"));
var uuid_1 = require("uuid");
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// Create new subject
router.post("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var name, uuid, result, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                name = req.body.name;
                uuid = uuid_1.v4();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.subject.create({
                        data: {
                            name: name,
                            uuid: uuid
                        },
                        select: {
                            id: false,
                            uuid: true,
                            name: true
                        }
                    })];
            case 2:
                result = _a.sent();
                res.status(201).json(result);
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                if (e_1.code === "P2002") {
                    // Unique constraint violation
                    res.status(400).json({
                        error: "Name already exists"
                    });
                }
                else {
                    console.log(e_1);
                    res.sendStatus(500);
                }
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Get subject list
router.get("/", function (_, res) {
    prisma.subject
        .findMany({
        select: {
            name: true,
            uuid: true
        }
    })
        .then(function (data) { return res.send(data); })["catch"](function (e) {
        console.log(e);
        res.sendStatus(500);
    });
});
// Get specific subject data
router.patch("/:uuid", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var uuid, name, result, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                uuid = req.params.uuid;
                name = req.body.name;
                return [4 /*yield*/, prisma.subject.update({
                        where: { uuid: uuid },
                        data: { name: name }
                    })];
            case 1:
                result = _a.sent();
                res.status(201).json({ name: result.name, uuid: result.uuid });
                return [3 /*break*/, 3];
            case 2:
                e_2 = _a.sent();
                console.log(e_2);
                res.sendStatus(500);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Delete subject (with all videos in it)
router["delete"]("/:uuid", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var uuid, videosNotProcessed, videosToDelete, deleteProcessingStatus, deleteVideoEntries, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                uuid = req.params.uuid;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, prisma.video.findFirst({
                        where: {
                            subjectId: uuid,
                            processing: {
                                isNot: {
                                    progress: 3
                                }
                            }
                        }
                    })];
            case 2:
                videosNotProcessed = _a.sent();
                if (videosNotProcessed) {
                    res.sendStatus(400);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.subject.findFirst({
                        where: { uuid: uuid },
                        select: {
                            videos: {
                                select: {
                                    uuid: true
                                }
                            }
                        }
                    })];
            case 3:
                videosToDelete = _a.sent();
                return [4 /*yield*/, prisma.processing.deleteMany({
                        where: {
                            video: {
                                subjectId: uuid
                            }
                        }
                    })];
            case 4:
                deleteProcessingStatus = _a.sent();
                if (videosToDelete) {
                    // Delete all video files for each entry
                    videosToDelete.videos.map(function (v) {
                        var appRoot = process.env.NODE_APP_ROOT;
                        fs_1["default"].rmSync(appRoot + "/storage/" + v.uuid, {
                            recursive: true,
                            force: true
                        });
                    });
                }
                return [4 /*yield*/, prisma.video.deleteMany({
                        where: {
                            subjectId: uuid
                        }
                    })];
            case 5:
                deleteVideoEntries = _a.sent();
                prisma.subject["delete"]({
                    where: { uuid: uuid }
                })
                    .then(function () {
                    res.sendStatus(204);
                });
                return [3 /*break*/, 7];
            case 6:
                e_3 = _a.sent();
                console.log(e_3);
                res.sendStatus(500);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
//# sourceMappingURL=index.js.map