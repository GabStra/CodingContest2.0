<script lang="ts">
import { ListElement } from 'shared/dto/listElement'
import { CourseRegistrationManager } from 'shared/dto/courseRegistrationManager'
import { defineComponent } from 'vue'
import { ENDPOINTS } from 'shared/constants/endpoints'
import {
    LoadingOutlined,
    CheckOutlined,
    CloseOutlined,
} from '@ant-design/icons-vue'
import { POPUP_TYPE } from '../models/popup'
import { URL } from '../scripts/router'
import { useSessionStore } from '../scripts/store'
import { mapActions, mapState } from 'pinia'

export default defineComponent({
    components: {
        LoadingOutlined,
    },
    data() {
        return {
            data: [] as {
                selected: boolean
                userName: string
                userId: string
            }[],
            isLoading: false,
            selectAll: false,
        }
    },
    watch: {
        '$route.query.id'(to, from) {
            if (!to) return
            this.onLoadRequests()
        },
        hasRequestsByCourseId: {
            handler: function (to, from) {
                this.$forceUpdate()
            },
            deep: true,
        },
        selectAll: function (value) {
            this.data.forEach((item) => (item.selected = value))
        },
    },
    computed: {
        ...mapState(useSessionStore, ['hasRequestsByCourseId']),
        selectedItems() {
            return this.data.filter((item) => item.selected)
        },
    },
    methods: {
        ...mapActions(useSessionStore, ['loadPendingRequestsCount']),
        anyRequestForCourse(courseId: number) {
            if (!this.hasRequestsByCourseId[courseId]) return false
            return this.hasRequestsByCourseId[courseId]
        },
        onLoadRequests: async function () {
            this.isLoading = true
            this.selectAll = false
            await this.loadRequests()
            this.isLoading = false
        },
        loadRequests: async function () {
            let response = await this.$api.get<ListElement<string, string>[]>(
                ENDPOINTS.WAITING_TO_BE_APPROVED_LIST,
                { course: Number(this.$route.query.id) },
                true
            )
            if (response === null) return
            this.data = response.data.map((item) => ({
                selected: false,
                userName: item.data,
                userId: item.id,
            }))
        },
        approveRequest: async function (userId: string) {
            let courseRegistrationManager = new CourseRegistrationManager({
                ids: [userId],
            })
            await this.approveRequests(courseRegistrationManager)
        },
        approveSelectedRequest: async function () {
            let courseRegistrationManager = new CourseRegistrationManager({
                ids: [...this.selectedItems.map((item) => item.userId)],
            })
            await this.approveRequests(courseRegistrationManager)
        },
        rejectRequest: async function (userId: string) {
            let courseRegistrationManager = new CourseRegistrationManager({
                ids: [userId],
            })
            await this.rejectRequests(courseRegistrationManager)
        },
        rejectSelectedRequest: async function () {
            let courseRegistrationManager = new CourseRegistrationManager({
                ids: [...this.selectedItems.map((item) => item.userId)],
            })
            await this.rejectRequests(courseRegistrationManager)
        },
        approveRequests: async function (
            courseRegistrationManager: CourseRegistrationManager
        ) {
            let response = await this.$api.postWithParams<
                any,
                CourseRegistrationManager
            >(
                ENDPOINTS.APPROVE_REQUESTS,
                courseRegistrationManager,
                { course: Number(this.$route.query.id) },
                true
            )
            if (response === null) return
            this.$emit('newPopup', {
                type: POPUP_TYPE.SUCCESS,
                message:
                    courseRegistrationManager.ids.length > 1
                        ? 'Richieste accettate'
                        : 'Richiesta accettata',
            })
            this.onLoadRequests()
            this.loadPendingRequestsCount()
        },
        rejectRequests: async function (
            courseRegistrationManager: CourseRegistrationManager
        ) {
            let response = await this.$api.postWithParams<
                any,
                CourseRegistrationManager
            >(
                ENDPOINTS.REJECT_REQUESTS,
                courseRegistrationManager,
                { course: Number(this.$route.query.id) },
                true
            )
            if (response === null) return
            this.$emit('newPopup', {
                type: POPUP_TYPE.SUCCESS,
                message:
                    courseRegistrationManager.ids.length > 1
                        ? 'Richieste rifiutate'
                        : 'Richiesta rifiutata',
            })
            this.onLoadRequests()
            this.loadPendingRequestsCount()
        },
        handleEdit(title: string) {
            this.$router.push({
                path: URL.MANAGE_EXERCISE,
                query: {
                    idCorso: Number(this.$route.query.id),
                    titoloEsercizio: title,
                },
            })
        },
    },
    setup() {
        const columns = [
            {
                title: '',
                dataIndex: 'selected',
                key: 'selected',
                width: '70px',
                slots: { customRender: 'checkbox' },
            },
            {
                title: 'Nome utente',
                dataIndex: 'userName',
                key: 'userName',
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
    beforeMount() {
        this.onLoadRequests()
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
            <a-table :columns="columns" :data-source="data">
                <template #title>
                    <a-space v-show="selectedItems.length > 0">
                        <a-button @click="approveSelectedRequest"
                            >Approva selezionate</a-button
                        >
                        <a-button @click="rejectSelectedRequest"
                            >Rifiuta selezionate</a-button
                        >
                    </a-space>
                </template>
                <template #headerCell="{ column }">
                    <template v-if="column.key === 'selected'">
                        <div class="center">
                            <a-checkbox
                                v-model:checked="selectAll"
                                :disabled="!(data.length > 0)" />
                        </div>
                    </template>
                </template>
                <template #checkbox="{ record }">
                    <div class="center">
                        <a-checkbox v-model:checked="record.selected" />
                    </div>
                </template>
                <template #actions="{ record }">
                    <div class="center">
                        <a-space>
                            <a @click="approveRequest(record.userId)"
                                >Accetta</a
                            >
                            <a-divider type="vertical" />
                            <a-popconfirm
                                placement="left"
                                :title="`Sicuro di voler cancellare la richiesta di ${record.userName}?`"
                                @confirm="rejectRequest(record.userId)">
                                <a>Rifiuta</a>
                            </a-popconfirm>
                        </a-space>
                    </div>
                </template>
            </a-table>
        </div>
    </div>
</template>
