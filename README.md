# What is the vuBase API?

The vuBase API is the node.js/TypeScript backend for **vuBase, the fast and easy-to-use learning video portal for students**.
It manages all user, video, subject, room and administrative data.

It also takes care of HLS video encoding with ffmpeg and serves on-demand uploaded learning videos, grouped into subjects, in separate, password-protected student rooms.

Technologies used include
[Node.js](https://nodejs.org/ "Node's homepage"),
[Express](https://expressjs.com/ "Express's homepage"),
[TypeScript](https://www.typescriptlang.org/ "Typescript's homepage"),
[PostgreSQL](https://www.postgresql.org/ "Postgres's Homepage"),
[FFmpeg](https://ffmpeg.org/ "FFmpeg's Homepage")
with
[Fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg "Fluent-ffmpeg's Github Repo"),
[Prisma](https://www.google.com "Prisma's Github Repo")
and
[Docker](https://www.docker.com/ "Docker's Homepage").

## Getting started

To setup your own vuBase backend, you need to install following programs first: Node.js, Docker and VSCode (optional, you can use your favorite code editor).

Clone the vuBase-api git repository and use `node package manager (npm)` to install the required packages:

```Bash
npm install
```

After that, create a `.env` file in the root directory and specify the following values:

```
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db:5432/
POSTGRES_PASSWORD=
RESET_ACCOUNT_SECRET=
NODE_APP_ROOT=/usr/src/api
NODE_ENV=production
SESSION_COOKIE_SECRET=
```

Note that it is okay to leave the `NODE_ENV` as "`production`", because the docker-compose.dev.yml overwrites this when you are developing.

After this is done, you can edit the TypeScript files. When you are done, you can build the docker image and setup needed containers in development mode with

```Bash
npm run docker-build:dev
```

There are many more "`npm run`" commands. You can use them as you need.
For example,

```Bash
npm run compile
```

only compiles the TypeScript code into JavaScript. These compiled files are in the `./dist` folder.

The API endpoints are ordered quite logically and correspond as much as possible to the folder structure.

## Contributing

Pull requests are welcome. If you would like to implement a major change, please open an issue first so we can discuss what you'd like to change.

## License

[Mozilla Public License 2.0](https://choosealicense.com/licenses/mpl-2.0/)
