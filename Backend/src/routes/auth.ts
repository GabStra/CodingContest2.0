import express, { Request, response, Response } from "express";
import { AccessTokenPayload } from "shared/dist/models/accessTokenPayload";
import { ROLE } from "shared/dist/models/role";
import { Login } from "shared/dist/view_models/login";
import { getRepository } from "../database/datasource";
import { TblUsers } from "../database/entities/TblUsers";
import bcrypt from "bcrypt";
import jwt_decode from "jwt-decode";
import { getRoleFromUser } from "../helper/role";
import {
  ACCESS_TOKEN_PAYLOAD,
  ACCESS_TOKEN_SIGNATURE,
  buildAccessToken,
  createAccessTokenCookies,
  decodeAccessToken,
  hasAccessToken,
  verifyJwt,
} from "../helper/cookie";
import Keyv from "@keyvhq/core";
import { v4 as uuidv4 } from "uuid";
import { validate, VALIDATION_LANGUAGE } from "shared/dist/helper/validator";
import dayjs from "dayjs";
const router = express.Router();
const keyv = new Keyv();

router.post("/login", async function (req: Request, res: Response) {
  try {
    let login = new Login(req.body);
    let errors = await validate(login, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.sendStatus(400);
      res.send(errors);
      return;
    }
    let userRepo = await getRepository<TblUsers>(TblUsers);
    let userData = await userRepo.findOne({
      where: {
        userEmail: login.email,
      },
      relations: {
        admin: true,
      },
    });

    let result = await bcrypt.compare(login.password, userData.userPass);
    if (!userData || !result) {
      res.sendStatus(401);
      return;
    }

    let role = getRoleFromUser(userData);
    let expirationDate = +dayjs().add(15, login.rememberMe ? "d" : "m");
    let sessionId = uuidv4();
    keyv.set(sessionId, userData.userId, expirationDate);
    createAccessTokenCookies(res, sessionId, role, login.rememberMe);
    res.sendStatus(200);
  } catch {
    res.sendStatus(401);
  }
});

router.post("/logout", async function (req: Request, res: Response) {
  try {
    let jwt = buildAccessToken(req);
    let accessToken = decodeAccessToken(jwt);
    if (keyv.has(accessToken.sessionId))
      await keyv.delete(accessToken.sessionId);
    res.clearCookie(ACCESS_TOKEN_PAYLOAD);
    res.clearCookie(ACCESS_TOKEN_SIGNATURE);

    res.sendStatus(200);
  } catch {
    res.sendStatus(400);
  }
});

export async function isLoggedIn(req, res, next) {
  if (!hasAccessToken(req)) {
    res.sendStatus(401);
    return;
  }

  let jwt = buildAccessToken(req);
  let accessToken = decodeAccessToken(jwt);
  let isInvalid = !verifyJwt(jwt);
  let isSessionInvalid = !keyv.has(accessToken.sessionId);
  if (isInvalid && !isSessionInvalid) await keyv.delete(accessToken.sessionId);

  if (isInvalid || isSessionInvalid) {
    res.clearCookie(ACCESS_TOKEN_PAYLOAD);
    res.clearCookie(ACCESS_TOKEN_SIGNATURE);
    res.sendStatus(401);
    return;
  }

  next();
}

export function isAdmin(req, res, next) {
  let jwt = buildAccessToken(req);
  let accessToken = decodeAccessToken(jwt);
  if (accessToken.role === ROLE.ADMIN) next();
  else res.sendStatus(401);
}

//ESEMPIO RISORSA PROTETTA
router.get("/segreto", isLoggedIn, isAdmin, function (req, res) {
  res.send("SEGRETO");
});

export { router as authRouter };
