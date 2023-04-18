import express from "express";
import { getRepository } from "../database/datasource";

import { TblUsers } from "../database/entities/TblUsers";
import { AuthRequest } from "../dto/AuthRequest";
import { isLoggedIn, isSuperAdmin } from "./auth";
import { Response } from "shared/dto/Response";
import { ListElement } from "shared/dto/ListElement";
import { UserFilter } from "shared/dto/userFilter";
import { In, Like } from "typeorm";
import { ROLES } from "shared/constants/roles";
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

router.post("/users-by-filter", async function (req: AuthRequest, res) {
  try {
    if (req.userData.role === ROLES.USER) {
      res.sendStatus(401);
      return;
    }

    let filter = new UserFilter(req.body);
    let userRepo = await getRepository<TblUsers>(TblUsers);
    let results = await userRepo.find({
      select: {
        userId: true,
        userName: true,
      },
      where: {
        userId: !!filter.ids ? In(filter.ids) : null,
        userName: !!filter.name ? Like(filter.name) : null,
      },
    });

    let response = {
      data: results.map(
        (user) =>
          ({ id: user.userId, data: user.userName } as ListElement<
            string,
            string
          >)
      ),
    } as Response<ListElement<string, string>[]>;
    res.send(response);
  } catch {
    res.send({ data: [] } as Response<ListElement<string, string>[]>);
  }
});

router.get("/users-list", async function (req: AuthRequest, res) {
  try {
    // if (req.userData.role === ROLES.USER) {
    //   res.sendStatus(401);
    //   return;
    // }

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
});

export { router as usersRouter };
