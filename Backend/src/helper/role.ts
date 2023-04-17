import { ROLES } from "shared/constants/roles";
import { TblUsers } from "../database/entities/TblUsers";

export function getRoleFromUser(user: TblUsers) {
  let role = user.userStatus === "Y" ? ROLES.USER : ROLES.INACTIVE;
  if (user.admin && !!user.admin.level) {
    role = user.admin.level > 1 ? ROLES.SUPER_ADMIN : ROLES.ADMIN;
  }
  return role;
}
