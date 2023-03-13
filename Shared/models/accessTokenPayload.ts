import { ROLE } from "../constants/role";

export interface AccessTokenPayload {
  sessionId: string;
  role: ROLE;
  iat: number;
  exp: number;
}
