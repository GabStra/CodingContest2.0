import express from "express";
import { Not, In } from "typeorm";
import { getRepository } from "../database/datasource";
import { TblAssocStudenti } from "../database/entities/TblAssocStudenti";
import { TblCorsi } from "../database/entities/TblCorsi";
import { AuthRequest } from "../model/AuthRequest";
import { isLoggedIn, isSuperAdmin } from "./auth";
import { AvailableCourse } from "shared/dto/availableCourse";
import { Course } from "shared/dto/course";
import { validate, VALIDATION_LANGUAGE } from "shared/utils/validator";
import { TblAssocDocenti } from "../database/entities/TblAssocDocenti";
import { ListElement } from "shared/dto/ListElement";
import { Response } from "shared/dto/Response";

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
  "/available-courses",
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
      element.isRegistrationActive = req.userData.studentCourseIds.includes(
        element.id
      );
    });
    res.send(response);
  }
);

router.get(
  "/active-courses",
  isLoggedIn,
  async function (req: AuthRequest, res) {
    let coursesRepo = await getRepository<TblCorsi>(TblCorsi);
    let courses = await coursesRepo.find({
      where: {
        id: Not(In(req.userData.studentCourseIds)),
      },
    });
    let response = courses.map<ListElement<number, string>>((element) => {
      return {
        id: element.id,
        data: element.nome,
      } as ListElement<number, string>;
    });

    res.send(response);
  }
);

router.post(
  "/new-course",
  isLoggedIn,
  //isSuperAdmin,
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

router.post("/register-course", async function (req: AuthRequest, res) {
  try {
    let courseId = new Course(req.body).id;

    let coursesRepo = await getRepository<TblCorsi>(TblCorsi);
    let course = await coursesRepo.findOne({
      where: {
        id: courseId,
      },
    });

    let assocStudente = new TblAssocStudenti();
    assocStudente.idCorso = courseId;
    assocStudente.idUtente = req.userData.userId;
    assocStudente.attivo = Number(!course.iscrizione);
    let assocStudentiRepo = await getRepository<TblAssocStudenti>(
      TblAssocStudenti
    ); //t
    await assocStudentiRepo.save(assocStudente);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.get(
  "/my-courses-student",
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
        data: element.corso.nome,
      } as ListElement<number, string>;
    });

    res.send(response);
  }
);

router.get(
  "/my-courses-teacher",
  isLoggedIn,
  async function (req: AuthRequest, res) {
    let assocDocentiRepo = await getRepository<TblAssocDocenti>(
      TblAssocDocenti
    );
    let assocStudenti = await assocDocentiRepo.find({
      relations: {
        corso: true,
      },
      where: {
        idUtente: req.userData.id,
      },
    });

    let response = assocStudenti.map<ListElement<number, string>>((element) => {
      return {
        id: element.idCorso,
        data: element.corso.nome,
      } as ListElement<number, string>;
    });

    res.send(response);
  }
);

router.get("/courses", isLoggedIn, async function (req: AuthRequest, res) {
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
});

router.get("/course", isLoggedIn, async function (req: AuthRequest, res) {
  let id = Number(req.query.id);
  if (!id) {
    res.sendStatus(400);
    return;
  }

  let coursesRepo = await getRepository<TblCorsi>(TblCorsi);
  let course = await coursesRepo.findOne({
    relations: {
      assocDocenti: true,
    },
    where: {
      id: id,
    },
  });

  res.send({
    id: course.id,
    nome: course.nome,
    info: course.info,
    attivo: course.attivo,
    idDocenti: course.assocDocenti.map((assocDocente) => assocDocente.idUtente),
  });
});

export { router as coursesRouter };
