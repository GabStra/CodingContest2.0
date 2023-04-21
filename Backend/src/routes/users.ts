import express from "express";
import { getRepository } from "../database/datasource";

import { TblUsers } from "../database/entities/TblUsers";
import { AuthRequest } from "../dto/AuthRequest";
import { isLoggedIn, isSuperAdmin } from "../helper/middleware";
import { Response } from "shared/dto/Response";
import { ListElement } from "shared/dto/ListElement";
import { UserFilter } from "shared/dto/userFilter";
import { In, Like } from "typeorm";
import { ROLES } from "shared/constants/roles";
import { ENDPOINTS } from "shared/constants/endpoints";
const router = express.Router();

router.use(isLoggedIn);
router.get("/user", async function (req: AuthRequest, res) {
  let id = req.query.id;
  if (!(typeof id === "string" || id instanceof String)) {
    res.sendStatus(400);
    return;
  }

  if (req.userData.role === ROLES.USER && req.userData.userId !== id) {
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
      let results = await userRepo.find({
        where: {
          userStatus: "Y",
        },
      });

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

export { router as usersRouter };
