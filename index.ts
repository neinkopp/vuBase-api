import express from "express";
import expressSession from "express-session";
import routes from "./routes";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import cookies from "cookie-parser";
import cors from "cors";
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
			"http://localhost:3000",
			"http://localhost:3001",
			"http://192.168.178.74:3000",
			"http://192.168.178.74:3001",
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
	})
);

const prisma = new PrismaClient();

const sess = {
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: false,
		maxAge: 7 * 24 * 60 * 60 * 1000, // ms
	},
	secret: "xxxxxxxxxxxxx",
	store: new PrismaSessionStore(prisma, {
		checkPeriod: 2 * 60 * 1000, //ms
		dbRecordIdIsSessionId: true,
		dbRecordIdFunction: undefined,
	}),
};

if (app.get("env") === "production") {
	app.set("trust proxy", 1); // trust first proxy
	sess.cookie.secure = true; // serve secure cookies
}

app.get("/testing", async (req, res) => {
	const video = await prisma.video.findFirst({
		where: {
			title: "blablabla",
		},
	});
	res.json(video);
});

app.use(expressSession(sess));

const port = 4000;

app.use("/", routes);

app.listen(port, () => {
	console.log("App root is: " + process.env.NODE_APP_ROOT);
	console.log("Server listening on port " + port);
});
