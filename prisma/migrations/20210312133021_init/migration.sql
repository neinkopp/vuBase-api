-- CreateTable
CREATE TABLE "videos" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "title" VARCHAR(60) NOT NULL,
    "desc" TEXT,
    "bytesize" INTEGER,
    "subjectId" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "pass_hashed" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_upload_progress" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "status" SMALLINT NOT NULL,
    "progress" SMALLINT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "username" TEXT NOT NULL,
    "pass_hashed" TEXT NOT NULL,
    "latest_login" TIMESTAMPTZ NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoomToVideo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "videos.uuid_unique" ON "videos"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "videos.title_unique" ON "videos"("title");

-- CreateIndex
CREATE UNIQUE INDEX "videos.desc_unique" ON "videos"("desc");

-- CreateIndex
CREATE UNIQUE INDEX "rooms.uuid_unique" ON "rooms"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "rooms.name_unique" ON "rooms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subjects.uuid_unique" ON "subjects"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "subjects.name_unique" ON "subjects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "video_upload_progress.uuid_unique" ON "video_upload_progress"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser.username_unique" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session.sid_unique" ON "Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomToVideo_AB_unique" ON "_RoomToVideo"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomToVideo_B_index" ON "_RoomToVideo"("B");

-- AddForeignKey
ALTER TABLE "videos" ADD FOREIGN KEY ("subjectId") REFERENCES "subjects"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_upload_progress" ADD FOREIGN KEY ("uuid") REFERENCES "videos"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomToVideo" ADD FOREIGN KEY ("A") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomToVideo" ADD FOREIGN KEY ("B") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
