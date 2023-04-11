import { IsNotEmpty, MaxLength, IsEmail, IsDefined } from "class-validator";

export class PasswordRecoveryDTO {
  @IsDefined()
  @MaxLength(100)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
