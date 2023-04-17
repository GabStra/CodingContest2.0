<script lang="ts">
import { defineComponent } from 'vue'
import { PasswordRecovery } from 'shared/dto/passwordRecovery'
import {
    validate,
    VALIDATION_LANGUAGE,
    parseValidationErrorsToMap,
} from 'shared/utils/validator'

import { POPUP_TYPE } from '../models/popup'
import { URL } from '../scripts/router'
import { ENDPOINTS } from 'shared/constants/endpoints'

export default defineComponent({
    emit: ['onSuccess', 'onError'],
    data() {
        return {
            passwordRecoveryData: new PasswordRecovery(),
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
        handleClick: async function () {
            this.isLoading = true
            await this.passwordReset()
            this.isLoading = false
        },
        passwordReset: async function () {
            let errors = await validate(
                this.passwordRecoveryData,
                VALIDATION_LANGUAGE.IT
            )
            parseValidationErrorsToMap(this.errors, errors)
            if (errors.length !== 0) return
            let response = await this.$api.post<any, PasswordRecovery>(
                ENDPOINTS.PASSWORD_RESET,
                this.passwordRecoveryData
            )
            if (response === null) return
            this.$emit('newPopup', {
                type: POPUP_TYPE.SUCCESS,
                message: 'Mail inviata a ' + this.passwordRecoveryData.email,
            })
        },
    },
})
</script>
<template>
    <div class="element_container">
        <a-form layout="vertical" :model="passwordRecoveryData">
            <h1>Recupera password</h1>
            <a-divider />
            <a-form-item
                label="Email"
                name="email"
                :validateStatus="errors.has('email') ? 'error' : undefined"
                :help="errors.get('email')">
                <a-input v-model:value="passwordRecoveryData.email" />
            </a-form-item>

            <div class="center">
                <a-button
                    type="primary"
                    @click="handleClick"
                    :loading="isLoading"
                    >Invia mail</a-button
                >
                <a-button @click="() => $router.push({ path: URL.LOGIN })"
                    >Annulla</a-button
                >
            </div>
        </a-form>
    </div>
</template>
<style scoped>
.element_container {
    width: 300px;
    padding: 10px;
}
</style>
