import { IsNotEmpty, MaxLength, IsEmail, IsDefined } from "class-validator";

export class LoginDTO {
  @IsDefined()
  @MaxLength(100)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDefined()
  @MaxLength(100)
  @IsNotEmpty()
  password: string;

  rememberMe: boolean;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
