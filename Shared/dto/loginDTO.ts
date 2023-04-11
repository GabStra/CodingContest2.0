import { IsNotEmpty, MaxLength, IsEmail, IsDefined } from "class-validator";

export class LoginDTO {
  @MaxLength(100)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MaxLength(100)
  @IsNotEmpty()
  password: string;

  rememberMe: boolean;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
