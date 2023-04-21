export interface UserSessionData {
  id: number;
  userName: string;
  userId: string;
  studentCourseIds: number[];
  teacherCourseIds: number[];
  isAdmin: boolean;
}
