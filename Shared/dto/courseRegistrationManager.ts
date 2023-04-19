import { IsArray, IsString } from "class-validator";
export class CourseRegistrationManager {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
