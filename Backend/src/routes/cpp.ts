import express, { Request, response, Response } from "express";
import fsAsync from "fs/promises";
import { CppService } from "../cpp_service";
import { CppRequest } from "shared/compiled_proto/cpp";

const router = express.Router();
const cppService = new CppService();

router.post("/run-cpp", async (res, req, next) => {
  let cppRequest: CppRequest = res.body;
  req.send(await cppService.runCpp(cppRequest));
});

router.post("/stop-cpp", async (res, req, next) => {
  let cppRequest: CppRequest = res.body;
  let result = await cppService.stopTask(cppRequest.id);
  req.send(result);
});

router.get("/get-base-code", async (req, res) => {
  let top = await fsAsync.readFile("static/top.cpp", "utf8");
  let bottom = await fsAsync.readFile("static/bottom.cpp", "utf8");
  let start = await fsAsync.readFile("static/start.cpp", "utf8");

  res.send({
    start: start,
    top: top,
    bottom: bottom,
  });
});

export { router as cppRouter };
