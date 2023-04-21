import dayjs from "dayjs";
import { AccessTokenPayload } from "shared/dist/dto/accessTokenPayload";
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

export function buildJwt(tokenPayload, tokenSignature) {
  let [header, signature] = tokenSignature.split(".");
  return `${header}.${tokenPayload}.${signature}`;
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

export function buildAccessToken(req: Request) {
  return buildJwt(
    req.cookies.access_token_payload,
    req.cookies.access_token_signature
  );
}

export function decodeAccessToken(jwt: string) {
  return jsonwebtoken.decode(jwt) as AccessTokenPayload;
}

export function clearAccessToken(res: Response) {
  res.clearCookie(ACCESS_TOKEN_PAYLOAD);
  res.clearCookie(ACCESS_TOKEN_SIGNATURE);
}

export function createAccessTokenCookies(
  res: Response,
  sessionId: string,
  isAdmin: boolean,
  rememberMe: boolean
) {
  let accessTokenPayload = {
    sessionId: sessionId,
    isAdmin: isAdmin,
  } as AccessTokenPayload;

  let jwt = jsonwebtoken.sign(accessTokenPayload, privateKey, {
    algorithm: "RS256",
    expiresIn: "15" + (rememberMe ? "d" : "m"),
  });
  let [header, payload, signature] = jwt.split(".");

  let expirationDate = dayjs()
    .add(15, rememberMe ? "d" : "m")
    .toDate();

  res.cookie(ACCESS_TOKEN_PAYLOAD, payload, {
    sameSite: true,
    httpOnly: false,
    expires: expirationDate,
  });

  res.cookie(ACCESS_TOKEN_SIGNATURE, header + "." + signature, {
    sameSite: true,
    httpOnly: true,
    expires: expirationDate,
  });

  return jwt;
}
