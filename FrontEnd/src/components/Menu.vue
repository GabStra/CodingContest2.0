<script lang="ts">
import { defineComponent } from 'vue'
import { URL } from '../scripts/router'
import { ENDPOINTS } from 'shared/constants/endpoints'
import { useSessionStore } from '../scripts/store'
import { mapState, mapActions } from 'pinia'
import { LoadingOutlined } from '@ant-design/icons-vue'
export default defineComponent({
    setup() {
        return { URL }
    },
    components: {
        LoadingOutlined,
    },
    computed: {
        ...mapState(useSessionStore, ['courses_student']),
        ...mapState(useSessionStore, ['courses_teacher']),
        ...mapState(useSessionStore, ['hasRequestsByCourseId']),
    },
    watch: {
        hasRequestsByCourseId: {
            handler: function (to, from) {
                console.log('hasRequestsByCourseId changed')
                this.$forceUpdate()
            },
            deep: true,
        },
    },
    data() {
        return {
            isLoading: false,
        }
    },
    methods: {
        ...mapActions(useSessionStore, ['loadMyCoursesAsStudent']),
        ...mapActions(useSessionStore, ['loadMyCoursesAsTeacher']),
        ...mapActions(useSessionStore, ['loadPendingRequestsCount']),
        anyRequestForCourse(courseId: number) {
            if (!this.hasRequestsByCourseId[courseId]) return false
            return this.hasRequestsByCourseId[courseId]
        },
        manageLogout: async function () {
            let response = await this.$api.post<any, any>(
                ENDPOINTS.LOGOUT,
                null,
                true
            )
            if (response === null) return
            this.$router.push({ path: URL.LOGIN })
        },
        goToCourseStudent: function (courseId: number) {
            this.$router.push({
                path: URL.STUDENT_COURSE,
                query: { id: courseId },
            })
        },
        goToCourseTeacher: function (courseId: number) {
            this.$router.push({
                path: URL.TEACHER_COURSE,
                query: { id: courseId },
            })
        },
    },
    beforeMount: async function () {
        this.isLoading = true
        await this.loadMyCoursesAsStudent()
        await this.loadMyCoursesAsTeacher()
        await this.loadPendingRequestsCount()
        this.isLoading = false
    },
})
</script>
<template>
    <a-menu theme="dark" mode="inline">
        <template v-if="isLoading">
            <div class="center">
                <LoadingOutlined spin />
            </div>
        </template>
        <template v-else>
            <div class="menu-title">
                <a-typography-text strong>I miei corsi</a-typography-text>
            </div>
            <a-menu-item
                :key="i"
                @click="goToCourseStudent(item.id)"
                v-for="(item, i) in courses_student">
                {{ item.data }}
            </a-menu-item>
            <a-menu-item
                key="1"
                @click="() => $router.push({ path: URL.HOME })">
                Gestisci corsi
            </a-menu-item>
            <template v-if="courses_teacher.length !== 0">
                <a-divider style="margin-top: 12px; margin-bottom: 12px" />
                <div class="menu-title">
                    <a-typography-text strong>Docente</a-typography-text>
                </div>
                <a-menu-item
                    :key="i"
                    @click="goToCourseTeacher(item.id)"
                    v-for="(item, i) in courses_teacher">
                    {{ item.data }}
                    <a-badge :dot="anyRequestForCourse(item.id)" />
                </a-menu-item>
            </template>

            <a-divider style="margin-top: 12px; margin-bottom: 12px" />
            <div class="menu-title">
                <a-typography-text strong>Admin</a-typography-text>
            </div>
            <a-menu-item
                key="10"
                @click="() => $router.push({ path: URL.COURSES })">
                Gestisci corsi
            </a-menu-item>
            <a-divider style="margin-top: 12px; margin-bottom: 12px" />
            <a-menu-item key="2"> Impostazioni </a-menu-item>
            <a-menu-item key="4" @click="manageLogout"> Logout </a-menu-item>
        </template>
    </a-menu>
</template>
<style>
.menu-title {
    padding-left: 24px;
    margin-top: 4px;
    margin-bottom: 8px;
    color: #e1e1e1;
    display: flex;
    align-items: center;
    height: 40px;
    line-height: 40px;
}
</style>
