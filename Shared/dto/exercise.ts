import { IsNotEmpty, MaxLength, IsNumber } from "class-validator";

export class Exercise {
  id: number | null;

  @MaxLength(50)
  @IsNotEmpty()
  title: string;

  @MaxLength(100)
  titoloEsteso: string | null;

  idCategoria: number | null;

  @IsNumber()
  @IsNotEmpty()
  level: number;

  @IsNumber()
  task: number;

  @IsNotEmpty()
  introduzione: string;

  specifiche: string;

  note: string;

  esempio: string;

  @IsNotEmpty()
  input: string;

  @IsNotEmpty()
  output: string;

  @IsNotEmpty()
  taskInput: string;

  @IsNotEmpty()
  taskOutput: string;

  pronto: boolean;

  pubblicato: boolean;

  prop: number | null;

  autore: string;

  idCorso: number;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
