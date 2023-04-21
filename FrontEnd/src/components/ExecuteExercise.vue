<script lang="ts">
import { defineComponent } from 'vue'
import { Exercise } from 'shared/dto/exercise'
import { ENDPOINTS } from 'shared/constants/endpoints'
import { POPUP_TYPE } from '../models/popup'
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import LevelTag from './levelTag.vue'
import { getColorFromLevel } from '../utils/gradient'
import { mapState } from 'pinia'
import { useSessionStore } from '../scripts/store'
import { URL } from '../scripts/router'
import { LEVEL_LABELS } from 'shared/constants/levels'
import { LEVEL } from 'shared/constants/levels'
import ExercisePage from './Exercise.vue'

export default defineComponent({
    components: {
        LoadingOutlined,
        LevelTag,
        ArrowLeftOutlined,
        ExercisePage,
    },
    data() {
        return {
            exerciseData: new Exercise(),
            isLoading: false,
        }
    },
    setup() {
        return {
            getColorFromLevel,
            LEVEL_LABELS,
        }
    },
    computed: {
        title() {
            return this.$route.query.titoloEsercizio
        },
        ...mapState(useSessionStore, ['courses_student']),
        courseTitle() {
            let result = (this.courses_student.find(
                (course) => course.id === this.courseId
            )?.data ?? '') as string
            return result
        },
        courseId(): number {
            try {
                return Number(this.$route.query.idCorso)
            } catch {
                return 0
            }
        },
        levelLabel(): string {
            return this.LEVEL_LABELS[this.exerciseData.level as LEVEL]
        },
        items() {
            return [
                {
                    title: 'Introduzione',
                    content: this.exerciseData.introduzione,
                },
                { title: 'Specifiche', content: this.exerciseData.specifiche },
                { title: 'Esempio', content: this.exerciseData.esempio },
                { title: 'Input', content: this.exerciseData.input },
                { title: 'Output', content: this.exerciseData.output },
                { title: 'Note', content: this.exerciseData.note },
                { title: 'Esempio', content: this.exerciseData.esempio },
            ]
        },
    },
    methods: {
        goToCourseStudent: function (courseId: number) {
            this.$router.push({
                path: URL.STUDENT_COURSE,
                query: { id: courseId },
            })
        },
        onLoadExercise: async function () {
            this.isLoading = true
            await this.loadExercise()
            this.isLoading = false
        },
        loadExercise: async function () {
            let response = await this.$api.get<Exercise>(
                ENDPOINTS.EXERCISE_STUDENT,
                {
                    course: Number(this.$route.query.idCorso),
                    title: this.$route.query.titoloEsercizio,
                },
                true
            )
            if (response === null) return

            if (response.statusCode === 404 && !!response.data) {
                this.$emit('newPopup', {
                    type: POPUP_TYPE.ERROR,
                    message: 'Esercizio non trovato',
                })
                return
            }

            if (response.statusCode === 403 && !!response.data) {
                this.$emit('newPopup', {
                    type: POPUP_TYPE.ERROR,
                    message: 'Accesso negato',
                })
                return
            }

            this.exerciseData = response.data
        },
        replaceEndlineWithBr: function (text: string) {
            return text.replace(/(?:\\[rn]|[\r\n])/g, '<br>')
        },
        capitalizeFirstLetter(text: string) {
            return text.charAt(0).toUpperCase() + text.slice(1)
        },
    },
    beforeMount() {
        this.onLoadExercise()
    },
})
</script>
<template>
    <div style="max-height: 100%">
        <template v-if="isLoading">
            <LoadingOutlined spin />
        </template>
        <template v-else>
            <a-space>
                <ArrowLeftOutlined
                    :style="{ fontSize: '1.5em' }"
                    @click="goToCourseStudent(courseId)" />
                <a-breadcrumb>
                    <a-breadcrumb-item>{{ courseTitle }}</a-breadcrumb-item>
                    <a-breadcrumb-item>{{
                        exerciseData.title
                    }}</a-breadcrumb-item>
                </a-breadcrumb>
            </a-space>
            <a-divider style="margin-top: 12px; margin-bottom: 12px" />
            <div>
                <a-row :gutter="16" style="height: 100%">
                    <a-col :xs="24" :md="12">
                        <a-space direction="vertical" style="width: 100%">
                            <div class="space-between">
                                <h2>
                                    <a-typography-text strong>
                                        {{ exerciseData.title }}
                                    </a-typography-text>
                                </h2>
                                <LevelTag
                                    :color="
                                        getColorFromLevel(exerciseData.level)
                                    ">
                                    Livello {{ exerciseData.level }} -
                                    {{ levelLabel }}
                                </LevelTag>
                            </div>
                            <template v-if="exerciseData.titoloEsteso">
                                <div>
                                    <a-typography-text type="secondary">{{
                                        replaceEndlineWithBr(
                                            exerciseData.titoloEsteso
                                        )
                                    }}</a-typography-text>
                                </div>
                            </template>
                            <div style="overflow: auto; height: 75vh">
                                <template v-for="item in items">
                                    <template v-if="!!item">
                                        <div>
                                            <a-typography-text strong>{{
                                                capitalizeFirstLetter(
                                                    item.title
                                                )
                                            }}</a-typography-text>
                                            <p
                                                v-html="
                                                    replaceEndlineWithBr(
                                                        item.content
                                                    )
                                                "></p>
                                        </div>
                                    </template>
                                </template>
                            </div>
                        </a-space>
                    </a-col>
                    <a-col :xs="24" :md="12">
                        <ExercisePage />
                    </a-col>
                </a-row>
            </div>
        </template>
    </div>
</template>
<style>
.section {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.grow {
    flex-grow: 1;
}
</style>