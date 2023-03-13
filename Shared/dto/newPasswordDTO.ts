import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class NewPasswordDTO {
  @IsNotEmpty()
  token: string;

  @MaxLength(100)
  @IsNotEmpty()
  password: string;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
