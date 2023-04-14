import { ROLE } from "shared/constants/role";

export interface UserData {
  id: number;
  userId: string;
  studentCourseIds: number[];
  teacherCourseIds: number[];
  role: ROLE;
}
