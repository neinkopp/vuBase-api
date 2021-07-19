"use strict";
// Video processing class
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.__esModule = true;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var events_1 = __importDefault(require("events"));
var fs_1 = __importDefault(require("fs"));
var fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
var chalk_1 = __importDefault(require("chalk"));
var VideoProcessing = /** @class */ (function (_super) {
    __extends(VideoProcessing, _super);
    // Get video file reference and video data
    function VideoProcessing(fileDefinition, videoData) {
        var _this = _super.call(this) || this;
        _this.appRoot = process.env.NODE_APP_ROOT;
        // Processing state codes
        // 0 = error | 1 = initial state | 2 = encoding | 3 = video online
        _this.processingState = 1;
        // encoding progress
        _this.progress = 0;
        _this.file = fileDefinition;
        _this.videoData = videoData;
        return _this;
    }
    // Prettier/Better console log
    VideoProcessing.prototype.log = function (type, msg) {
        switch (type) {
            case "error":
                console.log(chalk_1["default"].red("[" + new Date().toLocaleString("de-DE") + "][Error] [" + this.videoData.uuid + "] ") + ("" + msg));
                break;
            case "info":
                console.log(chalk_1["default"].blue("[" + new Date().toLocaleString("de-DE") + "][Info]  [" + this.videoData.uuid + "] ") + ("" + msg));
                break;
            case "warn":
                console.log(chalk_1["default"].yellow("[" + new Date().toLocaleString("de-DE") + "][Warn]  [" + this.videoData.uuid + "] ") + ("" + msg));
            case "success":
                console.log(chalk_1["default"].green("[" + new Date().toLocaleString("de-DE") + "][Success] [" + this.videoData.uuid + "] ") + ("" + msg));
        }
    };
    // Validate that video does not exist
    VideoProcessing.prototype.dataValidation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var videoName, subjectId, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, prisma.video.findFirst({
                                where: {
                                    title: this.videoData.title
                                }
                            })];
                    case 1:
                        videoName = _a.sent();
                        return [4 /*yield*/, prisma.subject.findFirst({
                                where: {
                                    uuid: this.videoData.subject
                                }
                            })];
                    case 2:
                        subjectId = _a.sent();
                        if (videoName === null && subjectId !== null) {
                            return [2 /*return*/, true];
                        }
                        else {
                            return [2 /*return*/, false];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this.abort(e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Custom abort function with rollback in every uploading state
    VideoProcessing.prototype.abort = function (err) {
        return __awaiter(this, void 0, void 0, function () {
            var uuid, _a, videoOnline, e_2, e_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        !err
                            ? (err = "An error happened in processing stage " + this.processingState)
                            : null;
                        uuid = this.videoData.uuid;
                        _a = this.processingState;
                        switch (_a) {
                            case 1: return [3 /*break*/, 1];
                            case 2 || 0: return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 15];
                    case 1:
                        this.log("error", err);
                        this.log("warn", "Aborting due to an error...");
                        this.emit("abort", 400);
                        fs_1["default"].unlinkSync(this.file.tempFilePath);
                        return [4 /*yield*/, prisma.processing.findFirst({
                                where: { uuid: uuid, status: 3 },
                                select: { status: true }
                            })];
                    case 2:
                        videoOnline = _b.sent();
                        if (!(videoOnline && videoOnline.status === 3)) return [3 /*break*/, 8];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, prisma.processing["delete"]({
                                where: { uuid: uuid }
                            })];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, prisma.video["delete"]({
                                where: { uuid: uuid }
                            })];
                    case 5:
                        _b.sent();
                        this.log("info", "Successfully aborted all running tasks.");
                        return [3 /*break*/, 7];
                    case 6:
                        e_2 = _b.sent();
                        console.log(e_2);
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        console.log("S:", videoOnline === null || videoOnline === void 0 ? void 0 : videoOnline.status);
                        _b.label = 9;
                    case 9: return [3 /*break*/, 15];
                    case 10:
                        this.log("error", err);
                        this.log("warn", "Aborting due to an error...");
                        // clear directories
                        fs_1["default"].rmSync("/storage/" + uuid, { recursive: true, force: true });
                        fs_1["default"].unlinkSync(this.file.tempFilePath);
                        _b.label = 11;
                    case 11:
                        _b.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, prisma.processing.update({
                                where: { uuid: uuid },
                                data: {
                                    status: 0
                                }
                            })];
                    case 12:
                        _b.sent();
                        this.log("info", "Successfully aborted all running tasks.");
                        return [3 /*break*/, 14];
                    case 13:
                        e_3 = _b.sent();
                        this.log("error", "An error occured in the abortion phase:");
                        console.log(e_3);
                        return [3 /*break*/, 14];
                    case 14: return [3 /*break*/, 15];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    // Unlink temporary stored video file
    VideoProcessing.prototype.unlinkTmpFile = function () {
        fs_1["default"].unlinkSync(this.file.tempFilePath);
    };
    // Entry point for video processing
    VideoProcessing.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var uuid, dataValidation, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uuid = this.videoData.uuid;
                        return [4 /*yield*/, this.dataValidation()];
                    case 1:
                        dataValidation = _a.sent();
                        if (!(dataValidation === true)) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        this.processingState = 2;
                        // Create video entry in database
                        return [4 /*yield*/, prisma.video.create({
                                data: {
                                    uuid: uuid,
                                    title: this.videoData.title,
                                    desc: this.videoData.desc,
                                    subject: {
                                        connect: {
                                            uuid: this.videoData.subject
                                        }
                                    },
                                    processing: {
                                        create: {
                                            progress: 0,
                                            status: this.processingState
                                        }
                                    }
                                }
                            })];
                    case 3:
                        // Create video entry in database
                        _a.sent();
                        this.emit("start");
                        // Encode video
                        this.encode();
                        return [3 /*break*/, 5];
                    case 4:
                        e_4 = _a.sent();
                        return [2 /*return*/, this.abort(e_4)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    VideoProcessing.prototype.encode = function () {
        var _this = this;
        fs_1["default"].mkdirSync(this.appRoot + "/storage/" + this.videoData.uuid + "/360p/", {
            recursive: true
        });
        fs_1["default"].mkdirSync(this.appRoot + "/storage/" + this.videoData.uuid + "/1080p/", {
            recursive: true
        });
        // FFmpeg encoding settings for 360p && 1080p
        fluent_ffmpeg_1["default"](this.file.tempFilePath)
            // 360p
            .output(this.appRoot + "/storage/" + this.videoData.uuid + "/360p/360p.m3u8")
            .videoCodec("libx264")
            .addOption(["-crf 24"])
            .addOption("-hls_time", "10")
            .addOption("-hls_playlist_type", "vod")
            .addOption("-hls_list_size", "0")
            .size("640x?")
            .aspect("16:9")
            .fps(30)
            // 1080p
            .output(this.appRoot + "/storage/" + this.videoData.uuid + "/1080p/1080p.m3u8")
            .videoCodec("libx264")
            .addOption(["-crf 24"])
            .addOption("-hls_time", "10")
            .addOption("-hls_playlist_type", "vod")
            .addOption("-hls_list_size", "0")
            .size("1920x?")
            .aspect("16:9")
            .fps(30)
            // Setup event handlers
            .on("start", function () {
            return console.log("[" + _this.videoData.uuid + "]: Processing started.");
        })
            .on("progress", function (progress) { return _this.processingProgress(progress); })
            .on("end", function () {
            console.log("[" + _this.videoData.uuid + "]: Successfully converted into HLS stream.");
            // Unlink original video file
            _this.unlinkTmpFile();
            _this.generateRootPlaylist();
        })
            .on("error", function (err, stdout, stderr) {
            _this.abort(err.message);
            console.log(stderr);
        })
            // Run FFmpeg command
            .run();
    };
    // Update processing progress
    VideoProcessing.prototype.processingProgress = function (progress) {
        return __awaiter(this, void 0, void 0, function () {
            var roundedProgress;
            return __generator(this, function (_a) {
                roundedProgress = Math.round(progress.percent / 5) * 5;
                if (this.progress < roundedProgress) {
                    if (isNaN(this.progress)) {
                        return [2 /*return*/, false];
                    }
                    this.progress = roundedProgress;
                    console.log("Processing \"" + this.videoData.uuid + "\": " + this.progress + "% done, " + progress.targetSize + "kb target size");
                    prisma.processing
                        .update({
                        where: {
                            uuid: this.videoData.uuid
                        },
                        data: {
                            progress: this.progress
                        }
                    })["catch"](function (e) { return e; });
                }
                return [2 /*return*/];
            });
        });
    };
    // Generate HLS root playlist with calculated bitrate
    VideoProcessing.prototype.generateRootPlaylist = function () {
        return __awaiter(this, void 0, void 0, function () {
            var masterPlaylist;
            return __generator(this, function (_a) {
                try {
                    masterPlaylist = fs_1["default"].createWriteStream(this.appRoot + "/storage/" + this.videoData.uuid + "/playlist.m3u8", {
                        flags: "a"
                    });
                    masterPlaylist.write("#EXTM3U\n");
                    masterPlaylist.write("#EXT-X-VERSION:3\n");
                    masterPlaylist.write("#EXT-X-STREAM-INF:BANDWIDTH=" + Math.round(640 * 360 * 30 * this.videoData.motionFactor * 0.07) + ",RESOLUTION=640x360\n");
                    masterPlaylist.write("360p/360p.m3u8\n");
                    masterPlaylist.write("#EXT-X-STREAM-INF:BANDWIDTH=" + Math.round(1920 * 1080 * 30 * this.videoData.motionFactor * 0.07) + ",RESOLUTION=1920x1080\n");
                    masterPlaylist.write("1080p/1080p.m3u8");
                    masterPlaylist.close();
                }
                catch (e) {
                    this.abort(e);
                }
                finally {
                    console.log("[" + this.videoData.uuid + "]: Created master playlist.");
                    this.finishUpload();
                }
                return [2 /*return*/];
            });
        });
    };
    // Finalize
    VideoProcessing.prototype.finishUpload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, prisma.video.update({
                                where: {
                                    uuid: this.videoData.uuid
                                },
                                data: {
                                    added: new Date().toISOString(),
                                    processing: {
                                        update: {
                                            status: 3
                                        }
                                    }
                                }
                            })];
                    case 1:
                        _a.sent();
                        this.processingState = 3;
                        this.log("success", "Video is online.");
                        return [3 /*break*/, 3];
                    case 2:
                        e_5 = _a.sent();
                        this.abort(e_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return VideoProcessing;
}(events_1["default"]));
exports["default"] = VideoProcessing;
//# sourceMappingURL=index.js.map