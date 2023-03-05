import express, { Express, Request, Response } from "express";
import { CppRouter, initWorker } from "./docker/cpp/manager";
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();
const port = Number(process.env.PORT);
app.use(express.json());
app.use("/", CppRouter());
app.listen(port);
