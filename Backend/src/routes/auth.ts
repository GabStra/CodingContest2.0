import express, { Request, response, Response } from "express";
import fs from "fs";
import jsonwebtoken from "jsonwebtoken";
import { AccessTokenPayload } from "../../../Shared/models/accessTokenPayload";
import { RefreshTokenPayload } from "../../../Shared/models/refreshTokenPayload";
import dayjs from "dayjs";
import { ROLE } from "../../../Shared/models/role";
import { Login } from "../../../Shared/models/login";
import { getRepository } from "../database/datasource";

import { TblUsers } from "../database/entities/TblUsers";
import bcrypt from "bcrypt";
import jwt_decode from "jwt-decode";
import { getRoleFromUser } from "../helper/role";
import {
  buildAccessToken,
  buildRefreshToken,
  createAccessTokenCookies,
  createRefreshTokenCookies,
  hasAccessToken,
  hasRefreshToken,
  verifyJwt,
} from "../helper/cookie";

const router = express.Router();

router.post("/login", async function (req: Request, res: Response) {
  //TODO VERIFY REQUEST
  try {
    let login = req.body as Login;
    let userRepo = await getRepository<TblUsers>(TblUsers);

    let user = await userRepo.findOne({
      where: {
        userEmail: login.email,
      },
      relations: {
        admin: true,
      },
    });

    let result = await bcrypt.compare(login.password, user.userPass);
    if (!user || !result) {
      res.sendStatus(401);
      return;
    }

    let role = getRoleFromUser(user);
    createRefreshTokenCookies(res, user.userId, login.rememberMe);
    createAccessTokenCookies(res, user.userId, role);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(401);
  }
});

router.post("/refresh", async function (req: Request, res: Response) {
  try {
    if (!hasRefreshToken(req)) {
      res.sendStatus(401);
      return;
    }

    let jwt = buildRefreshToken(req);
    if (!verifyJwt(jwt)) {
      res.sendStatus(401);
      return;
    }
    let payload = jwt_decode(jwt) as RefreshTokenPayload;
    let userRepo = await getRepository<TblUsers>(TblUsers);
    let user = await userRepo.findOne({
      where: {
        userId: payload.userId,
      },
    });

    let role = ROLE.ADMIN; // getRoleFromUser(user);
    createRefreshTokenCookies(res, user.userId, payload.rememberMe);
    createAccessTokenCookies(res, user.userId, role);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(401);
  }
});

export function mustBeLoggedIn(req, res, next) {
  try {
    if (hasAccessToken(req)) {
      let jwt = buildAccessToken(req);
      if (!verifyJwt(jwt)) {
        res.sendStatus(401);
        return;
      }
      next();
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(401);
  }
}

export function mustBeLoggedInAndAdmin(req, res, next) {
  try {
    if (hasAccessToken(req)) {
      let jwt = buildAccessToken(req);
      if (!verifyJwt(jwt)) {
        res.sendStatus(401);
        return;
      }
      let payload = jwt_decode(jwt) as AccessTokenPayload;
      if (payload.role == ROLE.ADMIN) {
        next();
        return;
      }
    }
    res.sendStatus(401);
  } catch {
    res.sendStatus(401);
  }
}

router.get("/segreto", mustBeLoggedInAndAdmin, function (req, res) {
  res.send("SEGRETO");
});

export { router as authRouter };
