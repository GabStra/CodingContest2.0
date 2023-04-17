import { ROLES } from "../constants/roles";

export interface AccessTokenPayload {
  sessionId: string;
  role: ROLES;
  iat: number;
  exp: number;
}
