import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class NewPasswordDTO {
  @MinLength(64)
  @MaxLength(64)
  @IsNotEmpty()
  token: string;

  @MaxLength(100)
  @IsNotEmpty()
  password: string;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
