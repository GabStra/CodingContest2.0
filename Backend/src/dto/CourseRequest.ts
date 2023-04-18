import { AuthRequest } from "./AuthRequest";

export interface CourseRequest extends AuthRequest {
  courseId: number;
}
