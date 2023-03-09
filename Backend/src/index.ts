import express, { Express, Request, Response } from "express";
import { CppService } from "./cpp_service";
import dotenv from "dotenv";
import { CppRequest } from "../../Shared/compiled_proto/cpp";
import cors from "cors";
import fs from "fs/promises";
dotenv.config();

const app: Express = express();
const port = Number(process.env.PORT);
let cppService = new CppService();
app.use(express.json());
app.use(cors({ credentials: true }));

app.post("/run-cpp", async (res, req, next) => {
  let cppRequest: CppRequest = res.body;
  req.send(await cppService.runCpp(cppRequest));
});

app.post("/stop-cpp", async (res, req, next) => {
  let cppRequest: CppRequest = res.body;
  let result = await cppService.stopTask(cppRequest.id);
  req.send(result);
});

app.get("/get-base-code", async (req, res) => {
  let top = await fs.readFile("top.cpp", "utf8");
  let bottom = await fs.readFile("bottom.cpp", "utf8");
  let start = await fs.readFile("start.cpp", "utf8");

  let topLines = top.split(/\r\n|\r|\n/).length;
  let bottomLines = bottom.split(/\r\n|\r|\n/).length;
  res.send({
    start: start,
    top: top,
    topLines: topLines,
    bottom: bottom,
    bottomLines: bottomLines,
  });
});

app.listen(port);
