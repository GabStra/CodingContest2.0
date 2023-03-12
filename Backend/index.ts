import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import corsGate from "cors-gate";
import fs from "fs";
import cookieParser from "cookie-parser";
import { cppRouter } from "./src/routes/cpp";
import { authRouter } from "./src/routes/auth";
import appRootPath from "app-root-path";

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

//RETRY22

app.use(cors({ credentials: true, origin: "http://localhost:5174" }));
app.use(cookieParser());
app.use(express.json());

// app.use(
//   corsGate({
//     strict: true,
//     allowSafe: true,
//     // the origin of the server
//     origin: "http://localhost:5174",
//   })
// );

app.use("/", authRouter);
app.use("/", cppRouter);

// var credentials = { key: privateKey, cert: certificate };
// var httpsServer = https.createServer(credentials, );
// httpsServer.listen(port, () => {
//   console.log("HELLO");
// });

app.listen(port);
