<script lang="ts">
import { defineComponent } from 'vue'
import { POPUP_TYPE } from '../models/popup'
import { router, URL } from '../scripts/router'
import { ENDPOINTS } from 'shared/constants/endpoints'
import { useSessionStore } from '../scripts/store'
import { mapState, mapActions } from 'pinia'
import { ListElement } from 'shared/dto/ListElement'
export default defineComponent({
    setup() {
        return { URL, router }
    },
    computed: {
        ...mapState(useSessionStore, ['courses_student']),
        ...mapState(useSessionStore, ['courses_teacher']),
    },
    methods: {
        ...mapActions(useSessionStore, ['loadMyCoursesAsStudent']),
        ...mapActions(useSessionStore, ['loadMyCoursesAsTeacher']),
        manageLogout: async function () {
            let response = await this.$api.post<any, any>(
                ENDPOINTS.LOGOUT,
                null,
                true
            )
            if (response === null) return
            router.push({ path: URL.LOGIN })
        },
    },
    beforeMount() {
        this.loadMyCoursesAsStudent()
        this.loadMyCoursesAsTeacher()
    },
})
</script>
<template>
    <a-menu theme="dark" mode="inline">
        <div class="menu-title">
            <a-typography-text strong>I miei corsi</a-typography-text>
        </div>
        <a-menu-item
            :key="i"
            @click="
                () =>
                    $router.push({
                        path: URL.STUDENT_COURSE,
                        query: { id: item.id },
                    })
            "
            v-for="(item, i) in courses_student">
            {{ item.data }}
        </a-menu-item>
        <a-menu-item key="1" @click="() => $router.push({ path: URL.HOME })">
            Gestisci corsi
        </a-menu-item>
        <template v-if="courses_teacher.length !== 0">
            <a-divider style="margin-top: 12px; margin-bottom: 12px" />
            <div class="menu-title">
                <a-typography-text strong>Docente</a-typography-text>
            </div>
            <a-menu-item
                :key="i"
                @click="
                    () =>
                        $router.push({
                            path: URL.TEACHER_COURSE,
                            query: { id: item.id },
                        })
                "
                v-for="(item, i) in courses_teacher">
                {{ item.data }}
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
