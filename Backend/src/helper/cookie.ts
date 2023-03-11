import dayjs from "dayjs";
import { AccessTokenPayload } from "../../../Shared/models/accessTokenPayload";
import { RefreshTokenPayload } from "../../../Shared/models/refreshTokenPayload";
import { ROLE } from "../../../Shared/models/role";
import jsonwebtoken, { SignOptions, Algorithm } from "jsonwebtoken";
import fs from "fs";
import { Request, Response } from "express";
import appRootPath from "app-root-path";

export const privateKey = fs.readFileSync(
  appRootPath.resolve("keys/cookie/private.key"),
  "utf8"
);
export const publicKey = fs.readFileSync(
  appRootPath.resolve("keys/cookie/public.key"),
  "utf8"
);

export const ACCESS_TOKEN_PAYLOAD = "access_token_payload";
export const ACCESS_TOKEN_SIGNATURE = "access_token_signature";
export const REFRESH_TOKEN_PAYLOAD = "refresh_token_payload";
export const REFRESH_TOKEN_SIGNATURE = "refresh_token_signature";

export function buildJwt(tokenPayload, tokenSignature) {
  let [header, signature] = tokenSignature.split(".");
  return `${header}.${tokenPayload}.${signature}`;
}

export function hasRefreshToken(req: Request) {
  return !(
    !req.cookies.refresh_token_payload || !req.cookies.refresh_token_signature
  );
}

export function hasAccessToken(req: Request) {
  return !(
    !req.cookies.access_token_payload || !req.cookies.access_token_signature
  );
}

export function verifyJwt(jwt: string) {
  try {
    jsonwebtoken.verify(jwt, publicKey);
    return true;
  } catch {
    return false;
  }
}

export function buildRefreshToken(req: Request) {
  return buildJwt(
    req.cookies.refresh_token_payload,
    req.cookies.refresh_token_signature
  );
}

export function buildAccessToken(req: Request) {
  return buildJwt(
    req.cookies.access_token_payload,
    req.cookies.access_token_signature
  );
}

export function createAccessTokenCookies(
  res: Response,
  userId: string,
  role: ROLE
) {
  let accessTokenPayload = {
    userId: userId,
    role: role,
  } as AccessTokenPayload;
  let jwt = jsonwebtoken.sign(accessTokenPayload, privateKey, {
    algorithm: "RS256",
    expiresIn: "2m",
  });
  let [header, payload, signature] = jwt.split(".");

  let expirationDate = dayjs().add(2, "m").toDate();
  res.cookie(ACCESS_TOKEN_PAYLOAD, payload, {
    sameSite: true,
    httpOnly: false,
    expires: expirationDate,
  });

  res.cookie(ACCESS_TOKEN_SIGNATURE, header + "." + signature, {
    sameSite: true,
    httpOnly: false,
    expires: expirationDate,
  });

  return jwt;
}

export function createRefreshTokenCookies(
  res: Response,
  userId: string,
  rememberMe: boolean
) {
  let refreshTokenPayload = {
    userId: userId,
    rememberMe: rememberMe,
  } as RefreshTokenPayload;
  let jwt = jsonwebtoken.sign(refreshTokenPayload, privateKey, {
    algorithm: "RS256",
    expiresIn: rememberMe ? "15d" : "15m",
  });
  let [header, payload, signature] = jwt.split(".");

  let expirationDate = rememberMe
    ? dayjs().add(15, "d").toDate()
    : dayjs().add(15, "m").toDate();
  res.cookie(REFRESH_TOKEN_PAYLOAD, payload, {
    sameSite: true,
    httpOnly: false,
    expires: expirationDate,
  });

  res.cookie(REFRESH_TOKEN_SIGNATURE, header + "." + signature, {
    sameSite: true,
    httpOnly: false,
    expires: expirationDate,
  });

  return jwt;
}

export function isAllowedRequestToken(req, keyv) {
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

export function isAllowedAccessToken(req, keyv) {
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

function jwt_decode(jwt: string): RefreshTokenPayload {
  throw new Error("Function not implemented.");
}
