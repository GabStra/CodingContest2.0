export interface AvailableCourseDTO {
  name: string;
  signedUp: boolean;
  active: boolean;
  teacherNames: string[];
  studentsCount: number;
}
