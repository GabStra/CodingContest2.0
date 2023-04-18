import express, { Request, response, Response } from "express";
import { AccessTokenPayload } from "shared/dto/accessTokenPayload";
import { ROLES } from "shared/constants/roles";
import { Login } from "shared/dto/login";
import { PasswordRecovery } from "shared/dto/PasswordRecovery";
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
import { validate, VALIDATION_LANGUAGE } from "shared/utils/validator";
import dayjs from "dayjs";
import { UserData as UserDataDTO } from "shared/dto/userData";
import {
  NewPassword,
  NewPasswordResponse,
  NEW_PASSWORD_STATUS,
} from "shared/dto/newPassword";
import { sendPasswordRecoveryEmail, sendVerifyEmail } from "../helper/mail";

import {
  Registration,
  REGISTRATION_STATUS,
  RegistrationResponse,
} from "shared/dto/registration";

import { Verify, VerifyResponse, VERIFY_STATUS } from "shared/dto/verify";
import { UserData } from "../dto/UserData";
import { AuthRequest } from "../dto/AuthRequest";
import { TblAssocStudenti } from "../database/entities/TblAssocStudenti";
import { TblAssocDocenti } from "../database/entities/TblAssocDocenti";
import { CourseRequest } from "../dto/CourseRequest";

const router = express.Router();
export const cache = new Keyv();

router.post("/login", async function (req: Request, res: Response) {
  try {
    let login = new Login(req.body);
    let errors = await validate(login, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.status(400);
      console.log(errors);
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
        assocStudenti: true,
        assocDocenti: true,
      },
    });

    let result = await bcrypt.compare(login.password, userData.userPass);
    if (!userData || !result) {
      res.sendStatus(401);
      return;
    }

    let studentCourseIds = userData.assocStudenti
      .filter((assocStudente) => assocStudente.attivo == 1)
      .map((item) => item.idCorso);

    let teacherCourseIds = userData.assocDocenti.map((item) => item.idCorso);

    let role = getRoleFromUser(userData);
    let expirationDate = +dayjs().add(15, login.rememberMe ? "d" : "m");
    let sessionId = uuidv4();
    await cache.set(
      sessionId,
      {
        id: userData.id,
        userName: userData.userName,
        userId: userData.userId,
        role: role,
        studentCourseIds: studentCourseIds,
        teacherCourseIds: teacherCourseIds,
      } as UserData,
      expirationDate
    );
    createAccessTokenCookies(res, sessionId, role, login.rememberMe);

    res.status(200);
    res.send({
      userId: userData.userId,
      userName: userData.userName,
      avatar: userData.avatar,
      role: role,
    } as UserDataDTO);
  } catch (err) {
    console.log(err);
    res.sendStatus(401);
  }
});

router.post("/logout", async function (req: Request, res: Response) {
  try {
    let jwt = buildAccessToken(req);
    let accessToken = decodeAccessToken(jwt);
    let result = await cache.has(accessToken.sessionId);
    if (result) await cache.delete(accessToken.sessionId);
    res.clearCookie(ACCESS_TOKEN_PAYLOAD);
    res.clearCookie(ACCESS_TOKEN_SIGNATURE);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(400);
  }
});

router.post("/password-reset", async function (req: Request, res: Response) {
  try {
    let passwordRecovery = new PasswordRecovery(req.body);
    let errors = await validate(passwordRecovery, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.status(400);
      res.send(errors);
      return;
    }
    let userRepo = await getRepository<TblUsers>(TblUsers);
    let userData = await userRepo.findOne({
      where: {
        userEmail: passwordRecovery.email,
      },
    });
    if (!userData) {
      res.sendStatus(200);
      return;
    }

    let token = uuidv4();
    let link = `${process.env.FRONTEND_HOST}/nuova-password?token=${token}`;
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
      let newPassword = new NewPassword(req.body);
      let errors = await validate(newPassword, VALIDATION_LANGUAGE.IT);
      console.log(errors);
      if (errors.length > 1) {
        res.sendStatus(400);
        return;
      }

      let userRepo = await getRepository<TblUsers>(TblUsers);
      let userData = await userRepo.findOne({
        where: {
          tokenCode: newPassword.token,
        },
      });
      if (!userData) {
        res.send({
          status: NEW_PASSWORD_STATUS.FAIL,
        } as NewPasswordResponse);
        return;
      }

      res.send({
        status: NEW_PASSWORD_STATUS.SUCCESS,
      } as NewPasswordResponse);
    } catch (err) {
      console.log(err);
      res.sendStatus(400);
    }
  }
);

router.post("/new-password", async function (req: Request, res: Response) {
  try {
    let newPassword = new NewPassword(req.body);
    let errors = await validate(newPassword, VALIDATION_LANGUAGE.IT);
    if (errors.length > 1) {
      res.sendStatus(400);
      return;
    }

    let userRepo = await getRepository<TblUsers>(TblUsers);
    let userData = await userRepo.findOne({
      where: {
        tokenCode: newPassword.token,
      },
    });

    if (!userData) {
      res.send({
        status: NEW_PASSWORD_STATUS.FAIL,
      } as NewPasswordResponse);
      return;
    }

    let hash = await bcrypt.hash(newPassword.password, +process.env.SECRET);
    userData.userPass = hash;
    await userRepo.save(userData);

    res.send({
      status: NEW_PASSWORD_STATUS.SUCCESS,
    } as NewPasswordResponse);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

router.post("/registration", async function (req: Request, res: Response) {
  try {
    let registration = new Registration(req.body);
    let errors = await validate(registration, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    let userRepo = await getRepository<TblUsers>(TblUsers);
    if (
      !!(await userRepo.findOne({
        where: {
          userId: registration.userId,
        },
      }))
    ) {
      res.send({
        status: REGISTRATION_STATUS.UserIdInUse,
      } as RegistrationResponse);
      return;
    }

    if (
      !!(await userRepo.findOne({
        where: {
          userEmail: registration.userEmail,
        },
      }))
    ) {
      res.send({
        status: REGISTRATION_STATUS.EmailInUse,
      } as RegistrationResponse);
      return;
    }

    let token = uuidv4();
    let link = `${process.env.FRONTEND_HOST}/verifica?token=${token}`;

    let hash = await bcrypt.hash(registration.userPass, +process.env.SECRET);
    let userData = new TblUsers();

    userData.userId = registration.userId;
    userData.userEmail = registration.userEmail;
    userData.userName = registration.userName;
    userData.userPass = hash;
    userData.tokenCode = "";

    let expirationDate = +dayjs().add(15, "m");
    let userDataJSON = JSON.stringify(userData);
    await cache.set(token, userDataJSON, expirationDate);

    await sendVerifyEmail({
      userEmail: registration.userEmail,
      userName: registration.userName,
      verifyLink: link,
    });

    res.send({
      status: REGISTRATION_STATUS.Success,
    } as RegistrationResponse);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

router.post("/verify", async function (req: Request, res: Response) {
  try {
    let verify = new Verify(req.body);
    let errors = await validate(verify, VALIDATION_LANGUAGE.IT);
    console.log(errors);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    if (!(await cache.has(verify.token))) {
      res.send({
        status: VERIFY_STATUS.FAIL,
      } as VerifyResponse);
    }

    let userRepo = await getRepository<TblUsers>(TblUsers);
    let userDataJSON = await cache.get(verify.token);
    let userData = JSON.parse(userDataJSON);
    userData.tokenCode = "";
    userData.userStatus = "Y";
    await userRepo.save(userData);

    res.send({
      status: VERIFY_STATUS.SUCCESS,
    } as VerifyResponse);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

export { router as authRouter };
