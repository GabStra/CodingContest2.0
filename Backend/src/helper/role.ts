import { ROLE } from "shared/constants/role";
import { TblUsers } from "../database/entities/TblUsers";

export function getRoleFromUser(user: TblUsers) {
  let role = user.userStatus === "Y" ? ROLE.USER : ROLE.INACTIVE;
  if (user.admin && !!user.admin.level) {
    role = user.admin.level > 1 ? ROLE.SUPER_ADMIN : ROLE.ADMIN;
  }
  return role;
}
