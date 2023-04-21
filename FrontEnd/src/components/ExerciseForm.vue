<script lang="ts">
import { defineComponent } from 'vue'
import { Exercise } from 'shared/dist/dto/exercise'
import { LabeledValue } from 'ant-design-vue/es/select'
import {
    validate,
    VALIDATION_LANGUAGE,
    parseValidationErrorsToMap,
} from 'shared/dist/utils/validator'
import { ListElement } from 'shared/dist/dto/listElement'
import { LoadingOutlined } from '@ant-design/icons-vue'
import { ENDPOINTS } from 'shared/dist/constants/endpoints'
import { POPUP_TYPE } from '../models/popup'
import { LEVEL, LEVEL_LABELS } from 'shared/dist/constants/levels'
import { URL } from '../scripts/router'

export default defineComponent({
    components: {
        LoadingOutlined,
    },
    setup() {
        return { URL }
    },
    data() {
        return {
            exerciseData: new Exercise(),
            errors: new Map<string, string>(),
            tags: [] as ListElement<number, string>[],
            exercises: [] as ListElement<number, string>[],
            isLoading: false,
            isTagsListLoading: false,
            isExercisesListLoading: false,
        }
    },
    computed: {
        tagsOptions() {
            if (!this.tags) return []
            let results = this.tags.map(
                (tag: ListElement<number, string>) =>
                    <LabeledValue>{
                        label: tag.data,
                        value: tag.id,
                    }
            )

            return results
        },
        exercisesOptions() {
            if (!this.exercises) return []
            let filteredExercises = this.exercises.filter(
                (exercise: ListElement<number, string>) =>
                    exercise.data !== this.exerciseData.title
            )
            let results = filteredExercises.map(
                (exercise: ListElement<number, string>) =>
                    <LabeledValue>{
                        label: exercise.data,
                        value: exercise.data,
                    }
            )

            return results
        },
        levelOptions() {
            return [
                <LabeledValue>{
                    label: LEVEL_LABELS[LEVEL.ZERO],
                    value: LEVEL.ZERO,
                },
                <LabeledValue>{
                    label: LEVEL_LABELS[LEVEL.ONE],
                    value: LEVEL.ONE,
                },
                <LabeledValue>{
                    label: LEVEL_LABELS[LEVEL.TWO],
                    value: LEVEL.TWO,
                },
                <LabeledValue>{
                    label: LEVEL_LABELS[LEVEL.THREE],
                    value: LEVEL.THREE,
                },
                <LabeledValue>{
                    label: LEVEL_LABELS[LEVEL.FOUR],
                    value: LEVEL.FOUR,
                },
                <LabeledValue>{
                    label: LEVEL_LABELS[LEVEL.FIVE],
                    value: LEVEL.FIVE,
                },
                <LabeledValue>{
                    label: LEVEL_LABELS[LEVEL.SIX],
                    value: LEVEL.SIX,
                },
                <LabeledValue>{
                    label: LEVEL_LABELS[LEVEL.SEVEN],
                    value: LEVEL.SEVEN,
                },
                <LabeledValue>{
                    label: LEVEL_LABELS[LEVEL.EIGHT],
                    value: LEVEL.EIGHT,
                },
                <LabeledValue>{
                    label: LEVEL_LABELS[LEVEL.NINE],
                    value: LEVEL.NINE,
                },
                <LabeledValue>{
                    label: LEVEL_LABELS[LEVEL.TEN],
                    value: LEVEL.TEN,
                },
            ]
        },
        isEdit() {
            console.log(this.$route.meta)
            return (
                !!this.$route.query.titoloEsercizio &&
                ((Object.hasOwn(this.$route.meta, 'edit') &&
                    this.$route.meta.edit) ||
                    (Object.hasOwn(this.$route.meta, 'copy') &&
                        this.$route.meta.copy))
            )
        },
    },
    methods: {
        onLoadExercise: async function () {
            this.isLoading = true
            await this.loadExercise()
            this.isLoading = false
        },
        loadExercise: async function () {
            let response = await this.$api.get<Exercise>(
                ENDPOINTS.EXERCISE_TEACHER,
                {
                    course: Number(this.$route.query.idCorso),
                    title: this.$route.query.titoloEsercizio,
                },
                true
            )
            if (response === null) return
            this.exerciseData = response.data
        },
        onLoadTagsList: async function () {
            this.isTagsListLoading = true
            await this.loadTagsList()
            this.isTagsListLoading = false
        },
        loadTagsList: async function () {
            let response = await this.$api.get<ListElement<number, string>[]>(
                ENDPOINTS.TAGS_LIST,
                { course: Number(this.$route.query.idCorso) },
                true
            )
            if (response === null) return
            this.tags = response.data
        },
        onLoadExercisesList: async function () {
            this.isTagsListLoading = true
            await this.loadExercisesList()
            this.isTagsListLoading = false
        },
        loadExercisesList: async function () {
            let response = await this.$api.get<ListElement<number, string>[]>(
                ENDPOINTS.EXERCISE_LIST,
                { course: Number(this.$route.query.idCorso) },
                true
            )
            if (response === null) return
            this.exercises = response.data
        },
        handleSubmit: async function () {
            this.isLoading = true
            await this.saveExercise()
            this.isLoading = false
        },
        saveExercise: async function () {
            let errors = await validate(
                this.exerciseData,
                VALIDATION_LANGUAGE.IT
            )
            parseValidationErrorsToMap(this.errors, errors)
            if (errors.length !== 0) return
            let response = await this.$api.postWithParams<any, Exercise>(
                this.isEdit ? ENDPOINTS.EDIT_EXERCISE : ENDPOINTS.NEW_EXERCISE,
                this.exerciseData,
                {
                    course: Number(this.$route.query.idCorso),
                },
                true
            )
            if (response === null) return
            if (response.statusCode === 400 && !!response.data) {
                this.$emit('newPopup', {
                    type: POPUP_TYPE.ERROR,
                    message: response.data,
                })
                return
            }

            this.$emit('newPopup', {
                type: POPUP_TYPE.SUCCESS,
                message: 'Salvataggio esercizio riuscito',
            })

            this.returnToCourseHome()
        },

        returnToCourseHome: function () {
            this.$router.push({
                path: URL.TEACHER_COURSE,
                query: { id: this.$route.query.idCorso },
            })
        },
    },
    beforeMount: async function () {
        let promises = [this.onLoadTagsList(), this.onLoadExercisesList()]
        if (!!this.$route.query.titoloEsercizio || this.$route.meta.copy) {
            promises.push(this.onLoadExercise())
        }

        await Promise.all(promises)

        if (
            this.exerciseData.prop &&
            !this.exercisesOptions.some(
                (element) => element.value === this.exerciseData.prop
            )
        ) {
            this.exerciseData.prop = null
        }
    },
})
</script>

<template>
    <div>
        <LoadingOutlined v-if="isLoading" />
        <div v-else>
            <a-form layout="vertical" :model="exerciseData">
                <div class="center">
                    <h2>
                        <a-typography-text strong>{{
                            isEdit ? 'Modifica Esercizio' : 'Nuovo Esercizio'
                        }}</a-typography-text>
                    </h2>
                </div>
                <a-divider />
                <a-form-item
                    label="Titolo"
                    name="title"
                    :validateStatus="errors.has('title') ? 'error' : undefined"
                    :help="errors.get('title')">
                    <a-input
                        v-model:value="exerciseData.title"
                        :disabled="
                            !!$route.query.titoloEsercizio && !$route.meta?.copy
                        " />
                </a-form-item>

                <a-form-item
                    label="Titolo Esteso"
                    name="titoloEsteso"
                    :validateStatus="
                        errors.has('titoloEsteso') ? 'error' : undefined
                    "
                    :help="errors.get('titoloEsteso')">
                    <a-input v-model:value="exerciseData.titoloEsteso" />
                </a-form-item>

                <a-form-item
                    label="Livello"
                    name="level"
                    :validateStatus="errors.has('level') ? 'error' : undefined"
                    :help="errors.get('level')">
                    <a-select
                        v-model:value="exerciseData.level"
                        :options="levelOptions"
                        allow-clear />
                </a-form-item>

                <a-form-item
                    label="Numero task"
                    name="task"
                    :validateStatus="errors.has('task') ? 'error' : undefined"
                    :help="errors.get('task')">
                    <a-input-number v-model:value="exerciseData.task" />
                </a-form-item>

                <a-form-item
                    label="Introduzione"
                    name="introduzione"
                    :validateStatus="
                        errors.has('introduzione') ? 'error' : undefined
                    "
                    :help="errors.get('introduzione')">
                    <a-textarea
                        v-model:value="exerciseData.introduzione"
                        :rows="4" />
                </a-form-item>

                <a-form-item
                    label="Specifiche"
                    name="specifiche"
                    :validateStatus="
                        errors.has('specifiche') ? 'error' : undefined
                    "
                    :help="errors.get('specifiche')">
                    <a-textarea
                        v-model:value="exerciseData.specifiche"
                        :rows="4" />
                </a-form-item>

                <a-form-item
                    label="Dati di input"
                    name="input"
                    :validateStatus="errors.has('input') ? 'error' : undefined"
                    :help="errors.get('input')">
                    <a-textarea v-model:value="exerciseData.input" :rows="4" />
                </a-form-item>

                <a-form-item
                    label="Dati di output"
                    name="output"
                    :validateStatus="errors.has('output') ? 'error' : undefined"
                    :help="errors.get('output')">
                    <a-textarea v-model:value="exerciseData.output" :rows="4" />
                </a-form-item>

                <a-form-item
                    label="Note"
                    name="note"
                    :validateStatus="errors.has('note') ? 'error' : undefined"
                    :help="errors.get('note')">
                    <a-textarea v-model:value="exerciseData.note" :rows="4" />
                </a-form-item>

                <a-form-item
                    label="Esempio"
                    name="esempio"
                    :validateStatus="
                        errors.has('esempio') ? 'error' : undefined
                    "
                    :help="errors.get('esempio')">
                    <a-textarea
                        v-model:value="exerciseData.esempio"
                        :rows="4" />
                </a-form-item>

                <a-divider />

                <a-form-item
                    label="Input"
                    name="taskInput"
                    :validateStatus="
                        errors.has('taskInput') ? 'error' : undefined
                    "
                    :help="errors.get('taskInput')">
                    <a-textarea
                        v-model:value="exerciseData.taskInput"
                        :rows="4" />
                </a-form-item>

                <a-form-item
                    label="Output"
                    name="taskOutput"
                    :validateStatus="
                        errors.has('taskOutput') ? 'error' : undefined
                    "
                    :help="errors.get('taskOutput')">
                    <a-textarea
                        v-model:value="exerciseData.taskOutput"
                        :rows="4" />
                </a-form-item>

                <a-divider />

                <div class="center" v-show="isTagsListLoading">
                    <LoadingOutlined spin />
                </div>

                <a-form-item
                    label="Categoria"
                    name="idCategoria"
                    v-show="!isTagsListLoading">
                    <a-select
                        v-model:value="exerciseData.idCategoria"
                        :options="tagsOptions"
                        show-search />
                </a-form-item>

                <div class="center" v-show="isExercisesListLoading">
                    <LoadingOutlined spin />
                </div>

                <a-form-item
                    label="Propedeudicità"
                    name="prop"
                    v-show="!isExercisesListLoading">
                    <a-select
                        v-model:value="exerciseData.prop"
                        :options="exercisesOptions"
                        show-search
                        allow-clear />
                </a-form-item>

                <a-row>
                    <a-col :xs="6">
                        <a-form-item name="pronto" :wrapper-col="{ span: 16 }">
                            <a-checkbox v-model:checked="exerciseData.pronto"
                                >Pronto</a-checkbox
                            >
                        </a-form-item>
                    </a-col>
                    <a-col :xs="6">
                        <a-form-item
                            name="pubblicato"
                            :wrapper-col="{ span: 16 }">
                            <a-checkbox
                                v-model:checked="exerciseData.pubblicato"
                                >Pubblicato</a-checkbox
                            >
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
            <div class="center">
                <a-button type="primary" @click="handleSubmit">Salva</a-button>
                <a-button @click="returnToCourseHome">Annulla</a-button>
            </div>
        </div>
    </div>
</template>
