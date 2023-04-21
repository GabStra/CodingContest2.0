import express from "express";
import { getRepository } from "../database/datasource";

import { TblUsers } from "../database/entities/TblUsers";
import { AuthRequest } from "../dto/AuthRequest";
import { isAdmin, isLoggedIn } from "../helper/middleware";
import { ListElement } from "shared/dist/dto/ListElement";
import { ENDPOINTS } from "shared/dist/constants/endpoints";
import { TblSubmissions } from "../database/entities/TblSubmissions";
import { TblAssocDocenti } from "../database/entities/TblAssocDocenti";
import { TblAssocStudenti } from "../database/entities/TblAssocStudenti";
const router = express.Router();

router.get("/user", isLoggedIn, async function (req: AuthRequest, res) {
  let id = req.query.id;
  if (!(typeof id === "string" || id instanceof String)) {
    res.sendStatus(400);
    return;
  }

  if (!req.userData.isAdmin || req.userData.userId !== id) {
    res.sendStatus(401);
    return;
  }

  let userRepo = await getRepository<TblUsers>(TblUsers);
  let result = await userRepo.findOne({
    where: {
      userId: id as string,
    },
  });
  res.send(result);
});

router.get(
  ENDPOINTS.USERS_LIST,
  isLoggedIn,
  async function (req: AuthRequest, res) {
    try {
      let userRepo = await getRepository<TblUsers>(TblUsers);
      let results = await userRepo.find();

      let response = results.map(
        (user) =>
          ({ id: user.id, data: user.userName } as ListElement<number, string>)
      );
      res.send(response);
    } catch {
      res.send([]);
    }
  }
);

router.delete(
  ENDPOINTS.DELETE_USER,
  isLoggedIn,
  isAdmin,
  async function (req: AuthRequest, res) {
    let id = req.query.id;
    if (!(typeof id === "string" || id instanceof String)) {
      res.sendStatus(400);
      return;
    }

    let userRepo = await getRepository<TblUsers>(TblUsers);
    let user = await userRepo.findOne({
      where: {
        userId: id as string,
      },
    });

    if (!user) {
      res.sendStatus(404);
      return;
    }

    let assocDocentiRepo = await getRepository<TblAssocDocenti>(
      TblAssocDocenti
    );
    await assocDocentiRepo.delete({ idUtente: user.id });
    let assocStudentiRepo = await getRepository<TblAssocStudenti>(
      TblAssocStudenti
    );
    await assocStudentiRepo.delete({ idUtente: user.userId });

    let submissionsRepo = await getRepository<TblSubmissions>(TblSubmissions);
    await submissionsRepo.delete({ userId: user.id });

    await userRepo.remove(user);
    res.sendStatus(200);
  }
);

export { router as usersRouter };
