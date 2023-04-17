import express from "express";
import { isLoggedIn, isTeacher } from "./auth";
import { TeacherRequest } from "../model/TeacherRequest";
import { validate, VALIDATION_LANGUAGE } from "shared/utils/validator";
import { ENDPOINTS } from "shared/constants/endpoints";
import { Exercise } from "shared/dto/exercise";
import { TblEsercizi } from "../database/entities/TblEsercizi";
import { getRepository } from "../database/datasource";
import { ListElement } from "shared/dto/ListElement";
const router = express.Router();

router.get(
  ENDPOINTS.EXERCISE_TEACHER,
  isLoggedIn,
  isTeacher,
  async function (req: TeacherRequest, res) {
    let title = "";
    try {
      title = String(req.query.title);
    } catch {
      res.sendStatus(400);
      return;
    }

    let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);
    console.log(title, req.courseId);
    let esercizio = await eserciziRepo.findOne({
      where: {
        title: title,
        idCorso: req.courseId,
      },
    });
    console.log(esercizio);
    res.send(esercizio);
  }
);

async function manageExercise(req: TeacherRequest, res, isNew: boolean) {
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
  console.log(exerciseData);
  res.send(exerciseData);
}

router.post(
  ENDPOINTS.NEW_EXERCISE,
  isLoggedIn,
  isTeacher,
  async (req: TeacherRequest, res) => await manageExercise(req, res, true)
);

router.post(
  ENDPOINTS.EDIT_EXERCISE,
  isLoggedIn,
  isTeacher,
  async (req: TeacherRequest, res) => await manageExercise(req, res, false)
);

router.delete(
  ENDPOINTS.DELETE_EXERCISE,
  isLoggedIn,
  isTeacher,
  async function (req: TeacherRequest, res) {
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
    res.sendStatus(200);
  }
);

router.get(
  ENDPOINTS.EXERCISE_LIST,
  isLoggedIn,
  isTeacher,
  async function (req: TeacherRequest, res) {
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
  async function (req: TeacherRequest, res) {
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
  ENDPOINTS.EXERCISES_STUDENT,
  isLoggedIn,
  async function (req: TeacherRequest, res) {
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

export { router as exercisesRouter };
