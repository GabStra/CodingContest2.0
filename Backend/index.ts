import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import corsGate from "cors-gate";
import fs from "fs";
import cookieParser from "cookie-parser";
import appRootPath from "app-root-path";
import https from "https";
import { exercisesRouter } from "./src/routes/exercises";
import { authRouter } from "./src/routes/auth";
import { coursesRouter } from "./src/routes/courses";
import { usersRouter } from "./src/routes/users";
import { tagsRouter } from "./src/routes/tags";
import { remoteExecutionRouter } from "./src/routes/remoteExecution";
import Keyv from "@keyvhq/core";

export const sessionCache = new Keyv();

dotenv.config();
const app: Express = express();
const port = Number(process.env.PORT);

var privateKey = fs.readFileSync(
  appRootPath.resolve("keys/https/key.pem"),
  "utf8"
);
var certificate = fs.readFileSync(
  appRootPath.resolve("keys/https/cert.pem"),
  "utf8"
);

app.use(cors({ credentials: true, origin: process.env.FRONTEND_HOST }));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));

// app.use(
//   corsGate({
//     strict: true,
//     allowSafe: true,
//     // the origin of the server
//     origin: "http://localhost:5174",
//   })
// );

app.use("/", authRouter);
app.use("/", remoteExecutionRouter);
app.use("/", coursesRouter);
app.use("/", usersRouter);
app.use("/", tagsRouter);
app.use("/", exercisesRouter);

/* var credentials = { key: privateKey, cert: certificate };
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
  console.log("HELLO");
}); */

app.listen(port);
