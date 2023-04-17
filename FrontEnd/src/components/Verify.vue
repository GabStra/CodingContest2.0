<script lang="ts">
import { defineComponent } from 'vue'

import { Verify, VERIFY_STATUS, VerifyResponse } from 'shared/dto/verify'
import { router, URL } from '../scripts/router'
import { LoadingOutlined } from '@ant-design/icons-vue'
import { ENDPOINTS } from 'shared/constants/endpoints'

export default defineComponent({
    emit: ['onSuccess', 'onError'],
    components: {
        LoadingOutlined,
    },
    data() {
        return {
            verifyData: new Verify(),
            status: null as VERIFY_STATUS | null,
            token: null as string | null,
            isLoading: false,
        }
    },
    setup() {
        return {
            VERIFY_STATUS,
        }
    },
    methods: {
        onCheckLink: async function () {
            this.isLoading = true
            await this.checkLink()
            this.isLoading = false
        },

        checkLink: async function () {
            let response = await this.$api.post<VerifyResponse, Verify>(
                ENDPOINTS.VERIFY,
                this.verifyData
            )
            if (response === null) return
            this.status = response.data.status
            setTimeout(() => {
                router.push({ path: URL.LOGIN })
            }, 5000)
        },
    },
    mounted() {
        this.verifyData.token = this.$route.query.token as string
        if (!this.verifyData.token) router.push({ path: URL.HOME })
        this.onCheckLink()
    },
})
</script>
<template>
    <div>
        <div v-show="isLoading">
            <LoadingOutlined spin />
        </div>
        <div v-show="!isLoading">
            <template v-if="status === VERIFY_STATUS.SUCCESS">
                <a-alert
                    message="Verifica riuscita"
                    description="La schermata di login si caricherà automaticamente."
                    type="success"
                    show-icon />
            </template>
            <template v-if="status === VERIFY_STATUS.FAIL">
                <a-alert
                    message="Verifica fallita"
                    description="Il link potrebbe essere scaduto o errato."
                    type="error"
                    show-icon />
            </template>
        </div>
    </div>
</template>
