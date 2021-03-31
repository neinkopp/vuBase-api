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
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var express_session_1 = __importDefault(require("express-session"));
var routes_1 = __importDefault(require("./routes"));
var prisma_session_store_1 = require("@quixo3/prisma-session-store");
var client_1 = require("@prisma/client");
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var cors_1 = __importDefault(require("cors"));
var express_fileupload_1 = __importDefault(require("express-fileupload"));
var os_1 = __importDefault(require("os"));
var app = express_1["default"]();
app.use(cors_1["default"]({
    origin: ["https://vubase.de", "https://admin.vubase.de"],
    methods: ["POST", "GET", "PATCH", "DELETE"],
    credentials: true
}));
// cookie middleware
app.use(cookie_parser_1["default"]());
// json parser
app.use(express_1["default"].json());
// urlencoded file parser
app.use(express_1["default"].urlencoded({ extended: false }));
// express-fileupload
app.use(express_fileupload_1["default"]({
    useTempFiles: true,
    tempFileDir: os_1["default"].tmpdir()
}));
var prisma = new client_1.PrismaClient();
var sess = {
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    },
    secret: "xxxxxxxxxxxxx",
    store: new prisma_session_store_1.PrismaSessionStore(prisma, {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined
    })
};
if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
}
app.get("/testing", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var video;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.video.findFirst({
                    where: {
                        title: "blablabla"
                    }
                })];
            case 1:
                video = _a.sent();
                res.json(video);
                return [2 /*return*/];
        }
    });
}); });
app.use(express_session_1["default"](sess));
var port = 4000;
app.use("/", routes_1["default"]);
app.listen(port, function () {
    console.log("App root is: " + process.env.NODE_APP_ROOT);
    console.log("Server listening on port " + port);
});
//# sourceMappingURL=index.js.map