import { IsNotEmpty, MaxLength } from "class-validator";

export class TagDTO {
  id: number | null;

  @MaxLength(30)
  @IsNotEmpty()
  tag: string;

  numeroEsercizi: number;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
