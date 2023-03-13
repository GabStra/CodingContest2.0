import express, { Request, response, Response } from "express";
import { AccessTokenPayload } from "shared/dist/models/accessTokenPayload";
import { ROLE } from "shared/dist/constants/role";
import { LoginDTO } from "shared/dist/dto/loginDTO";
import { PasswordRecoveryDTO } from "shared/dist/dto/PasswordRecoveryDTO";
import { getRepository } from "../database/datasource";
import { TblUsers } from "../database/entities/TblUsers";
import bcrypt from "bcrypt";
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
import { UserDataDTO } from "shared/dto/userDataDTO";
import { NewPasswordDTO } from "shared/dto/newPasswordDTO";
import { NewPasswordResponseDTO } from "shared/dto/NewPasswordResponseDTO";
import { NEW_PASSWORD_STATUS } from "shared/dist/constants/new_password_status";
import { sendPasswordRecoveryEmail } from "../helper/mail";
import Cryptr from "cryptr";
const router = express.Router();
const keyv = new Keyv();

router.post("/login", async function (req: Request, res: Response) {
  try {
    let loginDTO = new LoginDTO(req.body);
    let errors = await validate(loginDTO, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.status(400);
      res.send(errors);
      return;
    }
    let userRepo = await getRepository<TblUsers>(TblUsers);
    let userData = await userRepo.findOne({
      where: {
        userEmail: loginDTO.email,
      },
      relations: {
        admin: true,
      },
    });

    let result = await bcrypt.compare(loginDTO.password, userData.userPass);
    if (!userData || !result) {
      res.sendStatus(401);
      return;
    }

    let role = getRoleFromUser(userData);
    let expirationDate = +dayjs().add(15, loginDTO.rememberMe ? "d" : "m");
    let sessionId = uuidv4();
    keyv.set(sessionId, userData.userId, expirationDate);
    createAccessTokenCookies(res, sessionId, role, loginDTO.rememberMe);

    res.status(200);
    res.send({
      userId: userData.userId,
      userName: userData.userName,
      avatar: userData.avatar,
      role: role,
    } as UserDataDTO);
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

router.post("/password-reset", async function (req: Request, res: Response) {
  try {
    let passwordRecoveryDTO = new PasswordRecoveryDTO(req.body);
    let errors = await validate(passwordRecoveryDTO, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.status(400);
      res.send(errors);
      return;
    }
    let userRepo = await getRepository<TblUsers>(TblUsers);
    let userData = await userRepo.findOne({
      where: {
        userEmail: passwordRecoveryDTO.email,
      },
    });
    if (!userData) {
      res.sendStatus(200);
      return;
    }

    const cryptr = new Cryptr(process.env.SECRET);
    let token = cryptr.encrypt(userData.userId);
    let link = `${process.env.FRONTEND_HOST}/new-password?token=${token}`;

    userData.tokenCode = token;
    await userRepo.save(userData);

    await sendPasswordRecoveryEmail({
      userEmail: userData.userEmail,
      userName: userData.userName,
      passwordRecoveryLink: link,
    });

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

router.post(
  "/new-password-check",
  async function (req: Request, res: Response) {
    try {
      let newPasswordDTO = new NewPasswordDTO(req.body);
      let errors = await validate(newPasswordDTO, VALIDATION_LANGUAGE.IT);
      if (errors.length !== 0) {
        res.sendStatus(400);
        return;
      }

      const cryptr = new Cryptr(process.env.SECRET);
      let userId = cryptr.decrypt(newPasswordDTO.token);
      let userRepo = await getRepository<TblUsers>(TblUsers);
      let userData = await userRepo.findOne({
        where: {
          userId: userId,
        },
      });
      if (!userData) {
        res.send({
          status: NEW_PASSWORD_STATUS.FAIL,
        } as NewPasswordResponseDTO);
        return;
      }

      if (userData.tokenCode !== newPasswordDTO.token) {
        res.send({
          status: NEW_PASSWORD_STATUS.EXPIRED,
        } as NewPasswordResponseDTO);
        return;
      }
      res.send({
        status: NEW_PASSWORD_STATUS.SUCCESS,
      } as NewPasswordResponseDTO);
    } catch (err) {
      console.log(err);
      res.sendStatus(400);
    }
  }
);

router.post("/new-password", async function (req: Request, res: Response) {
  try {
    let newPasswordDTO = new NewPasswordDTO(req.body);
    let errors = await validate(newPasswordDTO, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    const cryptr = new Cryptr(process.env.SECRET);
    let userId = cryptr.decrypt(newPasswordDTO.token);
    let userRepo = await getRepository<TblUsers>(TblUsers);
    let userData = await userRepo.findOne({
      where: {
        userId: userId,
      },
    });

    if (!userData) {
      res.send({
        status: NEW_PASSWORD_STATUS.FAIL,
      } as NewPasswordResponseDTO);
      return;
    }

    if (userData.tokenCode !== newPasswordDTO.token) {
      res.send({
        status: NEW_PASSWORD_STATUS.EXPIRED,
      } as NewPasswordResponseDTO);
      return;
    }

    let hash = await bcrypt.hash(newPasswordDTO.password, process.env.SECRET);
    userData.userPass = hash;
    await userRepo.save(userData);

    res.send({
      status: NEW_PASSWORD_STATUS.SUCCESS,
    } as NewPasswordResponseDTO);
  } catch (err) {
    console.log(err);
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
