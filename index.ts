import express from "express";
import expressSession from "express-session";
import routes from "./routes";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import cookies from "cookie-parser";
import cors from "cors";
import csrf from "csurf";
import rateLimit from "express-rate-limit";
import fileUpload from "express-fileupload";
import os from "os";

declare module "express-session" {
	interface SessionData {
		roomId: string;
		adminId: string;
	}
}

const app = express();

app.use(
	cors({
		origin: [
			"https://vubase.de",
			"https://admin.vubase.de",
			app.get("env") !== "production" ? "http://localhost:3000" : "",
			app.get("env") !== "production" ? "http://localhost:3001" : "",
		],
		methods: ["POST", "GET", "PATCH", "DELETE"],
		credentials: true,
	})
);

// cookie middleware
app.use(cookies());

// json parser
app.use(express.json());

// urlencoded file parser
app.use(express.urlencoded({ extended: false }));

// express-fileupload
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: os.tmpdir(),
		safeFileNames: true,
	})
);

const prisma = new PrismaClient();

const sess = {
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		secure: false,
	},
	secret: process.env.SESSION_COOKIE_SECRET
		? process.env.SESSION_COOKIE_SECRET
		: "",
	store: new PrismaSessionStore(prisma, {
		checkPeriod: 2 * 60 * 1000, //ms
		dbRecordIdIsSessionId: true,
		dbRecordIdFunction: undefined,
	}),
};

if (app.get("env") === "production") {
	console.log("secure");
	app.set("trust proxy", 1); // trust first proxy
	sess.cookie.secure = true; // serve secure cookies
}

app.use(expressSession(sess));

app.use(
	csrf({
		cookie: {
			key: "_csrf-vuBase",
			path: "/",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 3600, // 1-hour
		},
	})
);

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

const port = 4000;

app.use("/", routes);

app.listen(port, () => {
	console.log("App root is: " + process.env.NODE_APP_ROOT);
	console.log("Server listening on port " + port);
});
