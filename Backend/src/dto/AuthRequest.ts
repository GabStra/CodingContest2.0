import { Request } from "express";
import { UserSessionData } from "./userSessionData";

export interface AuthRequest extends Request {
  userData: UserSessionData;
}


export type AuthRequestWithCourseId = AuthRequest & { courseId: number };
export type AuthRequestWithTitle = AuthRequest & { title: string };
export type AuthRequestWithTitleAndCourseId = AuthRequest & {
  title: string;
  courseId: number;
};
