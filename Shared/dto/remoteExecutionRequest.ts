import { IsNotEmpty } from "class-validator";

export class RemoteExecutionRequest {
  @IsNotEmpty()
  code: string;

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
