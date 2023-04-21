<script lang="ts">
import { defineComponent } from 'vue'
import { ENDPOINTS } from 'shared/dist/constants/endpoints'
import { LoadingOutlined, LockOutlined } from '@ant-design/icons-vue'
import { URL } from '../scripts/router'
import { ExerciseTableRow } from 'shared/dist/dto/exerciseTableRow'
import { getColorFromLevel } from '../utils/gradient'
import LevelTag from './levelTag.vue'

export default defineComponent({
    components: {
        LoadingOutlined,
        LockOutlined,
        LevelTag,
    },
    data() {
        return {
            exercises: [] as ExerciseTableRow[],
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
            let response = await this.$api.get<ExerciseTableRow[]>(
                ENDPOINTS.EXERCISES_STUDENT,
                { course: Number(this.$route.query.id) },
                true
            )
            if (response === null) return
            this.exercises = response.data
        },
        handleClick(title: string) {
            this.$router.push({
                path: URL.EXECUTE_EXERCISE,
                query: {
                    idCorso: Number(this.$route.query.id),
                    titoloEsercizio: title,
                },
            })
        },
    },
    computed: {
        datasource(): ExerciseTableRow[] {
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
                slots: { customRender: 'link' },
            },
            {
                title: 'Categoria',
                dataIndex: 'tag',
                key: 'tag',
                width: 'auto',
            },
            {
                title: 'Livello',
                dataIndex: 'pubblicato',
                key: 'pubblicato',
                width: '110px',
                slots: { customRender: 'level' },
            },
            {
                title: 'Punteggio',
                dataIndex: 'score',
                key: 'score',
                width: '100px',
                slots: { customRender: 'score' },
            },
            {
                title: 'Bloccato',
                dataIndex: 'unlocked',
                key: 'unlocked',
                width: '100px',
                slots: { customRender: 'lock' },
            },
        ]
        return {
            URL,
            columns,
            getColorFromLevel,
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
                <template #link="{ record }">
                    <template v-if="record.unlocked">
                        <a @click="handleClick(record.title)">
                            {{ record.title }}
                        </a>
                    </template>
                    <template v-else>
                        {{ record.title }}
                    </template>
                </template>
                <template #level="{ record }">
                    <LevelTag :color="getColorFromLevel(record.level)">
                        Livello {{ record.level }}
                    </LevelTag>
                </template>
                <template #score="{ record }">
                    <template v-if="!!record.score">
                        <div class="center">
                            <a-progress
                                :percent="record.score"
                                :format="() => `${record.score}`" />
                        </div>
                    </template>
                </template>
                <template #lock="{ record }">
                    <div class="center">
                        <template v-if="!record.unlocked">
                            <LockOutlined />
                        </template>
                    </div>
                </template>
            </a-table>
        </div>
    </div>
</template>
