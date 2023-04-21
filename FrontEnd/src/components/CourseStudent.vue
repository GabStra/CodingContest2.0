<script lang="ts">
import { defineComponent } from 'vue'
import CourseStatsSection from './CourseStatsSection.vue'
import ExercisesStudentSection from './ExercisesStudentSection.vue'
import { useSessionStore } from '../scripts/store'
import { mapState } from 'pinia'
export default defineComponent({
    components: {
        CourseStatsSection,
        ExercisesStudentSection,
    },
    computed: {
        ...mapState(useSessionStore, ['courses_student']),
        title() {
            let result = (this.courses_student.find(
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
})
</script>
<template>
    <div>
        <div class="center">
            <h2>
                <a-typography-text strong>
                    {{ title }}
                </a-typography-text>
            </h2>
        </div>
        <a-divider />
        <a-space direction="vertical" style="width: 100%">
            <CourseStatsSection />
            <ExercisesStudentSection />
        </a-space>
    </div>
</template>
