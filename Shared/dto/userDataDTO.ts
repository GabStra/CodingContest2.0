import { ROLE } from "../constants/role";

export interface UserDataDTO {
  userId: string;
  userName: string;
  avatar: string;
  role: ROLE;
}
