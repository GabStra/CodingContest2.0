import { IsNotEmpty, MaxLength } from "class-validator";

export class Course {
  id: number | null;

  @MaxLength(60)
  @IsNotEmpty()
  nome: string;

  info: string;

  idDocenti: number[];

  numeroIscritti: number;

  nomiDocenti: string[];

  attivo: boolean;

  iscrizione: boolean;

  isRegistered: boolean;
  isRegistrationActive: boolean;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
