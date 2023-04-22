import express from "express";
import { Not, In } from "typeorm";
import { getRepository } from "../database/datasource";
import { TblAssocStudenti } from "../database/entities/TblAssocStudenti";
import { TblCorsi } from "../database/entities/TblCorsi";
import { AuthRequest, AuthRequestWithCourseId } from "../dto/AuthRequest";
import {
  hasCourseQueryParam,
  isAdmin,
  isLoggedIn,
  isTeacher,
} from "../helper/middleware";
import { Course } from "shared/dist/dto/course";
import { validate, VALIDATION_LANGUAGE } from "shared/dist/utils/validator";
import { TblAssocDocenti } from "../database/entities/TblAssocDocenti";
import { ListElement } from "shared/dist/dto/ListElement";
import { ENDPOINTS } from "shared/dist/constants/endpoints";
import { CourseRegistrationManager } from "shared/dist/dto/courseRegistrationManager";
import { TblEsercizi } from "../database/entities/TblEsercizi";
import { TblSubmissions } from "../database/entities/TblSubmissions";
import { sessionCache } from "../..";

const router = express.Router();

function buildCoursesArray(items: TblCorsi[]) {
  return items.map((course) => ({
    id: course.id,
    nome: course.nome,
    attivo: !!course.attivo,
    numeroIscritti: course.assocStudenti.length,
    nomiDocenti: course.assocDocenti.map(
      (assocDocente) => assocDocente.user.userName
    ),
  }));
}

router.get(
  ENDPOINTS.AVAILABLE_COURSES,
  isLoggedIn,
  async function (req: AuthRequest, res) {
    let assocStudentiRepo = await getRepository<TblAssocStudenti>(
      TblAssocStudenti
    );
    let assocStudenti = await assocStudentiRepo.find({
      where: {
        idUtente: req.userData.userId,
      },
    });
    let registeredCourseIds = assocStudenti.map((item) => item.idCorso);
    let registeredCourseIdsActive = assocStudenti
      .filter((item) => item.attivo)
      .map((item) => item.idCorso);
    let coursesRepo = await getRepository<TblCorsi>(TblCorsi);
    let courses = await coursesRepo.find({
      where: {
        attivo: 1,
      },
      relations: {
        assocDocenti: {
          user: true,
        },
        assocStudenti: true,
      },
    });

    let response = buildCoursesArray(courses);
    response.forEach((element: any) => {
      element.isRegistered = registeredCourseIds.includes(element.id);
      element.isRegistrationActive = registeredCourseIdsActive.includes(
        element.id
      );
    });
    res.send(response);
  }
);

router.post(
  ENDPOINTS.SAVE_COURSE,
  isLoggedIn,
  isAdmin,
  async function (req: AuthRequest, res) {
    let course = new Course(req.body);
    let errors = await validate(course, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    let coursesRepo = await getRepository<TblCorsi>(TblCorsi);

    let courseData: TblCorsi;
    if (!!course.id) {
      courseData = await await coursesRepo.findOne({
        relations: {
          assocDocenti: true,
        },
        where: {
          id: course.id,
        },
      });
      let assocDocentiRepo = await getRepository<TblAssocDocenti>(
        TblAssocDocenti
      );
      await assocDocentiRepo.remove(courseData.assocDocenti);
    } else {
      courseData = new TblCorsi();
    }

    courseData.nome = course.nome;
    courseData.info = course.info;
    courseData.attivo = !!course.attivo ? 1 : 0;
    courseData.istituto = 1;
    courseData.assocDocenti = [];
    for (let idDocente of course.idDocenti) {
      let assocDocente = new TblAssocDocenti();
      assocDocente.idCorso = courseData.id;
      assocDocente.idUtente = idDocente;
      courseData.assocDocenti.push(assocDocente);
    }

    await coursesRepo.save(courseData);

    res.send(courseData);
  }
);

router.delete(
  ENDPOINTS.DELETE_COURSE,
  isLoggedIn,
  isAdmin,
  hasCourseQueryParam,
  async function (req: AuthRequestWithCourseId, res) {
    let coursesRepo = await getRepository<TblCorsi>(TblCorsi);
    let courseData = await coursesRepo.findOne({
      where: {
        id: req.courseId,
      },
    });

    if (!courseData) {
      res.sendStatus(404);
      return;
    }
    await coursesRepo.remove(courseData);
    let assocDocentiRepo = await getRepository<TblAssocDocenti>(
      TblAssocDocenti
    );
    await assocDocentiRepo.delete({ idCorso: req.courseId });
    let assocStudentiRepo = await getRepository<TblAssocStudenti>(
      TblAssocStudenti
    );
    await assocStudentiRepo.delete({ idCorso: req.courseId });
    let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);
    await eserciziRepo.delete({ idCorso: req.courseId });
    let submissionsRepo = await getRepository<TblSubmissions>(TblSubmissions);
    await submissionsRepo.delete({ idCorso: req.courseId });
    res.sendStatus(200);
  }
);

router.post(
  ENDPOINTS.REGISTER_COURSE,
  isLoggedIn,
  async function (req: AuthRequest, res) {
    try {
      let courseId = new Course(req.body).id;

      let coursesRepo = await getRepository<TblCorsi>(TblCorsi);
      let course = await coursesRepo.findOne({
        where: {
          id: courseId,
        },
      });

      if (!course) {
        res.sendStatus(404);
        return;
      }

      let assocStudentiRepo = await getRepository<TblAssocStudenti>(
        TblAssocStudenti
      );

      let assocStudente = new TblAssocStudenti();
      assocStudente.idCorso = courseId;
      assocStudente.idUtente = req.userData.userId;
      assocStudente.attivo = Number(!course.iscrizione);

      await assocStudentiRepo.save(assocStudente);
      res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }
);

router.get(
  ENDPOINTS.MY_COURSES_STUDENT,
  isLoggedIn,
  async function (req: AuthRequest, res) {
    let assocStudentiRepo = await getRepository<TblAssocStudenti>(
      TblAssocStudenti
    );
    let assocStudenti = await assocStudentiRepo.find({
      relations: {
        corso: true,
      },
      where: {
        idUtente: req.userData.userId,
        attivo: 1,
      },
    });

    let response = assocStudenti.map<ListElement<number, string>>((element) => {
      return {
        id: element.idCorso,
        data: element.corso?.nome,
      } as ListElement<number, string>;
    });

    res.send(response);
  }
);

router.get(
  ENDPOINTS.MY_COURSES_TEACHER,
  isLoggedIn,
  async function (req: AuthRequest, res) {
    let assocDocentiRepo = await getRepository<TblAssocDocenti>(
      TblAssocDocenti
    );
    let assocDocenti = await assocDocentiRepo.find({
      relations: {
        corso: true,
      },
      where: {
        idUtente: req.userData.id,
      },
    });

    let response = assocDocenti.map<ListElement<number, string>>((element) => {
      return {
        id: element.idCorso,
        data: element.corso?.nome,
      } as ListElement<number, string>;
    });

    res.send(response);
  }
);

router.get(
  ENDPOINTS.COURSES,
  isLoggedIn,
  async function (req: AuthRequest, res) {
    let coursesRepo = await getRepository<TblCorsi>(TblCorsi);
    let courses = await coursesRepo.find({
      relations: {
        assocDocenti: {
          user: true,
        },
        assocStudenti: true,
      },
    });

    let response = buildCoursesArray(courses);
    res.send(response);
  }
);

router.get(
  ENDPOINTS.COURSE,
  isLoggedIn,
  isAdmin,
  async function (req: AuthRequestWithCourseId, res) {
    let coursesRepo = await getRepository<TblCorsi>(TblCorsi);
    let course = await coursesRepo.findOne({
      relations: {
        assocDocenti: true,
      },
      where: {
        id: req.courseId,
      },
    });

    res.send({
      id: course.id,
      nome: course.nome,
      info: course.info,
      attivo: course.attivo,
      idDocenti: course.assocDocenti.map(
        (assocDocente) => assocDocente.idUtente
      ),
    });
  }
);

router.get(
  ENDPOINTS.WAITING_TO_BE_APPROVED_LIST,
  isLoggedIn,
  isTeacher,
  async function (req: AuthRequestWithCourseId, res) {
    try {
      let assocStudentiRepo = await getRepository<TblAssocStudenti>(
        TblAssocStudenti
      );
      let results = await assocStudentiRepo.find({
        select: {
          idUtente: true,
          user: {
            userName: true,
          },
        },
        where: {
          attivo: 0,
          idCorso: req.courseId,
        },
        relations: {
          user: true,
        },
      });

      let response = results.map(
        (item) =>
          ({ id: item.idUtente, data: item.user.userName } as ListElement<
            string,
            string
          >)
      );
      res.send(response);
    } catch {
      res.send([]);
    }
  }
);

router.get(
  ENDPOINTS.WAITING_TO_BE_APPROVED_COUNT,
  isLoggedIn,
  isTeacher,
  async function (req: AuthRequestWithCourseId, res) {
    let assocStudentiRepo = await getRepository<TblAssocStudenti>(
      TblAssocStudenti
    );
    let assocStudenti = await assocStudentiRepo.find({
      where: {
        attivo: 0,
        idCorso: req.courseId,
      },
    });

    res.send(assocStudenti.length.toString());
  }
);

router.post(
  ENDPOINTS.APPROVE_REQUESTS,
  isLoggedIn,
  isTeacher,
  async function (req: AuthRequestWithCourseId, res) {
    let registrationManager = new CourseRegistrationManager(req.body);
    let errors = await validate(registrationManager, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    let assocStudentiRepo = await getRepository<TblAssocStudenti>(
      TblAssocStudenti
    );

    try {
      await assocStudentiRepo.update(
        {
          idUtente: In(registrationManager.ids),
          idCorso: req.courseId,
        },
        { attivo: 1 }
      );
      res.sendStatus(200);
    } catch {
      res.sendStatus(500);
    }
  }
);

router.post(
  ENDPOINTS.REJECT_REQUESTS,
  isLoggedIn,
  isTeacher,
  async function (req: AuthRequestWithCourseId, res) {
    let registrationManager = new CourseRegistrationManager(req.body);
    let errors = await validate(registrationManager, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    let assocStudentiRepo = await getRepository<TblAssocStudenti>(
      TblAssocStudenti
    );

    try {
      await assocStudentiRepo.delete({
        idCorso: req.courseId,
        idUtente: In(registrationManager.ids),
      });
      res.sendStatus(200);
    } catch {
      res.sendStatus(500);
    }
  }
);

export { router as coursesRouter };
