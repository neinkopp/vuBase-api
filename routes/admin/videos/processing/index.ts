import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import EventEmitter from "events";
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import chalk from "chalk";

interface VideoData {
	uuid: string;
	title: string;
	desc: string;
	subject: string;
	motionFactor: number;
}

export default class VideoProcessing extends EventEmitter {
	file: UploadedFile;
	videoData: VideoData;

	appRoot = process.env.NODE_APP_ROOT;

	// 0 = error | 1 = initial state | 2 = encoding | 3 = video online
	processingState = 1;
	// encoding progress
	progress = 0;

	constructor(fileDefinition: UploadedFile, videoData: VideoData) {
		super();
		this.file = fileDefinition;
		this.videoData = videoData;
	}

	private log(type: "error" | "warn" | "info" | "success", msg: string) {
		switch (type) {
			case "error":
				console.log(
					chalk.red(
						`[${new Date().toLocaleString("de-DE")}][Error] [${
							this.videoData.uuid
						}] `
					) + `${msg}`
				);
				break;
			case "info":
				console.log(
					chalk.blue(
						`[${new Date().toLocaleString("de-DE")}][Info]  [${
							this.videoData.uuid
						}] `
					) + `${msg}`
				);
				break;
			case "warn":
				console.log(
					chalk.yellow(
						`[${new Date().toLocaleString("de-DE")}][Warn]  [${
							this.videoData.uuid
						}] `
					) + `${msg}`
				);
			case "success":
				console.log(
					chalk.green(
						`[${new Date().toLocaleString("de-DE")}][Success] [${
							this.videoData.uuid
						}] `
					) + `${msg}`
				);
		}
	}

	private async dataValidation() {
		try {
			const videoName = await prisma.video.findFirst({
				where: {
					title: this.videoData.title,
				},
			});
			const subjectId = await prisma.subject.findFirst({
				where: {
					uuid: this.videoData.subject,
				},
			});
			if (videoName === null && subjectId !== null) {
				return true;
			} else {
				console.log(videoName, subjectId);
				return false;
			}
		} catch (e) {
			this.abort(e);
		}
	}

	private async abort(err?: string) {
		!err
			? (err = "An error happened in processing stage " + this.processingState)
			: null;
		const uuid = this.videoData.uuid;
		switch (this.processingState) {
			case 1:
				this.log("error", err);
				this.log("warn", "Aborting due to an error...");
				this.emit("abort", 400);
				fs.unlinkSync(this.file.tempFilePath);

				const videoOnline = await prisma.processing.findFirst({
					where: { uuid, status: 3 },
					select: { status: true },
				});
				if (videoOnline && videoOnline.status === 3) {
					try {
						await prisma.processing.delete({
							where: { uuid },
						});
						await prisma.video.delete({
							where: { uuid },
						});
						this.log("info", "Successfully aborted all running tasks.");
					} catch (e) {
						console.log(e);
					}
				} else {
					console.log("S:", videoOnline?.status);
				}
				break;
			case 2 || 0:
				this.log("error", err);
				this.log("warn", "Aborting due to an error...");
				// clear directories
				fs.rmSync("/storage/" + uuid, { recursive: true, force: true });
				fs.unlinkSync(this.file.tempFilePath);
				try {
					await prisma.processing.update({
						where: { uuid },
						data: {
							status: 0,
						},
					});
					this.log("info", "Successfully aborted all running tasks.");
				} catch (e) {
					this.log("error", "An error occured in the abortion phase:");
					console.log(e);
				}
				break;
		}
	}

	private unlinkTmpFile() {
		fs.unlinkSync(this.file.tempFilePath);
	}

	async start() {
		const uuid = this.videoData.uuid;
		const dataValidation = await this.dataValidation();
		if (dataValidation === true) {
			try {
				this.processingState = 2;
				await prisma.video.create({
					data: {
						uuid,
						title: this.videoData.title,
						desc: this.videoData.desc,
						subject: {
							connect: {
								uuid: this.videoData.subject,
							},
						},
						processing: {
							create: {
								progress: 0,
								status: this.processingState,
							},
						},
					},
				});
				this.emit("start");
				this.encode();
			} catch (e) {
				return this.abort(e);
			}
		}
	}

	private encode() {
		fs.mkdirSync(this.appRoot + "/storage/" + this.videoData.uuid + "/360p/", {
			recursive: true,
		});
		fs.mkdirSync(this.appRoot + "/storage/" + this.videoData.uuid + "/1080p/", {
			recursive: true,
		});
		ffmpeg(this.file.tempFilePath)
			// 360p
			.output(
				this.appRoot + "/storage/" + this.videoData.uuid + "/360p/360p.m3u8"
			)
			.videoCodec("libx264")
			.addOption(["-crf 24"])
			.addOption("-hls_time", "10")
			.addOption("-hls_playlist_type", "vod")
			.addOption("-hls_list_size", "0")
			.size("640x?")
			.aspect("16:9")
			.fps(30)
			// 1080p
			.output(
				this.appRoot + "/storage/" + this.videoData.uuid + "/1080p/1080p.m3u8"
			)
			.videoCodec("libx264")
			.addOption(["-crf 24"])
			.addOption("-hls_time", "10")
			.addOption("-hls_playlist_type", "vod")
			.addOption("-hls_list_size", "0")
			.size("1920x?")
			.aspect("16:9")
			.fps(30)
			// setup event handlers
			.on("start", () =>
				console.log(`[${this.videoData.uuid}]: Processing started.`)
			)
			.on("progress", (progress) => this.processingProgress(progress))
			.on("end", () => {
				console.log(
					`[${this.videoData.uuid}]: Successfully converted into HLS stream.`
				);
				// unlink original video file
				this.unlinkTmpFile();
				// proceed();
				this.generateRootPlaylist();
			})
			.on("error", (err, stdout, stderr) => {
				this.abort(err.message);
				console.log(stderr);
			})
			// run command
			.run();
	}

	private async processingProgress(progress: {
		percent: number;
		targetSize: number;
	}) {
		const roundedProgress = Math.round(progress.percent / 5) * 5;
		if (this.progress < roundedProgress) {
			if (isNaN(this.progress)) {
				return false;
			}
			this.progress = roundedProgress;
			console.log(
				`Processing "${this.videoData.uuid}": ${this.progress}% done, ${progress.targetSize}kb target size`
			);
			prisma.processing
				.update({
					where: {
						uuid: this.videoData.uuid,
					},
					data: {
						progress: this.progress,
					},
				})
				.catch((e) => e);
		}
	}

	private async generateRootPlaylist() {
		try {
			const masterPlaylist = fs.createWriteStream(
				this.appRoot + "/storage/" + this.videoData.uuid + "/playlist.m3u8",
				{
					flags: "a",
				}
			);
			masterPlaylist.write("#EXTM3U\n");
			masterPlaylist.write("#EXT-X-VERSION:3\n");
			masterPlaylist.write(
				`#EXT-X-STREAM-INF:BANDWIDTH=${Math.round(
					640 * 360 * 30 * this.videoData.motionFactor * 0.07
				)},RESOLUTION=640x360\n`
			);
			masterPlaylist.write("360p/360p.m3u8\n");
			masterPlaylist.write(
				`#EXT-X-STREAM-INF:BANDWIDTH=${Math.round(
					1920 * 1080 * 30 * this.videoData.motionFactor * 0.07
				)},RESOLUTION=1920x1080\n`
			);
			masterPlaylist.write("1080p/1080p.m3u8");
			masterPlaylist.close();
		} catch (e) {
			this.abort(e);
		} finally {
			console.log(`[${this.videoData.uuid}]: Created master playlist.`);
			this.finishUpload();
		}
	}

	private async finishUpload() {
		try {
			await prisma.video.update({
				where: {
					uuid: this.videoData.uuid,
				},
				data: {
					added: new Date().toISOString(),
					processing: {
						update: {
							status: 3,
						},
					},
				},
			});
			this.processingState = 3;
			this.log("success", "Video is online.");
		} catch (e) {
			this.abort(e);
		}
	}
}
