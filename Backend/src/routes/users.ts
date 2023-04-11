import express, { Request, response, Response } from "express";
import { getRepository } from "../database/datasource";

import { TblUsers } from "../database/entities/TblUsers";
import { AuthRequest } from "../model/AuthRequest";
import { isLoggedIn, isSuperAdmin } from "./auth";
import { ResponseDTO } from "shared/dto/ResponseDTO";
import { ListElementDTO } from "shared/dto/ListElementDTO";
import { UserFilterDTO } from "shared/dist/dto/userFilterDTO";
import { In, Like } from "typeorm";
import { ROLE } from "shared/dist/constants/role";
const router = express.Router();

router.use(isLoggedIn);
router.get("/user", async function (req: AuthRequest, res) {
  let id = req.query.id;
  if (!(typeof id === "string" || id instanceof String)) {
    res.sendStatus(400);
    return;
  }

  if (req.userData.role === ROLE.USER && req.userData.userId !== id) {
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
    if (req.userData.role === ROLE.USER) {
      res.sendStatus(401);
      return;
    }

    let filter = new UserFilterDTO(req.body);
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
          ({ id: user.userId, data: user.userName } as ListElementDTO<
            string,
            string
          >)
      ),
    } as ResponseDTO<ListElementDTO<string, string>[]>;
    res.send(response);
  } catch {
    res.send({ data: [] } as ResponseDTO<ListElementDTO<string, string>[]>);
  }
});

router.get("/users-list", async function (req: AuthRequest, res) {
  try {
    // if (req.userData.role === ROLE.USER) {
    //   res.sendStatus(401);
    //   return;
    // }

    let userRepo = await getRepository<TblUsers>(TblUsers);
    let results = await userRepo.find();

    let response = results.map(
      (user) =>
        ({ id: user.id, data: user.userName } as ListElementDTO<number, string>)
    );
    res.send(response);
  } catch {
    res.send([]);
  }
});

export { router as usersRouter };
