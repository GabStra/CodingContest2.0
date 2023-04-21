<script lang="ts">
import { Exercise } from 'shared/dto/exercise'
import { defineComponent } from 'vue'
import { ENDPOINTS } from 'shared/constants/endpoints'
import {
    LoadingOutlined,
    CheckOutlined,
    CloseOutlined,
} from '@ant-design/icons-vue'
import { POPUP_TYPE } from '../models/popup'
import { URL } from '../scripts/router'

export default defineComponent({
    components: {
        LoadingOutlined,
        CheckOutlined,
        CloseOutlined,
    },
    data() {
        return {
            exercises: [] as Exercise[],
            isLoading: false,
        }
    },
    watch: {
        '$route.query.id'(to, from) {
            if (!to) return
            this.onLoadExercises()
        },
    },
    methods: {
        onLoadExercises: async function () {
            this.isLoading = true
            await this.loadExercises()
            this.isLoading = false
        },
        loadExercises: async function () {
            let response = await this.$api.get<Exercise[]>(
                ENDPOINTS.EXERCISES_TEACHER,
                { course: Number(this.$route.query.id) },
                true
            )
            if (response === null) return
            this.exercises = response.data
        },
        deleteExercise: async function (title: string) {
            let response = await this.$api.delete<any>(
                ENDPOINTS.DELETE_EXERCISE,
                {
                    course: Number(this.$route.query.id),
                    title: title,
                },
                true
            )
            if (response === null) return
            this.$emit('newPopup', {
                type: POPUP_TYPE.SUCCESS,
                message: 'Categoria eliminata',
            })
            this.onLoadExercises()
        },
        handleEdit(title: string) {
            this.$router.push({
                path: URL.MANAGE_EXERCISE_EDIT,
                query: {
                    idCorso: Number(this.$route.query.id),
                    titoloEsercizio: title,
                },
            })
        },

        handleCopy(title: string) {
            this.$router.push({
                path: URL.MANAGE_EXERCISE_COPY,
                query: {
                    idCorso: Number(this.$route.query.id),
                    titoloEsercizio: title,
                },
            })
        },
    },
    computed: {
        datasource() {
            return this.exercises
        },
    },
    setup() {
        const columns = [
            {
                title: 'Titolo esercizio',
                dataIndex: 'title',
                key: 'title',
                width: 'auto',
            },
            {
                title: 'Pronto',
                dataIndex: 'pronto',
                key: 'pronto',
                width: '70px',
                slots: { customRender: 'pronto' },
            },
            {
                title: 'Pubblicato',
                dataIndex: 'pubblicato',
                key: 'pubblicato',
                width: '100px',
                slots: { customRender: 'pubblicato' },
            },
            {
                title: '',
                key: 'actions',
                dataIndex: 'tags',
                width: '50px',
                slots: { customRender: 'actions' },
            },
        ]
        return {
            URL,
            columns,
        }
    },
    beforeMount() {
        this.onLoadExercises()
    },
})
</script>

<template>
    <div>
        <div v-show="isLoading">
            <div class="center">
                <LoadingOutlined spin />
            </div>
        </div>
        <div class="fill" v-if="!isLoading">
            <a-table :columns="columns" :data-source="datasource">
                <template #title>
                    <a-button
                        @click="
                            () =>
                                $router.push({
                                    path: URL.MANAGE_EXERCISE,
                                    query: {
                                        idCorso: Number($route.query.id),
                                    },
                                })
                        ">
                        Nuovo Esercizio
                    </a-button>
                </template>
                <template #pronto="{ record }">
                    <div class="center">
                        <CheckOutlined v-if="record.pronto" />
                        <CloseOutlined v-else />
                    </div>
                </template>
                <template #pubblicato="{ record }">
                    <div class="center">
                        <CheckOutlined v-if="record.pubblicato" />
                        <CloseOutlined v-else />
                    </div>
                </template>
                <template #actions="{ record }">
                    <div class="center">
                        <a-space>
                            <a @click="handleEdit(record.title)">Modifica</a>
                            <a-divider type="vertical" />
                            <a @click="handleCopy(record.title)">Copia</a>
                            <a-divider type="vertical" />
                            <a-popconfirm
                                placement="left"
                                :title="`Sicuro di voler cancellare ${record.title}?`"
                                @confirm="deleteExercise(record.title)">
                                <a>Cancella</a>
                            </a-popconfirm>
                        </a-space>
                    </div>
                </template>
            </a-table>
        </div>
    </div>
</template>
