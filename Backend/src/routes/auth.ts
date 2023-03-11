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
  ACCESS_TOKEN_PAYLOAD,
  ACCESS_TOKEN_SIGNATURE,
  buildAccessToken,
  buildRefreshToken,
  createAccessTokenCookies,
  createRefreshTokenCookies,
  hasAccessToken,
  hasRefreshToken,
  REFRESH_TOKEN_PAYLOAD,
  REFRESH_TOKEN_SIGNATURE,
  verifyJwt,
} from "../helper/cookie";
import Keyv from "@keyvhq/core";

const router = express.Router();
const keyv = new Keyv();

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

    if (keyv.has(user.userId)) keyv.delete(user.userId);
    let role = getRoleFromUser(user);
    createRefreshTokenCookies(res, user.userId, login.rememberMe);
    createAccessTokenCookies(res, user.userId, role);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(401);
  }
});

router.post(
  "/refresh",
  isAllowedRefresh,
  async function (req: Request, res: Response) {
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

      let role = getRoleFromUser(user);
      createRefreshTokenCookies(res, user.userId, payload.rememberMe);
      createAccessTokenCookies(res, user.userId, role);
      res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.sendStatus(401);
    }
  }
);

router.post("/logout", async function (req: Request, res: Response) {
  try {
    let [hasRefresh, hasAccess] = [hasRefreshToken(req), hasRefreshToken(req)];
    if (!hasRefresh && !hasAccess) {
      res.sendStatus(400);
      return;
    }

    if (hasRefresh) {
      let jwt = buildRefreshToken(req);
      let payload = jwt_decode(jwt) as RefreshTokenPayload;
      console.log(payload, dayjs().diff(dayjs(payload.exp), "ms"));
      await keyv.set(payload.userId, 1, dayjs().diff(dayjs(payload.exp), "ms"));
      res.clearCookie(REFRESH_TOKEN_PAYLOAD);
      res.clearCookie(REFRESH_TOKEN_SIGNATURE);
    }

    if (hasAccess) {
      let jwt = buildAccessToken(req);
      let payload = jwt_decode(jwt) as AccessTokenPayload;
      if (!keyv.has(payload.userId))
        await keyv.set(
          payload.userId,
          1,
          dayjs().diff(dayjs(payload.exp), "ms")
        );
      res.clearCookie(ACCESS_TOKEN_PAYLOAD);
      res.clearCookie(ACCESS_TOKEN_SIGNATURE);
    }

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

function isAllowedRequestToken(req) {
  try {
    if (!hasRefreshToken(req)) return false;
    let jwt = buildRefreshToken(req);
    let payload = jwt_decode(jwt) as RefreshTokenPayload;
    if (keyv.has(payload.userId)) return false;
    return true;
  } catch {
    return false;
  }
}

export function isAllowedRefresh(req, res, next) {
  try {
    if (!isAllowedRequestToken(req)) {
      res.clearCookie(REFRESH_TOKEN_PAYLOAD);
      res.clearCookie(REFRESH_TOKEN_SIGNATURE);
      res.sendStatus(401);
      return;
    }
    next();
  } catch (err) {
    console.log(err);
    res.sendStatus(401);
  }
}

function isAllowedAccessToken(req) {
  try {
    let jwt = buildRefreshToken(req);
    let payload = jwt_decode(jwt) as RefreshTokenPayload;
    if (keyv.has(payload.userId)) return false;
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function isAllowedResource(req, res, next) {
  try {
    if (!isAllowedAccessToken(req)) {
      res.clearCookie(ACCESS_TOKEN_PAYLOAD);
      res.clearCookie(ACCESS_TOKEN_SIGNATURE);
      console.log("NOT ALLOWED ANYMORE");
      res.sendStatus(401);
      return;
    }
    next();
  } catch (err) {
    console.log(err);
    res.sendStatus(401);
  }
}

export function isLoggedIn(req, res, next) {
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

export function isLoggedInAndAdmin(req, res, next) {
  try {
    if (hasAccessToken(req)) {
      let jwt = buildAccessToken(req);
      if (!verifyJwt(jwt)) {
        res.sendStatus(401);
        return;
      }
      let payload = jwt_decode(jwt) as AccessTokenPayload;
      console.log(payload);
      if (payload.role == ROLE.ADMIN) {
        next();
        return;
      }
    }
    res.sendStatus(401);
  } catch (err) {
    console.log(err);
    res.sendStatus(401);
  }
}

router.get(
  "/segreto",
  isLoggedInAndAdmin,
  isAllowedResource,
  function (req, res) {
    res.send("SEGRETO");
  }
);

export { router as authRouter };
