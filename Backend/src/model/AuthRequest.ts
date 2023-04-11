import { Request } from "express";
import { UserData } from "./UserData";

export interface AuthRequest extends Request {
  userData: UserData;
}
