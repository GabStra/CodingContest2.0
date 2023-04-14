<script lang="ts">
import { defineComponent } from 'vue'
import { router, ROUTES, URL } from '../scripts/router'
import { CourseDTO } from 'shared/dto/courseDTO'
import {
    LoadingOutlined,
    CheckOutlined,
    CloseOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons-vue'
import { ENDPOINTS } from 'shared/constants/endpoints'

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
            courses: [] as CourseDTO[],
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
            let response = await this.$api.get<CourseDTO[]>(
                ENDPOINTS.COURSES,
                null,
                true
            )
            if (response === null) return
            this.courses = response.data
        },
        handleEdit(courseId: number) {
            router.push({
                name: ROUTES.MANAGE_COURSE,
                params: { id: courseId },
            })
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
            ROUTES,
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
                        type="primary"
                        @click="
                            () => $router.push({ name: ROUTES.MANAGE_COURSE })
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
                                :title="`Sicuro di voler cancellare ${record.nome}?`">
                                <a @click="">Cancella</a>
                            </a-popconfirm>
                        </a-space>
                    </div>
                </template>
            </a-table>
        </div>
    </div>
</template>
