<script lang="ts">
import { defineComponent } from 'vue'
import { router, URL } from '../scripts/router'
import { LoadingOutlined } from '@ant-design/icons-vue'
import { ENDPOINTS } from 'shared/dist/constants/endpoints'
import { POPUP_TYPE } from '../models/popup'
import { ListElement } from 'shared/dist/dto/listElement'

export default defineComponent({
    components: {
        LoadingOutlined,
    },
    data() {
        return {
            users: [] as ListElement<number, string>[],
            isLoading: false,
            searchValue: '' as string,
        }
    },
    methods: {
        onLoadUsers: async function () {
            this.isLoading = true
            await this.loadUsers()
            this.isLoading = false
        },
        loadUsers: async function () {
            let response = await this.$api.get<ListElement<number, string>[]>(
                ENDPOINTS.USERS_LIST,
                null,
                true
            )
            if (response === null) return
            this.users = response.data
        },
        handleEdit(userId: number) {
            router.push({
                path: URL.MANAGE_COURSE,
                query: { id: userId },
            })
        },
        deleteUser: async function (id: number) {
            let response = await this.$api.delete<any>(
                ENDPOINTS.DELETE_COURSE,
                { course: id },
                true
            )
            if (response === null) return
            this.$emit('newPopup', {
                type: POPUP_TYPE.SUCCESS,
                message: 'Corso eliminato',
            })
            this.onLoadUsers()
        },
    },
    setup() {
        const columns = [
            {
                title: 'Nome utente',
                dataIndex: 'data',
                key: 'data',
                width: 'auto',
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
            let currentUsers = !!this.searchValue
                ? this.users.filter((user) =>
                      user.data.includes(this.searchValue)
                  )
                : this.users
            return currentUsers
        },
    },
    beforeMount() {
        this.onLoadUsers()
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
                    <a-input
                        v-model:value="searchValue"
                        placeholder="Nome utente"
                        class="search-input">
                        <template #prefix>
                            <SearchOutlined />
                        </template>
                    </a-input>
                </template>
                <template v-slot:actions="{ record }">
                    <div class="center">
                        <a-space>
                            <a @click="handleEdit(record.id)">Modifica</a>
                            <a-divider type="vertical" />
                            <a-popconfirm
                                v-if="datasource.length"
                                placement="left"
                                :title="`Sicuro di voler cancellare ${record.data}?`"
                                @confirm="deleteUser(record.id)">
                                <a>Cancella</a>
                            </a-popconfirm>
                        </a-space>
                    </div>
                </template>
            </a-table>
        </div>
    </div>
</template>
