<script lang="ts">
import { defineComponent } from 'vue'
import { ExerciseDTO } from 'shared/dto/exerciseDTO'
import { LabeledValue } from 'ant-design-vue/es/select'
import {
    validate,
    VALIDATION_LANGUAGE,
    parseValidationErrorsToMap,
} from 'shared/helper/validator'
import { ListElementDTO } from 'shared/dto/ListElementDTO'
import { LoadingOutlined } from '@ant-design/icons-vue'
import { ENDPOINTS } from 'shared/constants/endpoints'
import { POPUP_TYPE } from '../models/popup'
import { LEVEL, LEVEL_LABELS } from 'shared/constants/levels'
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
            exerciseData: new ExerciseDTO(),
            errors: new Map<string, string>(),
            tags: [] as ListElementDTO<number, string>[],
            isLoading: false,
            isTagsListLoading: false,
        }
    },
    computed: {
        options() {
            if (!this.tags) return []

            let results = this.tags.map(
                (tag: ListElementDTO<number, string>) =>
                    <LabeledValue>{
                        label: tag.data,
                        value: tag.id,
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
    },
    methods: {
        onLoadExercise: async function () {
            this.isLoading = true
            await this.loadExercise()
            this.isLoading = false
        },
        loadExercise: async function () {
            let response = await this.$api.get<ExerciseDTO>(
                ENDPOINTS.EXERCISE,
                {
                    course: Number(this.$route.params.courseId),
                    id: Number(this.$route.params.id),
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
            let response = await this.$api.get<
                ListElementDTO<number, string>[]
            >(
                ENDPOINTS.TAGS_LIST,
                { course: Number(this.$route.params.courseId) },
                true
            )
            if (response === null) return
            this.tags = response.data
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
            let response = await this.$api.postWithParams<any, ExerciseDTO>(
                ENDPOINTS.SAVE_EXERCISE,
                this.exerciseData,
                { course: Number(this.$route.params.courseId) },
                true
            )
            if (response === null) return
            this.$emit('newPopup', {
                type: POPUP_TYPE.SUCCESS,
                message: 'Salvataggio esercizio riuscito',
            })
        },
    },
    beforeMount() {
        if (!!this.$route.params.id) {
            this.onLoadExercise()
        }

        this.loadTagsList()
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
                            !!exerciseData.id
                                ? 'Modifica Esercizio'
                                : 'Nuovo esercizio'
                        }}</a-typography-text>
                    </h2>
                </div>
                <a-divider />
                <a-form-item
                    label="Titolo"
                    name="title"
                    :validateStatus="errors.has('title') ? 'error' : undefined"
                    :help="errors.get('title')">
                    <a-input v-model:value="exerciseData.title" />
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
                    <a-input v-model:value="exerciseData.task" />
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
                        v-model:value="exerciseData.specifiche"
                        :rows="4" />
                </a-form-item>

                <a-form-item
                    label="Input"
                    name="input"
                    :validateStatus="errors.has('input') ? 'error' : undefined"
                    :help="errors.get('input')">
                    <a-textarea v-model:value="exerciseData.input" :rows="4" />
                </a-form-item>

                <a-form-item
                    label="Output"
                    name="output"
                    :validateStatus="errors.has('output') ? 'error' : undefined"
                    :help="errors.get('output')">
                    <a-textarea v-model:value="exerciseData.output" :rows="4" />
                </a-form-item>

                <div class="center" v-show="isTagsListLoading">
                    <LoadingOutlined spin />
                </div>

                <a-form-item
                    label="Categoria"
                    name="idCategoria"
                    v-show="!isTagsListLoading">
                    <a-select
                        v-model:value="exerciseData.idCategoria"
                        :options="options"
                        show-search />
                </a-form-item>

                <a-form-item name="pronto" :wrapper-col="{ span: 16 }">
                    <a-checkbox v-model:checked="exerciseData.pronto"
                        >Pronto</a-checkbox
                    >
                </a-form-item>
                <a-form-item name="pubblicato" :wrapper-col="{ span: 16 }">
                    <a-checkbox v-model:checked="exerciseData.pubblicato"
                        >Pubblicato</a-checkbox
                    >
                </a-form-item>
            </a-form>
            <div class="center">
                <a-button type="primary" @click="handleSubmit">Salva</a-button>
                <a-button @click="() => $router.push({ path: URL.COURSES })"
                    >Annulla</a-button
                >
            </div>
        </div>
    </div>
</template>
