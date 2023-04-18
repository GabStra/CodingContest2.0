<script lang="ts">
import { defineComponent } from 'vue'
import { URL } from '../scripts/router'
import { Course } from 'shared/dto/course'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { ENDPOINTS } from 'shared/constants/endpoints'
import { POPUP_TYPE } from '../models/popup'
import { mapActions } from 'pinia'
import { useSessionStore } from '../scripts/store'
export default defineComponent({
    components: {
        LoadingOutlined,
        SearchOutlined,
    },
    data() {
        return {
            courses: [] as Course[],
            isLoading: false,
            searchValue: '' as string,
        }
    },
    methods: {
        ...mapActions(useSessionStore, ['loadMyCoursesAsStudent']),
        ...mapActions(useSessionStore, ['loadMyCoursesAsTeacher']),
        onLoadCourses: async function () {
            this.isLoading = true
            await this.loadCourses()
            this.isLoading = false
        },
        loadCourses: async function () {
            let response = await this.$api.get<Course[]>(
                ENDPOINTS.AVAILABLE_COURSES,
                null,
                true
            )
            if (response === null) return
            this.courses = response.data
        },
        register: async function (course: Course) {
            let response = await this.$api.post<any, Course>(
                ENDPOINTS.REGISTER_COURSE,
                { id: course.id } as Course,
                true
            )
            if (response === null) return
            this.$emit('newPopup', {
                type: POPUP_TYPE.SUCCESS,
                message: 'Richiesta inviata',
            })

            this.courses = this.courses.filter(function (item) {
                return item.id !== course.id!
            })

            await this.onLoadCourses()
            this.loadMyCoursesAsStudent()
            this.loadMyCoursesAsTeacher()
        },
    },
    setup() {
        const columns = [
            {
                title: 'Nome',
                dataIndex: 'nome',
                key: 'nome',
                width: 'auto',
                slots: { customRender: 'nome' },
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
            columns,
        }
    },
    computed: {
        datasource() {
            let currentCourses = !!this.searchValue
                ? this.courses.filter((course) =>
                      course.nome.includes(this.searchValue)
                  )
                : this.courses
            return currentCourses.map((course, index) => {
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
                <a-typography-text strong> Corsi disponibili</a-typography-text>
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
                    <a-input
                        v-model:value="searchValue"
                        placeholder="Nome corso"
                        class="search-input">
                        <template #prefix>
                            <SearchOutlined />
                        </template>
                    </a-input>
                </template>
                <template #nome="{ record }">
                    <template
                        v-if="
                            record.isRegistered && record.isRegistrationActive
                        ">
                        <a
                            @click="
                                () =>
                                    $router.push({
                                        path: URL.STUDENT_COURSE,
                                        query: { id: record.id },
                                    })
                            ">
                            {{ record.nome }}
                        </a>
                    </template>
                    <template v-else>
                        {{ record.nome }}
                    </template>
                </template>
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
                        <template v-if="!record.isRegistered">
                            <a-popconfirm
                                v-if="datasource.length"
                                placement="left"
                                :title="`Sicuro di volerti iscrivere al corso ${record.nome}?`"
                                @confirm="register(record)">
                                <a> Iscriviti </a>
                            </a-popconfirm>
                        </template>
                        <template v-else>
                            <template v-if="record.isRegistrationActive">
                                <a-tag color="green" style="padding: 4px 15px">
                                    Iscritto
                                </a-tag>
                            </template>
                            <template v-else>
                                <a-tag color="orange" style="padding: 4px 15px">
                                    In Attesa
                                </a-tag>
                            </template>
                        </template>
                    </div>
                </template>
            </a-table>
        </div>
    </div>
</template>

<style scoped>
.search-input {
    width: 200px;
    color: #e1e1e1;
}
</style>
