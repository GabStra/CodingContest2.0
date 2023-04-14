import express from "express";
import { isLoggedIn, isTeacher } from "./auth";
import { TeacherRequest } from "../model/TeacherRequest";
import { validate, VALIDATION_LANGUAGE } from "shared/helper/validator";
import { ENDPOINTS } from "shared/constants/endpoints";
import { ExerciseDTO } from "shared/dto/exerciseDTO";
import { TblEsercizi } from "../database/entities/TblEsercizi";
import { getRepository } from "../database/datasource";
import { ListElementDTO } from "shared/dto/ListElementDTO";
const router = express.Router();

router.post(
  ENDPOINTS.SAVE_EXERCISE,
  isLoggedIn,
  isTeacher,
  async function (req: TeacherRequest, res) {
    let exerciseDTO = new ExerciseDTO(req.body);
    let errors = await validate(exerciseDTO, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);
    let exerciseData: TblEsercizi;
    if (!!exerciseDTO.id && exerciseDTO.id > 0) {
      exerciseData = await eserciziRepo.findOne({
        where: {
          id: exerciseDTO.id,
        },
      });
    } else {
      exerciseData = new TblEsercizi();
    }

    Object.assign(exerciseData, exerciseDTO);
    await eserciziRepo.save(exerciseData);
    res.send(exerciseData);
  }
);

router.delete(
  ENDPOINTS.DELETE_EXERCISE,
  isLoggedIn,
  isTeacher,
  async function (req: TeacherRequest, res) {
    let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);
    let id = Number(req.query.id);
    let exerciseData = await await eserciziRepo.findOne({
      where: {
        id: id,
      },
    });

    if (!exerciseData) {
      res.sendStatus(404);
      return;
    }
    await eserciziRepo.delete(id);
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
          ({ id: item.id, data: item.title } as ListElementDTO<number, string>)
      );
      res.send(response);
    } catch {
      res.send([]);
    }
  }
);

export { router as exercisesRouter };
