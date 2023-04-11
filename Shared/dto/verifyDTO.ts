import { IsNotEmpty } from "class-validator";

export class VerifyDTO {
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

export interface VerifyResponseDTO {
  status: VERIFY_STATUS;
}
