<script lang="ts">
import { defineComponent } from 'vue'
import { URL } from '../scripts/router'
import { ENDPOINTS } from 'shared/dist/constants/endpoints'
import { useSessionStore } from '../scripts/store'
import { mapStores } from 'pinia'
import { LoadingOutlined } from '@ant-design/icons-vue'

export default defineComponent({
    setup() {
        return { URL }
    },
    components: {
        LoadingOutlined,
    },
    computed: {
        ...mapStores(useSessionStore),
    },
    watch: {
        hasRequestsByCourseId: {
            handler: function (to, from) {
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
        anyRequestForCourse(courseId: number) {
            if (!this.sessionStore.hasRequestsByCourseId[courseId]) return false
            return this.sessionStore.hasRequestsByCourseId[courseId]
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
        await this.sessionStore.loadMyCoursesAsStudent()
        await this.sessionStore.loadMyCoursesAsTeacher()
        await this.sessionStore.loadPendingRequestsCount()
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
                :key="'a' + i"
                @click="goToCourseStudent(item.id)"
                v-for="(item, i) in sessionStore.courses_student">
                {{ item.data }}
            </a-menu-item>
            <a-menu-item
                key="b"
                @click="() => $router.push({ path: URL.HOME })">
                Gestisci corsi
            </a-menu-item>
            <template v-if="sessionStore.courses_teacher.length !== 0">
                <a-divider style="margin-top: 12px; margin-bottom: 12px" />
                <div class="menu-title">
                    <a-typography-text strong>Docente</a-typography-text>
                </div>
                <a-menu-item
                    :key="'c' + i"
                    @click="goToCourseTeacher(item.id)"
                    v-for="(item, i) in sessionStore.courses_teacher">
                    {{ item.data }}
                    <a-badge :dot="anyRequestForCourse(item.id)" />
                </a-menu-item>
            </template>

            <template v-if="sessionStore.userData.isAdmin">
                <a-divider style="margin-top: 12px; margin-bottom: 12px" />
                <div class="menu-title">
                    <a-typography-text strong>Admin</a-typography-text>
                </div>
                <a-menu-item
                    key="d"
                    @click="() => $router.push({ path: URL.COURSES })">
                    Gestisci corsi
                </a-menu-item>
            </template>

            <a-divider style="margin-top: 12px; margin-bottom: 12px" />
            <a-menu-item key="e"> Impostazioni </a-menu-item>
            <a-menu-item key="f" @click="manageLogout"> Logout </a-menu-item>
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
