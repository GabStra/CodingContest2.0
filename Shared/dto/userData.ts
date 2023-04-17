import { ROLES } from "../constants/roles";

export interface UserData {
  userId: string;
  userName: string;
  avatar: string;
  role: ROLES;
}
