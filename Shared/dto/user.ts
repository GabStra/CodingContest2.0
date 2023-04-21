import {
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsAlphanumeric,
  IsDefined,
  IsOptional,
} from "class-validator";

export class User {
  @IsOptional({
    groups: ["changePassword", "changeEmail", "changeName"],
  })
  @IsDefined()
  @MaxLength(20)
  @IsNotEmpty()
  @IsAlphanumeric()
  userId: string;

  @IsOptional({
    groups: ["changePassword", "changeEmail"],
  })
  @IsDefined()
  @MaxLength(100)
  @IsNotEmpty()
  @IsAlphanumeric()
  userName: string;

  @IsOptional({
    groups: ["changePassword", "changeName"],
  })
  @IsDefined()
  @MaxLength(100)
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsOptional({
    groups: ["changeEmail", "changeName"],
  })
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

export interface RegistrationResponse {
  status: REGISTRATION_STATUS;
}
