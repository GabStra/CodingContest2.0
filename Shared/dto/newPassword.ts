import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class NewPassword {
  @IsNotEmpty()
  token: string;

  @MaxLength(100)
  @IsNotEmpty()
  password: string;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}

export enum NEW_PASSWORD_STATUS {
  SUCCESS,
  FAIL,
  EXPIRED,
}

export interface NewPasswordResponse {
  status: NEW_PASSWORD_STATUS;
}
