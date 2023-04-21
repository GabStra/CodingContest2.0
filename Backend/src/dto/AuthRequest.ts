import { Request } from "express";
import { UserData } from "./UserData";

export interface AuthRequest extends Request {
  userData: UserData;
}

export type AuthRequestWithCourseId = AuthRequest & { courseId: number };
export type AuthRequestWithTitle = AuthRequest & { title: string };
export type AuthRequestWithTitleAndCourseId = AuthRequest & {
  title: string;
  courseId: number;
};
