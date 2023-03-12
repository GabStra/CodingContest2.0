import { IsNotEmpty, MaxLength, IsEmail } from "class-validator";

export class Login {
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
