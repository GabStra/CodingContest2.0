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
import { sessionCache } from "../../index";

export async function isLoggedIn(req: AuthRequest, res, next) {
  if (!hasAccessToken(req)) {
    res.sendStatus(401);
    return;
  }

  let jwt = buildAccessToken(req);
  let accessToken = decodeAccessToken(jwt);
  let isInvalid = !verifyJwt(jwt);
  let isSessionInvalid = !(await sessionCache.has(accessToken.sessionId));
  if (isInvalid && !isSessionInvalid)
    await sessionCache.delete(accessToken.sessionId);

  if (isInvalid || isSessionInvalid) {
    res.clearCookie(ACCESS_TOKEN_PAYLOAD);
    res.clearCookie(ACCESS_TOKEN_SIGNATURE);
    res.sendStatus(401);
    return;
  }
  req.userData = await sessionCache.get(accessToken.sessionId);
  next();
}

export function isAdmin(req: AuthRequest, res, next) {
  if (req.userData.isAdmin) next();
  else res.sendStatus(401);
}

export function isTeacher(req: AuthRequestWithCourseId, res, next) {
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

export function isStudent(req: AuthRequestWithCourseId, res, next) {
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

export function hasTitleQueryParam(req, res, next) {
  try {
    if (!req.query.title) throw "invalid";
    req.title = String(req.query.title);
    next();
  } catch {
    res.status(400);
    res.send("query parameter 'title' is missing");
  }
}

export function hasCourseQueryParam(req, res, next) {
  try {
    if (!req.query.course) throw "invalid";
    req.courseId = Number(req.query.course);
    next();
  } catch {
    res.status(400);
    res.send("query parameter 'course' is missing");
  }
}
