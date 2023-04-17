<script lang="ts">
import { defineComponent } from 'vue'
import {
    Registration,
    RegistrationResponse,
    REGISTRATION_STATUS,
} from 'shared/dto/registration'
import {
    validate,
    VALIDATION_LANGUAGE,
    parseValidationErrorsToMap,
} from 'shared/utils/validator'
import { mapStores } from 'pinia'
import { useSessionStore } from '../scripts/store'
import { POPUP_TYPE } from '../models/popup'
import { router, URL } from '../scripts/router'
import { ENDPOINTS } from 'shared/constants/endpoints'

export default defineComponent({
    emit: ['onSuccess', 'onError'],
    data() {
        return {
            registrationData: new Registration(),
            errors: new Map<string, string>(),
            isLoading: false,
        }
    },
    setup() {
        return {
            URL,
        }
    },
    computed: {
        ...mapStores(useSessionStore),
    },
    methods: {
        handleSubmit: async function () {
            this.isLoading = true
            await this.registration()
            this.isLoading = false
        },

        registration: async function () {
            let errors = await validate(
                this.registrationData,
                VALIDATION_LANGUAGE.IT
            )
            parseValidationErrorsToMap(this.errors, errors)
            if (errors.length !== 0) return
            let response = await this.$api.post<
                RegistrationResponse,
                Registration
            >(ENDPOINTS.REGISTRATION, this.registrationData)
            if (response === null) return
            this.manageNotification(response.data)
            if (response.data.status === REGISTRATION_STATUS.Success) {
                router.push({ path: URL.LOGIN })
            }
        },

        manageNotification(response: RegistrationResponse) {
            switch (response.status) {
                case REGISTRATION_STATUS.EmailInUse:
                    this.$emit('newPopup', {
                        type: POPUP_TYPE.ERROR,
                        message: 'Email già in uso',
                    })
                    return

                case REGISTRATION_STATUS.UserIdInUse:
                    this.$emit('newPopup', {
                        type: POPUP_TYPE.ERROR,
                        message: 'Matricola o Username già in uso',
                    })
                    return

                case REGISTRATION_STATUS.Success:
                    this.$emit('newPopup', {
                        type: POPUP_TYPE.SUCCESS,
                        message: 'Registrazione avvenuta con successo',
                        description:
                            'Riceverai a breve una mail per la verifica della mail',
                    })
                    return
            }
        },
    },
})
</script>
<template>
    <div class="element_container">
        <a-form layout="vertical" :model="registrationData">
            <div class="center">
                <h1>Registrazione</h1>
            </div>

            <a-divider />
            <a-form-item
                label="Username/Matricola"
                name="userId"
                :validateStatus="errors.has('userId') ? 'error' : undefined"
                :help="errors.get('userId')">
                <a-input v-model:value="registrationData.userId" />
            </a-form-item>
            <a-form-item
                label="Nome e Cognome"
                name="userName"
                :validateStatus="errors.has('userName') ? 'error' : undefined"
                :help="errors.get('userName')">
                <a-input v-model:value="registrationData.userName" />
            </a-form-item>

            <a-form-item
                label="Email"
                name="userEmail"
                :validateStatus="errors.has('userEmail') ? 'error' : undefined"
                :help="errors.get('userEmail')">
                <a-input v-model:value="registrationData.userEmail" />
            </a-form-item>

            <a-form-item
                label="Password"
                name="userPass"
                :validateStatus="errors.has('userPass') ? 'error' : undefined"
                :help="errors.get('userPass')">
                <a-input-password v-model:value="registrationData.userPass" />
            </a-form-item>

            <div class="center" style="margin-top: 20px">
                <a-button
                    type="primary"
                    @click="handleSubmit"
                    :loading="isLoading"
                    >Registrati</a-button
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
