import { ROLES } from "shared/constants/roles";

export interface UserData {
  id: number;
  userName: string;
  userId: string;
  studentCourseIds: number[];
  teacherCourseIds: number[];
  role: ROLES;
}
