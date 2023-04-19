<script lang="ts">
import { defineComponent } from 'vue'
import { router, URL } from '../scripts/router'
import { Course } from 'shared/dto/course'
import {
    LoadingOutlined,
    CheckOutlined,
    CloseOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons-vue'
import { ENDPOINTS } from 'shared/constants/endpoints'
import { POPUP_TYPE } from '../models/popup'

export default defineComponent({
    components: {
        LoadingOutlined,
        CheckOutlined,
        CloseOutlined,
        EditOutlined,
        DeleteOutlined,
    },
    data() {
        return {
            courses: [] as Course[],
            isLoading: false,
        }
    },
    methods: {
        onLoadCourses: async function () {
            this.isLoading = true
            await this.loadCourses()
            this.isLoading = false
        },
        loadCourses: async function () {
            let response = await this.$api.get<Course[]>(
                ENDPOINTS.COURSES,
                null,
                true
            )
            if (response === null) return
            this.courses = response.data
        },
        handleEdit(courseId: number) {
            router.push({
                path: URL.MANAGE_COURSE,
                query: { id: courseId },
            })
        },
        deleteCourse: async function (id: number) {
            let response = await this.$api.delete<any>(
                ENDPOINTS.DELETE_COURSE,
                { course: Number(this.$route.query.id) },
                true
            )
            if (response === null) return
            this.$emit('newPopup', {
                type: POPUP_TYPE.SUCCESS,
                message: 'Corso eliminato',
            })
            this.onLoadCourses()
        },
    },
    setup() {
        const columns = [
            {
                title: 'Nome',
                dataIndex: 'nome',
                key: 'nome',
                width: 'auto',
            },
            {
                title: 'Docenti',
                dataIndex: 'nomiDocenti',
                key: 'nomiDocenti',
                width: 'auto',
                slots: { customRender: 'docenti' },
            },
            {
                title: 'Iscritti',
                dataIndex: 'numeroIscritti',
                key: 'numeroIscritti',
                width: '70px',
            },
            {
                title: 'Attivo',
                dataIndex: 'attivo',
                key: 'attivo',
                width: '70px',
                slots: { customRender: 'attivo' },
            },
            {
                title: '',
                key: 'actions',
                dataIndex: 'tags',
                width: '200px',
                slots: { customRender: 'actions' },
            },
        ]
        return {
            URL,
            columns,
        }
    },
    computed: {
        datasource() {
            return this.courses.map((course, index) => {
                return {
                    key: index,
                    ...course,
                }
            })
        },
    },
    beforeMount() {
        this.onLoadCourses()
    },
})
</script>
<template>
    <div>
        <div class="center">
            <h2>
                <a-typography-text strong> Corsi </a-typography-text>
            </h2>
        </div>
        <a-divider />
        <div v-show="isLoading">
            <div class="center">
                <LoadingOutlined spin />
            </div>
        </div>
        <div class="fill" v-show="!isLoading">
            <a-table :columns="columns" :data-source="datasource">
                <template #title>
                    <a-button
                        @click="
                            () => $router.push({ path: URL.MANAGE_COURSE })
                        ">
                        Aggiungi
                    </a-button></template
                >
                <template #attivo="{ record }">
                    <div class="center">
                        <CheckOutlined v-if="record.attivo" />
                        <CloseOutlined v-else />
                    </div>
                </template>
                <template #docenti="{ record }">
                    <div v-for="(item, index) in record.nomiDocenti">
                        {{ item }}
                    </div>
                </template>
                <template #actions="{ record }">
                    <div class="center">
                        <a-space>
                            <a @click="handleEdit(record.id)">Modifica</a>
                            <a-divider type="vertical" />
                            <a-popconfirm
                                v-if="datasource.length"
                                placement="left"
                                :title="`Sicuro di voler cancellare ${record.nome}?`" 
                                @confirm="deleteCourse(record.id)">
                                <a>Cancella</a>
                            </a-popconfirm>
                        </a-space>
                    </div>
                </template>
            </a-table>
        </div>
    </div>
</template>
