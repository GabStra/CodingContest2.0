import { defineStore } from 'pinia'
import { UserData } from 'shared/dto/userData'
import { Popup } from '../models/popup'
import { ListElement } from 'shared/dto/ListElement'
import { api } from './api'
import { ENDPOINTS } from 'shared/constants/endpoints'

export const useSessionStore = defineStore('session', {
    state: () => ({
        userData: null as UserData | null,
        popups: [] as Popup[],
        courses_student: [] as ListElement<number, string>[],
        courses_teacher: [] as ListElement<number, string>[],
        refreshMyCourses: false,
    }),
    actions: {
        loadMyCoursesAsStudent: async function () {
            let response = await api.get<ListElement<number, string>[]>(
                ENDPOINTS.MY_COURSES_STUDENT,
                null,
                true
            )
            if (response === null) return
            this.courses_student = response.data
        },
        loadMyCoursesAsTeacher: async function () {
            let response = await api.get<ListElement<number, string>[]>(
                ENDPOINTS.MY_COURSES_TEACHER,
                null,
                true
            )
            if (response === null) return
            this.courses_teacher = response.data
        },
    },
    persist: true,
})
