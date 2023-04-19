import express from "express";
import fsAsync from "fs/promises";
import { CppService } from "../cpp_service";
import { CppRequest, CppResponse_TaskStatus } from "shared/compiled_proto/cpp";
import {
  isLoggedIn,
  isStudent,
  hasTitleQueryParam,
} from "../helper/middleware";

import { AuthRequestWithCourseId } from "../dto/AuthRequest";
import Keyv from "@keyvhq/core";
import hash from "hash-it";
import {
  getRandomizedExerciseInputOutput,
  getExerciseTaskCount,
  getExerciseScore,
} from "../helper/exercise";
import { RemoteExecutionResult } from "shared/dto/remoteExecutionResult";
import { ENDPOINTS } from "shared/constants/endpoints";

const router = express.Router();
const cppService = new CppService();
const keyv = new Keyv();

function getKey(req: AuthRequestWithCourseId) {
  return String(hash([req.userData.id, req.courseId]));
}

router.post(
  ENDPOINTS.EXERCISE_RUN,
  isLoggedIn,
  isStudent,
  hasTitleQueryParam,
  async (req: AuthRequestWithCourseId, res) => {
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

    await keyv.set(key, req.body.code);

    let cppRequest: CppRequest = {
      id: key,
      code: req.body.code,
      input: input,
    };

    let result = await cppService.runCpp(cppRequest);
    let results = [];
    if (result.taskStatus === CppResponse_TaskStatus.SUCCEDED) {
      await keyv.delete(key);
      results = getExerciseScore(result.output, output, tasks);
    }
    res.send(
      new RemoteExecutionResult({
        stdout: result.output,
        stderr: result.stderr,
        results: results,
      })
    );
  }
);

router.post(
  ENDPOINTS.EXERCISE_STOP,
  isLoggedIn,
  isStudent,
  async (req: AuthRequestWithCourseId, res) => {
    const key = getKey(req);
    let result = await cppService.stopTask(key);
    if (result) await keyv.delete(key);
    res.send(result);
  }
);

router.get(
  ENDPOINTS.REMOTE_EXECUTION_DATA,
  isLoggedIn,
  isStudent,
  async (req, res) => {
    let top = await fsAsync.readFile("static/top.cpp", "utf8");
    let bottom = await fsAsync.readFile("static/bottom.cpp", "utf8");
    let start = await fsAsync.readFile("static/start.cpp", "utf8");

    res.send({
      start: start,
      top: top,
      bottom: bottom,
    });
  }
);

export { router as remoteExecutionRouter };
