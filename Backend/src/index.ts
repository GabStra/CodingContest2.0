import express, { Express, Request, Response } from "express";
import { CppService } from "./cpp_service";
import dotenv from "dotenv";
import { CppRequest } from "../../Shared/compiled_proto/cpp";
dotenv.config();

const app: Express = express();
const port = Number(process.env.PORT);
let cppService = new CppService();
app.use(express.json());
app.post("/run-cpp", async (res, req, next) => {
  let cppRequest: CppRequest = res.body;
  let result = await cppService.runCpp(cppRequest);
  req.send(result);
});

app.post("/stop-cpp", async (res, req, next) => {
  let cppRequest: CppRequest = res.body;
  let result = await cppService.stopTask(cppRequest.id);
  req.send(result);
});
app.listen(port);
