import { MaxLength } from "class-validator";

export class UserFilter {
  ids: string[];

  @MaxLength(100)
  name: string;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
