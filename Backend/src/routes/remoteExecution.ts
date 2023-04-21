import express from "express";
import fsAsync from "fs/promises";
import { CppService } from "../cpp_service";
import {
  CppRequest,
  CppResponse_TaskStatus,
} from "shared/dist/compiled_proto/cpp";
import {
  isLoggedIn,
  isStudent,
  hasTitleQueryParam,
} from "../helper/middleware";

import {
  AuthRequestWithCourseId,
  AuthRequestWithTitleAndCourseId,
} from "../dto/AuthRequest";
import Keyv from "@keyvhq/core";
import hash from "hash-it";
import {
  getRandomizedExerciseInputOutput,
  getExerciseTaskCount,
  getExerciseScore,
} from "../helper/exercise";
import { RemoteExecutionRequest } from "shared/dist/dto/remoteExecutionRequest";
import { RemoteExecutionResult } from "shared/dist/dto/remoteExecutionResult";
import { RemoteExecutionBase } from "shared/dist/dto/remoteExecutionBase";
import { ENDPOINTS } from "shared/dist/constants/endpoints";
import { VALIDATION_LANGUAGE, validate } from "shared/dist/utils/validator";
import { getRepository } from "../database/datasource";
import { TblSubmissions } from "../database/entities/TblSubmissions";

const router = express.Router();
const cppService = new CppService();
const keyv = new Keyv();

function getKey(req: AuthRequestWithCourseId) {
  return String(hash([req.userData.id, req.courseId]));
}

async function updateSubmission(
  userId: number,
  title: string,
  courseId: number,
  score
) {
  let submissionsRepo = await getRepository<TblSubmissions>(TblSubmissions);

  let submission = await submissionsRepo.findOne({
    where: {
      exerciseTitle: title,
      idCorso: courseId,
      userId: userId,
    },
  });

  if (!submission) {
    submission = new TblSubmissions();
    submission.exerciseTitle = title;
    submission.idCorso = courseId;
    submission.userId = userId;
    submission.score = score;
    submission.submissionCounter = 0;
  }

  submission.score = score;
  submission.submissionCounter++;
  submission.submissionTime = new Date().toISOString();
  await submissionsRepo.save(submission);
}

router.post(
  ENDPOINTS.EXERCISE_RUN,
  isLoggedIn,
  isStudent,
  hasTitleQueryParam,
  async (req: AuthRequestWithTitleAndCourseId, res) => {
    const key = getKey(req);

    let remoteExecutionRequest = new RemoteExecutionRequest(req.body);

    let errors = await validate(remoteExecutionRequest, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    let session = await keyv.get(key);
    if (session) {
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
      code: remoteExecutionRequest.code,
      input: input,
    };

    let result = await cppService.runCpp(cppRequest);
    await keyv.delete(key);
    let results = [];
    if (result.taskStatus === CppResponse_TaskStatus.SUCCEDED) {
      await keyv.delete(key);
      results = getExerciseScore(result.output, output, tasks);
      await updateSubmission(
        req.userData.id,
        req.title,
        req.courseId,
        results.filter((x) => x).length
      );
    }
    res.send({
      stdout: result.stdout,
      stderr: result.stderr,
      results: results,
    } as RemoteExecutionResult);
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

router.get(ENDPOINTS.REMOTE_EXECUTION_DATA, isLoggedIn, async (req, res) => {
  let top = await fsAsync.readFile("static/top.cpp", "utf8");
  let bottom = await fsAsync.readFile("static/bottom.cpp", "utf8");
  let start = await fsAsync.readFile("static/start.cpp", "utf8");

  res.send({
    start: start,
    top: top,
    bottom: bottom,
  } as RemoteExecutionBase);
});

export { router as remoteExecutionRouter };
