<script lang="ts">
import { createVNode, defineComponent } from 'vue'
import { NewPassword } from 'shared/dist/dto/newPassword'
import {
    validate,
    VALIDATION_LANGUAGE,
    parseValidationErrorsToMap,
} from 'shared/dist/utils/validator'
import { Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { POPUP_TYPE } from '../models/popup'
import {
    NewPasswordResponse,
    NEW_PASSWORD_STATUS,
} from 'shared/dist/dto/newPassword'
import { router, URL } from '../scripts/router'
import { LoadingOutlined } from '@ant-design/icons-vue'
import { ENDPOINTS } from 'shared/dist/constants/endpoints'

export default defineComponent({
    emit: ['onSuccess', 'onError'],
    components: {
        LoadingOutlined,
    },
    data() {
        return {
            newPasswordData: new NewPassword(),
            errors: new Map<string, string>(),
            isLoading: false,
        }
    },
    setup() {
        return {
            URL,
        }
    },
    methods: {
        handleSave: async function () {
            let errors = await validate(
                this.newPasswordData,
                VALIDATION_LANGUAGE.IT
            )
            parseValidationErrorsToMap(this.errors, errors)
            if (errors.length !== 0) return

            let handleNewPasswordOk = this.handleNewPasswordOk
            Modal.confirm({
                title: 'Attenzione',
                icon: createVNode(ExclamationCircleOutlined),
                content:
                    'Sei sicuro di voler procedere al salvataggio della password?',
                okType: 'danger',
                okText: 'Si',
                cancelText: 'Annulla',
                onOk() {
                    handleNewPasswordOk()
                },
            })
        },

        handleNewPasswordOk: async function () {
            this.isLoading = true
            await this.saveNewPassword()
            this.isLoading = false
        },

        saveNewPassword: async function () {
            let response = await this.$api.post<
                NewPasswordResponse,
                NewPassword
            >(ENDPOINTS.NEW_PASSWORD, this.newPasswordData)
            if (response === null) return
            this.manageNotification(response.data)
            if (response.data.status === NEW_PASSWORD_STATUS.SUCCESS) {
                router.push({ path: URL.LOGIN })
            }
        },

        handleCheckLink: async function () {
            this.isLoading = true
            await this.checkLink()
            this.isLoading = false
        },

        checkLink: async function () {
            let response = await this.$api.post<
                NewPasswordResponse,
                NewPassword
            >(ENDPOINTS.NEW_PASSWORD_CHECK, this.newPasswordData)
            if (response === null) return
            if (response.data.status === NEW_PASSWORD_STATUS.EXPIRED) {
                this.$emit('newPopup', {
                    type: POPUP_TYPE.ERROR,
                    message: 'Link scaduto',
                })
                router.push({ path: URL.LOGIN })
            }
        },

        manageNotification(response: NewPasswordResponse) {
            switch (response.status) {
                case NEW_PASSWORD_STATUS.SUCCESS:
                    this.$emit('newPopup', {
                        type: POPUP_TYPE.SUCCESS,
                        message: 'Password aggiornata',
                    })
                    return

                case NEW_PASSWORD_STATUS.FAIL:
                    this.$emit('newPopup', {
                        type: POPUP_TYPE.ERROR,
                        message: 'Salvataggio fallito',
                    })
                    return

                case NEW_PASSWORD_STATUS.EXPIRED:
                    this.$emit('newPopup', {
                        type: POPUP_TYPE.ERROR,
                        message: 'Token scaduto',
                    })
                    return
            }
        },
    },
    mounted() {
        this.newPasswordData.token = this.$route.query.token as string
        if (!this.newPasswordData.token) router.push({ path: URL.HOME })
        this.checkLink()
    },
})
</script>
<template>
    <div class="element_container">
        <div v-show="isLoading">
            <div class="center">
                <LoadingOutlined spin />
            </div>
        </div>
        <a-form layout="vertical" :model="newPasswordData" v-show="!isLoading">
            <h2>Nuova password</h2>
            <a-divider />
            <a-form-item
                label="Nuova password"
                name="password"
                :validateStatus="errors.has('password') ? 'error' : undefined"
                :help="errors.get('password')">
                <a-input v-model:value="newPasswordData.password" />
            </a-form-item>

            <a-form-item>
                <a-space>
                    <a-button
                        type="primary"
                        @click="handleSave"
                        :loading="isLoading">
                        Salva
                    </a-button>
                    <a-button @click="() => $router.push({ path: URL.LOGIN })">
                        Annulla
                    </a-button>
                </a-space>
            </a-form-item>
        </a-form>
    </div>
</template>
<style scoped>
.element_container {
    width: 300px;
    padding: 10px;
}
</style>
