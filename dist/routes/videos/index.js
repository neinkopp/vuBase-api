"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var client_1 = require("@prisma/client");
var short_uuid_1 = __importDefault(require("short-uuid"));
var fs_1 = __importDefault(require("fs"));
// short UUID translator
var translator = short_uuid_1["default"]();
var router = express_1["default"].Router();
// Generate Prisma client
var prisma = new client_1.PrismaClient();
// Get video list
router.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var uuid_1, videos, filteredVideos, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.session.roomId) {
                    // Not authenticated into any room
                    res.sendStatus(401);
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                uuid_1 = req.session.roomId;
                return [4 /*yield*/, prisma.room.findFirst({
                        where: {
                            uuid: uuid_1
                        },
                        select: {
                            videos: {
                                where: {
                                    processing: {
                                        status: {
                                            equals: 3
                                        }
                                    }
                                },
                                select: {
                                    uuid: true,
                                    title: true,
                                    desc: true,
                                    subject: {
                                        select: {
                                            name: true
                                        }
                                    }
                                },
                                orderBy: {
                                    title: "asc"
                                }
                            }
                        }
                    })];
            case 2:
                videos = _a.sent();
                filteredVideos = videos === null || videos === void 0 ? void 0 : videos.videos.map(function (v) {
                    return __assign(__assign({}, v), { uuid: translator.fromUUID(v.uuid) });
                });
                res.send(filteredVideos);
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                res.sendStatus(500);
                console.log(e_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Get specific video; serve HLS chunks/playlist
router.get("/:uuid/:url(*)", function (req, res) {
    if (!req.session.roomId) {
        res.sendStatus(401);
        return;
    }
    if (!require.main) {
        res.sendStatus(500);
        return;
    }
    if (!req.params.uuid) {
        res.sendStatus(400);
        return;
    }
    else if (!req.session.roomId) {
        res.status(401).json({
            message: "Wrong room",
            paramsUuid: req.params.uuid
        });
        return;
    }
    var uuid = req.session.roomId;
    // Verify that video is online
    prisma.room
        .findFirst({
        where: {
            uuid: uuid,
            videos: {
                some: {
                    uuid: req.params.uuid
                }
            }
        },
        select: {
            videos: {
                where: {
                    processing: {
                        status: {
                            equals: 3
                        }
                    }
                }
            }
        }
    })
        .then(function (data) {
        if (!data) {
            res.status(403).json({
                message: "Wrong room"
            });
        }
        else {
            // Serve files out of storage folder
            var filePath = req.params.uuid + "/" + req.params.url;
            if (filePath.indexOf(".") !== filePath.lastIndexOf(".")) {
                res.status(400).json({
                    message: "File path not allowed"
                });
                return;
            }
            fs_1["default"].createReadStream(process.env.NODE_APP_ROOT + "/storage/" + filePath)
                .on("error", function (e) {
                console.log(e);
                res.sendStatus(404);
                return;
            })
                .pipe(res);
        }
    })["catch"](function (e) {
        console.log(e);
        res.sendStatus(500);
    });
});
module.exports = router;
//# sourceMappingURL=index.js.map