<script lang="ts">
import { ExerciseDTO } from 'shared/dto/exerciseDTO'
import { defineComponent } from 'vue'
import { ENDPOINTS } from 'shared/constants/endpoints'
import { LoadingOutlined } from '@ant-design/icons-vue'
import { POPUP_TYPE } from '../models/popup'
import { ROUTES, URL } from '../scripts/router'
import { ListElementDTO } from 'shared/dto/ListElementDTO'

export default defineComponent({
    components: {
        LoadingOutlined,
    },
    data() {
        return {
            exercises: [] as ListElementDTO<number, string>[],
            isLoading: false,
        }
    },
    watch: {
        '$route.params.id'(to, from) {
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
            let response = await this.$api.get<
                ListElementDTO<number, string>[]
            >(
                ENDPOINTS.EXERCISE_LIST,
                { course: Number(this.$route.params.id) },
                true
            )
            if (response === null) return
            this.exercises = response.data
        },

        deleteExercise: async function (id: number) {
            let response = await this.$api.delete<any>(
                ENDPOINTS.DELETE_EXERCISE,
                { course: Number(this.$route.params.id), id: id },
                true
            )
            if (response === null) return
            this.$emit('newPopup', {
                type: POPUP_TYPE.SUCCESS,
                message: 'Categoria eliminata',
            })
            this.onLoadExercises()
        },
        handleEdit(courseId: number) {
            this.$router.push({
                name: ROUTES.MANAGE_EXERCISE,
                params: {
                    courseId: Number(this.$route.params.id),
                    id: courseId,
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
                dataIndex: 'data',
                key: 'data',
                width: 'auto',
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
            ROUTES,
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
        <div class="center">
            <h2>
                <a-typography-text strong>Categorie</a-typography-text>
            </h2>
        </div>
        <a-divider />
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
                                    name: ROUTES.MANAGE_EXERCISE,
                                    params: {
                                        courseId: Number($route.params.id),
                                    },
                                })
                        ">
                        Aggiungi
                    </a-button>
                </template>
                <template #actions="{ record }">
                    <div class="center">
                        <a-space>
                            <a @click="handleEdit(record.id)">Modifica</a>
                            <a-divider type="vertical" />
                            <a-popconfirm
                                placement="left"
                                :title="`Sicuro di voler cancellare ${record.data}?`"
                                @confirm="deleteExercise(record.id)">
                                <a>Cancella</a>
                            </a-popconfirm>
                        </a-space>
                    </div>
                </template>
            </a-table>
        </div>
    </div>
</template>
