<script lang="ts">
import { defineComponent } from 'vue'
import TagsSection from './TagsSection.vue'
import ExercisesSection from './ExercisesSection.vue'
import { useSessionStore } from '../scripts/store'
import { mapState } from 'pinia'

export default defineComponent({
    components: {
        TagsSection,
        ExercisesSection,
    },
    computed: {
        ...mapState(useSessionStore, ['courses_teacher']),
        title() {
            let result = (this.courses_teacher.find(
                (course) => course.id === Number(this.$route.query.id)
            )?.data ?? '') as string
            return result
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
            <a-tab-pane :key="1" tab="Esercizi">
                <ExercisesSection />
            </a-tab-pane>
            <a-tab-pane :key="2" tab="Categorie" force-render>
                <TagsSection />
            </a-tab-pane>
        </a-tabs>
    </div>
</template>
