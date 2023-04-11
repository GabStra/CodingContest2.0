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
import { UserDataDTO } from "shared/dist/dto/userDataDTO";
import {
  NewPasswordDTO,
  NewPasswordResponseDTO,
  NEW_PASSWORD_STATUS,
} from "shared/dist/dto/newPasswordDTO";
import { sendPasswordRecoveryEmail, sendVerifyEmail } from "../helper/mail";

import {
  RegistrationDTO,
  REGISTRATION_STATUS,
  RegistrationResponseDTO,
} from "shared/dist/dto/registrationDTO";

import {
  VerifyDTO,
  VerifyResponseDTO,
  VERIFY_STATUS,
} from "shared/dist/dto/verifyDTO";
import { UserData } from "../model/UserData";
import { AuthRequest } from "../model/AuthRequest";
import { TblAssocStudenti } from "../database/entities/TblAssocStudenti";
import { TblAssocDocenti } from "../database/entities/TblAssocDocenti";
import { TeacherRequest } from "../model/TeacherRequest";

const router = express.Router();
const keyv = new Keyv();

router.post("/login", async function (req: Request, res: Response) {
  try {
    let loginDTO = new LoginDTO(req.body);
    let errors = await validate(loginDTO, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.status(400);
      console.log(errors);
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
        assocStudenti: true,
        assocDocenti: true,
      },
    });

    let result = await bcrypt.compare(loginDTO.password, userData.userPass);
    if (!userData || !result) {
      res.sendStatus(401);
      return;
    }

    let studentCourseIds = userData.assocStudenti
      .filter((assocStudente) => assocStudente.attivo == 1)
      .map((item) => item.idCorso);

    let teacherCourseIds = userData.assocDocenti.map((item) => item.idCorso);

    let role = getRoleFromUser(userData);
    let expirationDate = +dayjs().add(15, loginDTO.rememberMe ? "d" : "m");
    let sessionId = uuidv4();
    await keyv.set(
      sessionId,
      {
        id: userData.id,
        userId: userData.userId,
        role: role,
        studentCourseIds: studentCourseIds,
        teacherCourseIds: teacherCourseIds,
      } as UserData,
      expirationDate
    );
    createAccessTokenCookies(res, sessionId, role, loginDTO.rememberMe);

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
    let result = await keyv.has(accessToken.sessionId);
    if (result) await keyv.delete(accessToken.sessionId);
    res.clearCookie(ACCESS_TOKEN_PAYLOAD);
    res.clearCookie(ACCESS_TOKEN_SIGNATURE);
    res.sendStatus(200);
  } catch (err) {
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
      let newPasswordDTO = new NewPasswordDTO(req.body);
      let errors = await validate(newPasswordDTO, VALIDATION_LANGUAGE.IT);
      console.log(errors);
      if (errors.length > 1) {
        res.sendStatus(400);
        return;
      }

      let userRepo = await getRepository<TblUsers>(TblUsers);
      let userData = await userRepo.findOne({
        where: {
          tokenCode: newPasswordDTO.token,
        },
      });
      if (!userData) {
        res.send({
          status: NEW_PASSWORD_STATUS.FAIL,
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
    if (errors.length > 1) {
      res.sendStatus(400);
      return;
    }

    let userRepo = await getRepository<TblUsers>(TblUsers);
    let userData = await userRepo.findOne({
      where: {
        tokenCode: newPasswordDTO.token,
      },
    });

    if (!userData) {
      res.send({
        status: NEW_PASSWORD_STATUS.FAIL,
      } as NewPasswordResponseDTO);
      return;
    }

    let hash = await bcrypt.hash(newPasswordDTO.password, +process.env.SECRET);
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

router.post("/registration", async function (req: Request, res: Response) {
  try {
    let registrationDTO = new RegistrationDTO(req.body);
    let errors = await validate(registrationDTO, VALIDATION_LANGUAGE.IT);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    let userRepo = await getRepository<TblUsers>(TblUsers);
    if (
      !!(await userRepo.findOne({
        where: {
          userId: registrationDTO.userId,
        },
      }))
    ) {
      res.send({
        status: REGISTRATION_STATUS.UserIdInUse,
      } as RegistrationResponseDTO);
      return;
    }

    if (
      !!(await userRepo.findOne({
        where: {
          userEmail: registrationDTO.userEmail,
        },
      }))
    ) {
      res.send({
        status: REGISTRATION_STATUS.EmailInUse,
      } as RegistrationResponseDTO);
      return;
    }

    let token = uuidv4();
    let link = `${process.env.FRONTEND_HOST}/verifica?token=${token}`;

    let hash = await bcrypt.hash(registrationDTO.userPass, +process.env.SECRET);
    let userData = new TblUsers();

    userData.userId = registrationDTO.userId;
    userData.userEmail = registrationDTO.userEmail;
    userData.userName = registrationDTO.userName;
    userData.userPass = hash;
    userData.tokenCode = "";

    let expirationDate = +dayjs().add(15, "m");
    let userDataJSON = JSON.stringify(userData);
    await keyv.set(token, userDataJSON, expirationDate);

    await sendVerifyEmail({
      userEmail: registrationDTO.userEmail,
      userName: registrationDTO.userName,
      verifyLink: link,
    });

    res.send({
      status: REGISTRATION_STATUS.Success,
    } as RegistrationResponseDTO);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

router.post("/verify", async function (req: Request, res: Response) {
  try {
    let verifyDTO = new VerifyDTO(req.body);
    let errors = await validate(verifyDTO, VALIDATION_LANGUAGE.IT);
    console.log(errors);
    if (errors.length !== 0) {
      res.sendStatus(400);
      return;
    }

    if (!(await keyv.has(verifyDTO.token))) {
      res.send({
        status: VERIFY_STATUS.FAIL,
      } as VerifyResponseDTO);
    }

    let userRepo = await getRepository<TblUsers>(TblUsers);
    let userDataJSON = await keyv.get(verifyDTO.token);
    let userData = JSON.parse(userDataJSON);
    userData.tokenCode = "";
    userData.userStatus = "Y";
    await userRepo.save(userData);

    res.send({
      status: VERIFY_STATUS.SUCCESS,
    } as VerifyResponseDTO);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

export async function isLoggedIn(req: AuthRequest, res, next) {
  if (!hasAccessToken(req)) {
    res.sendStatus(401);
    return;
  }

  let jwt = buildAccessToken(req);
  let accessToken = decodeAccessToken(jwt);
  let isInvalid = !verifyJwt(jwt);
  let isSessionInvalid = !(await keyv.has(accessToken.sessionId));
  if (isInvalid && !isSessionInvalid) await keyv.delete(accessToken.sessionId);

  if (isInvalid || isSessionInvalid) {
    res.clearCookie(ACCESS_TOKEN_PAYLOAD);
    res.clearCookie(ACCESS_TOKEN_SIGNATURE);
    res.sendStatus(401);
    return;
  }
  req.userData = await keyv.get(accessToken.sessionId);
  next();
}

export function isAdmin(req, res, next) {
  let jwt = buildAccessToken(req);
  let accessToken = decodeAccessToken(jwt);
  if (accessToken.role === ROLE.ADMIN) next();
  else res.sendStatus(401);
}

export function isSuperAdmin(req, res, next) {
  let jwt = buildAccessToken(req);
  let accessToken = decodeAccessToken(jwt);
  if (accessToken.role === ROLE.SUPER_ADMIN) next();
  else res.sendStatus(401);
}

export async function isTeacher(req: TeacherRequest, res, next) {
  try {
    if (!req.query.course) throw "invalid";
    req.courseId = Number(req.query.course);
    if (!req.userData.teacherCourseIds.includes(req.courseId)) {
      res.sendStatus(401);
      return;
    }
    next();
  } catch {
    res.status(400);
    res.send("query parameter 'course' is missing");
  }
}

//ESEMPIO RISORSA PROTETTA
router.get("/segreto", isLoggedIn, isAdmin, function (req, res) {
  res.send("SEGRETO");
});

export { router as authRouter };
