import express from "express";

import { Login } from "shared/dist/dto/login";
import { PasswordRecovery } from "shared/dist/dto/PasswordRecovery";
import { getRepository } from "../database/datasource";
import { TblUsers } from "../database/entities/TblUsers";
import bcrypt from "bcrypt";
import {
  ACCESS_TOKEN_PAYLOAD,
  ACCESS_TOKEN_SIGNATURE,
  buildAccessToken,
  createAccessTokenCookies,
  decodeAccessToken,
} from "../helper/cookie";

import { v4 as uuidv4 } from "uuid";
import { validate, VALIDATION_LANGUAGE } from "shared/dist/utils/validator";
import dayjs from "dayjs";
import {
  NewPassword,
  NewPasswordResponse,
  NEW_PASSWORD_STATUS,
} from "shared/dist/dto/newPassword";
import { sendPasswordRecoveryEmail, sendVerifyEmail } from "../helper/mail";

import {
  User,
  REGISTRATION_STATUS,
  RegistrationResponse,
} from "shared/dist/dto/user";

import { Verify, VerifyResponse, VERIFY_STATUS } from "shared/dist/dto/verify";
import { UserSessionData } from "../dto/userSessionData";
import { AuthRequest } from "../dto/AuthRequest";
import { isLoggedIn } from "../helper/middleware";
import { ENDPOINTS } from "shared/dist/constants/endpoints";
import { LoginResponse } from "shared/dist/dto/loginResponse";
import { sessionCache } from "../../index";

const router = express.Router();

router.post(ENDPOINTS.LOGIN, async function (req, res) {
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

    if (userData.userStatus !== "Y") {
      res.sendStatus(403);
      return;
    }

    let studentCourseIds = userData.assocStudenti
      .filter((assocStudente) => assocStudente.attivo == 1)
      .map((item) => item.idCorso);

    let teacherCourseIds = userData.assocDocenti.map((item) => item.idCorso);
    let isAdmin = !!userData.admin;
    let expirationDate = +dayjs().add(15, login.rememberMe ? "d" : "m");
    let sessionId = uuidv4();
    await sessionCache.set(
      sessionId,
      {
        id: userData.id,
        userName: userData.userName,
        userId: userData.userId,
        isAdmin: isAdmin,
        studentCourseIds: studentCourseIds,
        teacherCourseIds: teacherCourseIds,
      } as UserSessionData,
      expirationDate
    );
    createAccessTokenCookies(res, sessionId, isAdmin, login.rememberMe);

    res.status(200);
    res.send({
      userId: userData.userId,
      userName: userData.userName,
      avatar: userData.avatar,
      isAdmin: isAdmin,
    } as LoginResponse);
  } catch (err) {
    console.log(err);
    res.sendStatus(401);
  }
});

router.post(
  ENDPOINTS.LOGOUT,
  isLoggedIn,
  async function (req: AuthRequest, res) {
    try {
      let jwt = buildAccessToken(req);
      let accessToken = decodeAccessToken(jwt);
      let result = await sessionCache.has(accessToken.sessionId);
      if (result) await sessionCache.delete(accessToken.sessionId);
      res.clearCookie(ACCESS_TOKEN_PAYLOAD);
      res.clearCookie(ACCESS_TOKEN_SIGNATURE);
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(400);
    }
  }
);

router.post(ENDPOINTS.PASSWORD_RESET, async function (req, res) {
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

router.post(ENDPOINTS.NEW_PASSWORD_CHECK, async function (req, res) {
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
});

router.post(ENDPOINTS.NEW_PASSWORD, async function (req, res) {
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

router.post(ENDPOINTS.REGISTRATION, async function (req, res) {
  try {
    let user = new User(req.body);
    let errors = await validate(user, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    let userRepo = await getRepository<TblUsers>(TblUsers);
    if (
      !!(await userRepo.findOne({
        where: {
          userId: user.userId,
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
          userEmail: user.userEmail,
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

    let hash = await bcrypt.hash(user.userPass, +process.env.SECRET);
    let userData = new TblUsers();

    userData.userId = user.userId;
    userData.userEmail = user.userEmail;
    userData.userName = user.userName;
    userData.userPass = hash;
    userData.tokenCode = "";

    let expirationDate = +dayjs().add(15, "m");
    let userDataJSON = JSON.stringify(userData);
    await sessionCache.set(token, userDataJSON, expirationDate);

    await sendVerifyEmail({
      userEmail: user.userEmail,
      userName: user.userName,
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

router.post(ENDPOINTS.VERIFY, async function (req, res) {
  try {
    let verify = new Verify(req.body);
    let errors = await validate(verify, VALIDATION_LANGUAGE.IT);
    console.log(errors);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    if (!(await sessionCache.has(verify.token))) {
      res.send({
        status: VERIFY_STATUS.FAIL,
      } as VerifyResponse);
    }

    let userRepo = await getRepository<TblUsers>(TblUsers);
    let userDataJSON = await sessionCache.get(verify.token);
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
