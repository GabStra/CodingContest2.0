import { IsNotEmpty, MaxLength, MinLength, IsDefined } from "class-validator";

export class PasswordRecoveryTokenDTO {
  @IsDefined()
  @MaxLength(64)
  @MinLength(64)
  @IsNotEmpty()
  token: string;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
