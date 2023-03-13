import { IsNotEmpty, MaxLength, IsEmail } from "class-validator";

export class PasswordRecoveryDTO {
  @MaxLength(100)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
