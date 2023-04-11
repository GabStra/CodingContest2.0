import { defineStore } from "pinia";
import { UserDataDTO } from "shared/dto/userDataDTO";
import { Popup } from "../models/popup";
import { ListElementDTO } from "shared/dto/ListElementDTO";
import { api, ENDPOINTS } from "./api";
export const useSessionStore = defineStore("session", {
  state: () => ({
    userData: null as UserDataDTO | null,
    popups: [] as Popup[],
    courses_student: [] as ListElementDTO<number, string>[],
    courses_teacher: [] as ListElementDTO<number, string>[],
    refreshMyCourses: false,
  }),
  actions: {
    loadMyCoursesAsStudent: async function () {
      let response = await api.get<ListElementDTO<number, string>[]>(
        ENDPOINTS.MY_COURSES_STUDENT,
        null,
        true
      );
      if (response === null) return;
      this.courses_student = response.data;
    },
    loadMyCoursesAsTeacher: async function () {
      let response = await api.get<ListElementDTO<number, string>[]>(
        ENDPOINTS.MY_COURSES_TEACHER,
        null,
        true
      );
      if (response === null) return;
      this.courses_teacher = response.data;
    },
  },
  persist: true,
});
