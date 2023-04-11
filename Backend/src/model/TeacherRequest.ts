import { AuthRequest } from "./AuthRequest";

export interface TeacherRequest extends AuthRequest {
  courseId: number;
}
