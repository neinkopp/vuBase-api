import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import argon2 from "argon2";
import crypt from "crypto-random-string";

// Upsert default admin user with random password
try {
	argon2
		.hash(crypt({ length: 20, type: "ascii-printable" }))
		.then(async (p) => {
			const upsert = await prisma.adminUser.upsert({
				create: {
					username: "default",
					pass_hashed: p,
					latest_login: new Date().toISOString(),
				},
				update: {
					pass_hashed: p,
				},
				where: { username: "default" },
			});
			console.log("Successfully upserted user '" + upsert.username + "'");
			console.log("NODE_APP_ROOT = " + process.env.NODE_APP_ROOT);
			console.log("NODE_ENV = " + process.env.NODE_ENV);
			process.exit(0);
		});
} catch (e) {
	console.log(e);
	process.exit(1);
}
