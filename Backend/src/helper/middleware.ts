import { ROLES } from "shared/constants/roles";
import { AuthRequestWithCourseId } from "../dto/AuthRequest";
import {
  ACCESS_TOKEN_PAYLOAD,
  ACCESS_TOKEN_SIGNATURE,
  buildAccessToken,
  decodeAccessToken,
  hasAccessToken,
  verifyJwt,
} from "./cookie";
import { AuthRequest } from "../dto/AuthRequest";
import { cache } from "../routes/auth";

export async function isLoggedIn(req: AuthRequest, res, next) {
  if (!hasAccessToken(req)) {
    res.sendStatus(401);
    return;
  }

  let jwt = buildAccessToken(req);
  let accessToken = decodeAccessToken(jwt);
  let isInvalid = !verifyJwt(jwt);
  let isSessionInvalid = !(await cache.has(accessToken.sessionId));
  if (isInvalid && !isSessionInvalid) await cache.delete(accessToken.sessionId);

  if (isInvalid || isSessionInvalid) {
    res.clearCookie(ACCESS_TOKEN_PAYLOAD);
    res.clearCookie(ACCESS_TOKEN_SIGNATURE);
    res.sendStatus(401);
    return;
  }
  req.userData = await cache.get(accessToken.sessionId);
  next();
}

export function isAdmin(req, res, next) {
  let jwt = buildAccessToken(req);
  let accessToken = decodeAccessToken(jwt);
  if (accessToken.role === ROLES.ADMIN) next();
  else res.sendStatus(401);
}

export function isSuperAdmin(req, res, next) {
  let jwt = buildAccessToken(req);
  let accessToken = decodeAccessToken(jwt);
  if (accessToken.role === ROLES.SUPER_ADMIN) next();
  else res.sendStatus(401);
}

export async function isTeacher(req: AuthRequestWithCourseId, res, next) {
  try {
    if (!req.query.course) throw "invalid";
    req.courseId = Number(req.query.course);
    if (!req.userData.teacherCourseIds.includes(req.courseId)) {
      res.sendStatus(403);
      return;
    }
    next();
  } catch {
    res.status(400);
    res.send("query parameter 'course' is missing");
  }
}

export async function isStudent(req: AuthRequestWithCourseId, res, next) {
  try {
    if (!req.query.course) throw "invalid";
    req.courseId = Number(req.query.course);
    if (req.userData.studentCourseIds.includes(req.courseId) === false) {
      res.sendStatus(403);
      return;
    }
    next();
  } catch {
    res.status(400);
    res.send("query parameter 'course' is missing");
  }
}

export async function hasTitleQueryParam(req, res, next) {
  try {
    if (!req.query.title) throw "invalid";
    req.title = String(req.query.title);
    next();
  } catch {
    res.status(400);
    res.send("query parameter 'title' is missing");
  }
}

export async function hasCourseQueryParam(req, res, next) {
  try {
    if (!req.query.course) throw "invalid";
    req.courseId = Number(req.query.course);
    next();
  } catch {
    res.status(400);
    res.send("query parameter 'course' is missing");
  }
}
