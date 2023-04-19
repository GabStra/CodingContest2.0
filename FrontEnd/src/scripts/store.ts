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
        hasRequestsByCourseId: {} as Record<number, boolean>,
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
        loadPendingRequestsCount: async function () {
            let courseIds = this.courses_teacher.map((course) => course.id)

            if (!courseIds.length) return

            for (let courseId of courseIds) {
                let response = await api.get<number>(
                    ENDPOINTS.WAITING_TO_BE_APPROVED_COUNT,
                    { course: courseId },
                    true
                )
                if (response === null) continue
                this.hasRequestsByCourseId[courseId] = response.data > 0
            }
        },
    },
    persist: true,
})
