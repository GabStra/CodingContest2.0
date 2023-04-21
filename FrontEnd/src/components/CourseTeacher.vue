<script lang="ts">
import { defineComponent } from 'vue'
import TagsSection from './TagsSection.vue'
import ExercisesTeacherSection from './ExercisesTeacherSection.vue'
import { useSessionStore } from '../scripts/store'
import { mapActions, mapState } from 'pinia'
import RegistrationRequestsSection from './RegistrationRequestsSection.vue'

export default defineComponent({
    components: {
        TagsSection,
        ExercisesTeacherSection,
        RegistrationRequestsSection,
    },
    watch: {
        hasRequestsByCourseId: {
            handler: function (to, from) {
                this.$forceUpdate()
            },
            deep: true,
        },
    },
    computed: {
        ...mapState(useSessionStore, ['hasRequestsByCourseId']),
        ...mapState(useSessionStore, ['courses_teacher']),
        title() {
            let result = (this.courses_teacher.find(
                (course) => course.id === this.courseId
            )?.data ?? '') as string
            return result
        },
        courseId(): number {
            try {
                return Number(this.$route.query.id)
            } catch {
                return 0
            }
        },
    },
    methods: {
        anyRequestForCourse(courseId: number) {
            if (!this.hasRequestsByCourseId[courseId]) return false
            return this.hasRequestsByCourseId[courseId]
        },
    },
    data() {
        return {
            activeTab: 1,
        }
    },
})
</script>

<template>
    <div>
        <div class="center">
            <h2>
                <a-typography-text strong>
                    Gestione Corso: {{ title }}
                </a-typography-text>
            </h2>
        </div>
        <a-divider />
        <a-tabs v-model:activeKey="activeTab">
            <a-tab-pane :key="1" force-render>
                <template #tab>
                    Richieste
                    <a-badge :dot="anyRequestForCourse(courseId)" />
                </template>
                <RegistrationRequestsSection />
            </a-tab-pane>
            <a-tab-pane :key="2" tab="Esercizi">
                <ExercisesTeacherSection />
            </a-tab-pane>
            <a-tab-pane :key="3" tab="Categorie" force-render>
                <TagsSection />
            </a-tab-pane>
        </a-tabs>
    </div>
</template>
