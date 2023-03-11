import { ROLE } from "./role";

export interface AccessTokenPayload {
  userId: string;
  role: ROLE;
}
