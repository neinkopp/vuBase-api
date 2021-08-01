"use strict";
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
var csurf_1 = __importDefault(require("csurf"));
var express_rate_limit_1 = __importDefault(require("express-rate-limit"));
var express_fileupload_1 = __importDefault(require("express-fileupload"));
var os_1 = __importDefault(require("os"));
var app = express_1["default"]();
app.use(cors_1["default"]({
    origin: [
        "https://vubase.de",
        "https://admin.vubase.de",
        app.get("env") !== "production" ? "http://localhost:3000" : "",
        app.get("env") !== "production" ? "http://localhost:3001" : "",
    ],
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
    tempFileDir: os_1["default"].tmpdir(),
    safeFileNames: true
}));
var prisma = new client_1.PrismaClient();
var sess = {
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false
    },
    secret: process.env.SESSION_COOKIE_SECRET
        ? process.env.SESSION_COOKIE_SECRET
        : "",
    store: new prisma_session_store_1.PrismaSessionStore(prisma, {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined
    })
};
if (app.get("env") === "production") {
    console.log("secure");
    app.set("trust proxy", 1); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
    sess.cookie.sameSite = "none"; // serve same-site cookies
}
app.use(express_session_1["default"](sess));
app.use(csurf_1["default"]({
    cookie: false
}));
var limiter = express_rate_limit_1["default"]({
    windowMs: 5 * 60 * 1000,
    max: 100
});
//  apply to all requests
app.use(limiter);
var port = 4000;
app.use("/", routes_1["default"]);
app.listen(port, function () {
    console.log("App root is: " + process.env.NODE_APP_ROOT);
    console.log("Server listening on port " + port);
});
//# sourceMappingURL=index.js.map