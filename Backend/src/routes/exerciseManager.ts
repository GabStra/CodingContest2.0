import express from "express";
import fsAsync from "fs/promises";
import { CppService } from "../cpp_service";
import { CppRequest } from "shared/compiled_proto/cpp";
import {
  isLoggedIn,
  isStudent,
  hasTitleQueryParam,
} from "../helper/middleware";
import { exercisesRouter } from "./exercises";
import { CourseRequest } from "../dto/CourseRequest";
import Keyv from "@keyvhq/core";
import hash from "hash-it";
import {
  getRandomizedExerciseInputOutput,
  getExerciseTaskCount,
} from "../helper/exercise";
import { ExerciseExecutionData } from "../dto/ExerciseExecutionData";

const router = express.Router();
const cppService = new CppService();
const keyv = new Keyv();

function getKey(req: CourseRequest) {
  return String(hash([req.userData.id, req.courseId]));
}

router.post(
  "/run-cpp",
  isLoggedIn,
  isStudent,
  hasTitleQueryParam,
  async (req: CourseRequest, res) => {
    const key = getKey(req);

    if (!(await keyv.get(key))) {
      cppService.stopTask(key);
      res.sendStatus(403);
      return;
    }

    const tasks = await getExerciseTaskCount(req.query.title, req.courseId);
    let { input, output } = await getRandomizedExerciseInputOutput(
      req.query.title,
      req.courseId,
      tasks
    );
    let exerciseExecutionData: ExerciseExecutionData = {
      input: input,
      output: output,
      code: req.body.code,
    };
    await keyv.set(key, exerciseExecutionData);

    let cppRequest: CppRequest = {
      id: key,
      code: req.body.code,
      input: exerciseExecutionData.input,
    };

    let result = await cppService.runCpp(cppRequest);

    res.send();
  }
);

router.post(
  "/stop-cpp",
  isLoggedIn,
  isStudent,
  async (req: CourseRequest, res, next) => {
    const key = getKey(req);
    let result = await cppService.stopTask(key);
    res.send(result);
  }
);

router.get("/get-base-code", isLoggedIn, isStudent, async (req, res) => {
  let top = await fsAsync.readFile("static/top.cpp", "utf8");
  let bottom = await fsAsync.readFile("static/bottom.cpp", "utf8");
  let start = await fsAsync.readFile("static/start.cpp", "utf8");

  res.send({
    start: start,
    top: top,
    bottom: bottom,
  });
});

export { router as exerciseManagerRouter };
