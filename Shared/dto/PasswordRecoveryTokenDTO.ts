import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class PasswordRecoveryTokenDTO {
  @MaxLength(64)
  @MinLength(64)
  @IsNotEmpty()
  token: string;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
