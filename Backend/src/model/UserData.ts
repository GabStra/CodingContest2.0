import { ROLE } from "shared/dist/constants/role";

export interface UserData {
  id: number;
  userId: string;
  studentCourseIds: number[];
  teacherCourseIds: number[];
  role: ROLE;
}
