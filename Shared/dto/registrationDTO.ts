import {
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsAlphanumeric,
  IsDefined,
} from "class-validator";

export class RegistrationDTO {
  @IsDefined()
  @MaxLength(20)
  @IsNotEmpty()
  @IsAlphanumeric()
  userId: string;

  @IsDefined()
  @MaxLength(100)
  @IsNotEmpty()
  @IsAlphanumeric()
  userName: string;

  @IsDefined()
  @MaxLength(100)
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsDefined()
  @MaxLength(100)
  @IsNotEmpty()
  userPass: string;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}

export enum REGISTRATION_STATUS {
  UserIdInUse,
  EmailInUse,
  Success,
}

export interface RegistrationResponseDTO {
  status: REGISTRATION_STATUS;
}
