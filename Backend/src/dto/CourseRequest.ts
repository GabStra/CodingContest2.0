import { AuthRequest } from "./AuthRequest";

export interface AuthRequestWithCourseId extends AuthRequest {
  courseId: number;
}
