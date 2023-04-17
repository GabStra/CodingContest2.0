import { IsNotEmpty } from "class-validator";

export class Verify {
  @IsNotEmpty()
  token: string;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}

export enum VERIFY_STATUS {
  SUCCESS,
  FAIL,
}

export interface VerifyResponse {
  status: VERIFY_STATUS;
}
