import { IsNotEmpty, MaxLength } from "class-validator";

export class Exercise {
  id: number | null;

  @MaxLength(50)
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  idCorso: number;

  idCategoria: number | null;

  level: number;

  maxscore: number | null;
  task: number | null;

  @MaxLength(100)
  titoloEsteso: string;

  introduzione: string;

  specifiche: string;

  input: string;

  output: string;

  note: string;

  esempio: string;

  pronto: boolean;

  pubblicato: boolean;

  autore: string;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
