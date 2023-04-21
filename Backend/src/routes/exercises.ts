import express from "express";
import {
  hasTitleQueryParam,
  isLoggedIn,
  isStudent,
  isTeacher,
} from "../helper/middleware";
import {
  AuthRequestWithCourseId,
  AuthRequestWithTitleAndCourseId,
} from "../dto/AuthRequest";
import { validate, VALIDATION_LANGUAGE } from "shared/dist/utils/validator";
import { ENDPOINTS } from "shared/dist/constants/endpoints";
import { Exercise } from "shared/dist/dto/exercise";
import { TblEsercizi } from "../database/entities/TblEsercizi";
import { getRepository } from "../database/datasource";
import { ListElement } from "shared/dist/dto/ListElement";
import Keyv from "@keyvhq/core";
import { TableTasks } from "../database/entities/TableTasks";
import { TblSubmissions } from "../database/entities/TblSubmissions";
import { getCurrentTotalScore } from "../helper/utils";
import { fromTotalScoreToLevel } from "shared/dist/utils/mixed";
import { ExerciseTableRow } from "shared/dist/dto/exerciseTableRow";

import hash from "hash-it";
import { In } from "typeorm";

const router = express.Router();
const userTotalScoreCache = new Keyv();

async function getUserLevel(userId: number, courseId) {
  let key = hash({ userId: userId, courseId: courseId });
  let result = await userTotalScoreCache.get(key.toString());
  if (result) return fromTotalScoreToLevel(result);
  let totalScore = await getCurrentTotalScore(userId, courseId);
  await userTotalScoreCache.set(key.toString(), totalScore);
  return fromTotalScoreToLevel(totalScore);
}

router.get(
  ENDPOINTS.EXERCISE_TEACHER,
  isLoggedIn,
  isTeacher,
  async function (req: AuthRequestWithCourseId, res) {
    let title = "";
    try {
      title = String(req.query.title);
    } catch {
      res.sendStatus(400);
      return;
    }

    let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);

    let esercizio = await eserciziRepo.findOne({
      where: {
        title: title,
        idCorso: req.courseId,
      },
    });

    if (!esercizio) {
      res.sendStatus(404);
      return;
    }

    let tasksRepo = await getRepository<TableTasks>(TableTasks);
    let task = await tasksRepo.findOne({
      where: {
        title: title,
      },
    });

    res.send({
      ...esercizio,
      taskInput: task.taskInput,
      taskOutput: task.taskOutput,
    });
  }
);

async function manageExercise(
  req: AuthRequestWithCourseId,
  res,
  isNew: boolean
) {
  let exercise = new Exercise(req.body);

  let errors = await validate(exercise, VALIDATION_LANGUAGE.IT);
  if (errors.length !== 0) {
    res.sendStatus(400);
    return;
  }

  let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);
  let exerciseData: TblEsercizi;
  if (!!exercise.title) {
    exerciseData = await eserciziRepo.findOne({
      where: {
        title: exercise.title,
        idCorso: req.courseId,
      },
    });
  }

  if (isNew && !!exerciseData) {
    res.status(400);
    res.send("Esercizio già esistente - scegliere un altro titolo");
    return;
  }

  delete exercise.autore;
  delete exercise.idCorso;

  if (!exerciseData) {
    exerciseData = new TblEsercizi();
    exerciseData.path = "";
    exerciseData.autore = req.userData.userName;
    exerciseData.idCorso = req.courseId;
  }

  exercise.title = exercise.title.trim();
  if (!exercise.prop) exercise.prop = 0;

  Object.assign(exerciseData, exercise);
  await eserciziRepo.save(exerciseData);

  let tasksData = new TableTasks();
  tasksData.title = exerciseData.title;
  tasksData.taskInput = exercise.taskInput;
  tasksData.taskOutput = exercise.taskOutput;
  let tasksRepo = await getRepository<TableTasks>(TableTasks);
  await tasksRepo.save(tasksData);

  res.send(exerciseData);
}

router.post(
  ENDPOINTS.NEW_EXERCISE,
  isLoggedIn,
  isTeacher,
  async (req: AuthRequestWithCourseId, res) =>
    await manageExercise(req, res, true)
);

router.post(
  ENDPOINTS.EDIT_EXERCISE,
  isLoggedIn,
  isTeacher,
  async (req: AuthRequestWithCourseId, res) =>
    await manageExercise(req, res, false)
);

router.delete(
  ENDPOINTS.DELETE_EXERCISE,
  isLoggedIn,
  isTeacher,
  async function (req: AuthRequestWithCourseId, res) {
    let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);
    let title = "";
    try {
      title = String(req.query.title);
      console.log(title);
    } catch {
      res.sendStatus(400);
      return;
    }

    let exerciseData = await eserciziRepo.findOne({
      where: {
        title: title,
        idCorso: req.courseId,
      },
    });

    if (!exerciseData) {
      res.sendStatus(404);
      return;
    }
    await eserciziRepo.remove(exerciseData);
    let tasksRepo = await getRepository<TableTasks>(TableTasks);
    await tasksRepo.delete({ title: title });
    let submissionsRepo = await getRepository<TblSubmissions>(TblSubmissions);
    await submissionsRepo.delete({
      exerciseTitle: title,
      idCorso: req.courseId,
    });
    res.sendStatus(200);
  }
);

router.get(
  ENDPOINTS.EXERCISE_LIST,
  isLoggedIn,
  isTeacher,
  async function (req: AuthRequestWithCourseId, res) {
    try {
      let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);
      let results = await eserciziRepo.find();
      let response = results.map(
        (item) =>
          ({ id: item.id, data: item.title } as ListElement<number, string>)
      );
      res.send(response);
    } catch {
      res.send([]);
    }
  }
);

router.get(
  ENDPOINTS.EXERCISES_TEACHER,
  isLoggedIn,
  isTeacher,
  async function (req: AuthRequestWithCourseId, res) {
    try {
      let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);
      let response = await eserciziRepo.find({
        select: ["title", "pronto", "pubblicato"],
        where: { idCorso: req.courseId },
      });
      res.send(response);
    } catch {
      res.send([]);
    }
  }
);

router.get(
  ENDPOINTS.TOTAL_SCORE,
  isLoggedIn,
  isStudent,
  async function (req: AuthRequestWithCourseId, res) {
    let key = hash({ userId: req.userData.id, courseId: req.courseId });
    let currentLevel = await getCurrentTotalScore(
      req.userData.id,
      req.courseId
    );
    await userTotalScoreCache.set(key.toString(), currentLevel);
    res.send(currentLevel.toString());
  }
);

router.get(
  ENDPOINTS.EXERCISE_STUDENT,
  isLoggedIn,
  isStudent,
  hasTitleQueryParam,
  async function (req: AuthRequestWithTitleAndCourseId, res) {
    let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);
    let esercizio = await eserciziRepo.findOne({
      select: [
        "title",
        "titoloEsteso",
        "introduzione",
        "specifiche",
        "input",
        "output",
        "note",
        "esempio",
        "level",
      ],
      where: {
        pubblicato: true,
        idCorso: req.courseId,
        title: req.title,
      },
    });

    if (!esercizio) {
      res.sendStatus(404);
      return;
    }

    let userLevel = await getUserLevel(req.userData.id, req.courseId);

    if (userLevel < esercizio.level) {
      res.sendStatus(403);
      return;
    }

    res.send(esercizio);
  }
);

router.get(
  ENDPOINTS.EXERCISES_STUDENT,
  isLoggedIn,
  isStudent,
  async function (req: AuthRequestWithCourseId, res) {
    try {
      let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);

      let submissionsRepo = await getRepository<TblSubmissions>(TblSubmissions);

      let results = await eserciziRepo.find({
        select: {
          title: true,
          level: true,
          tag: {
            tag: true,
          },
        },
        where: {
          pubblicato: true,
          idCorso: req.courseId,
        },
        relations: {
          tag: true,
        },
      });

      let submissions = await submissionsRepo.find({
        select: {
          score: true,
          exerciseTitle: true,
        },
        where: {
          idCorso: req.courseId,
          userId: req.userData.id,
        },
      });

      let userLevel = await getUserLevel(req.userData.id, req.courseId);

      let response = results.map((item) => {
        let submission = submissions.filter(
          (submission) => submission.exerciseTitle === item.title
        )[0];
        return {
          title: item.title,
          level: item.level,
          tag: item.tag?.tag,
          score: submission?.score,
          unlocked: userLevel >= item.level,
        } as ExerciseTableRow;
      });

      res.send(response);
    } catch (err) {
      console.log(err);
      res.send([]);
    }
  }
);

export { router as exercisesRouter };
