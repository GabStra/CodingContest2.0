<script lang="ts">
import { defineComponent } from 'vue'
import { Login } from 'shared/dist/dto/login'
import {
    validate,
    VALIDATION_LANGUAGE,
    parseValidationErrorsToMap,
} from 'shared/dist/utils/validator'
import { mapStores } from 'pinia'
import { useSessionStore } from '../scripts/store'
import { POPUP_TYPE } from '../models/popup'
import { router, URL } from '../scripts/router'
import { ENDPOINTS } from 'shared/dist/constants/endpoints'
import { LoadingOutlined } from '@ant-design/icons-vue'
import { LoginResponse } from 'shared/dist/dto/loginResponse'

export default defineComponent({
    components: {
        LoadingOutlined,
    },
    data() {
        return {
            loginData: new Login(),
            errors: new Map<string, string>(),
            isLoading: false,
            loadPage: false,
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
        login: async function () {
            let errors = await validate(this.loginData, VALIDATION_LANGUAGE.IT)
            parseValidationErrorsToMap(this.errors, errors)
            if (errors.length !== 0) return
            let response = await this.$api.post<LoginResponse, Login>(
                ENDPOINTS.LOGIN,
                this.loginData,
                true
            )
            if (!response) return
            this.sessionStore.userData = response.data
            this.$emit('newPopup', {
                type: POPUP_TYPE.SUCCESS,
                message: 'Login riuscito',
            })
            router.push({ path: URL.HOME })
        },

        handleClick: async function () {
            this.isLoading = true
            await this.login()
            this.isLoading = false
        },
    },
    beforeMount() {
        this.loadPage = true
    },
})
</script>
<template>
    <div class="element_container">
        <template v-if="loadPage">
            <div class="hoz-vert-center">
                <LoadingOutlined spin />
            </div>
        </template>

        <div v-show="!loadPage">
            <a-form layout="vertical" :model="loginData">
                <div class="center">
                    <img
                        src="@/assets/logo.png"
                        style="width: 100px"
                        @load="loadPage = false" />
                </div>
                <div class="center">
                    <h1>
                        <a-typography-text strong
                            >CodingContest 2.0</a-typography-text
                        >
                    </h1>
                </div>

                <a-divider />
                <a-form-item
                    label="Email"
                    name="email"
                    :validateStatus="errors.has('email') ? 'error' : undefined"
                    :help="errors.get('email')">
                    <a-input
                        v-model:value="loginData.email"
                        v-on:keyup.enter="handleClick" />
                </a-form-item>

                <a-form-item
                    label="Password"
                    name="password"
                    :validateStatus="
                        errors.has('password') ? 'error' : undefined
                    "
                    :help="errors.get('password')">
                    <a-input-password
                        v-model:value="loginData.password"
                        v-on:keyup.enter="handleClick" />
                </a-form-item>

                <a-form-item name="rememberMe" :wrapper-col="{ span: 16 }">
                    <a-checkbox v-model:checked="loginData.rememberMe"
                        >Ricordarmi</a-checkbox
                    >
                </a-form-item>

                <a-form-item>
                    <div class="center">
                        <a-button
                            type="primary"
                            @click="handleClick"
                            :loading="isLoading"
                            >Accedi</a-button
                        >
                        <h4 style="margin: 0">
                            <router-link :to="{ path: URL.PASSWORD_RECOVERY }">
                                Recupera Password
                            </router-link>
                        </h4>
                    </div>
                </a-form-item>
            </a-form>
            <a-divider />
            <div class="center">
                <router-link :to="{ path: URL.REGISTRATION }">
                    Registrati
                </router-link>
            </div>
        </div>
    </div>
</template>
<style scoped>
#form_item_password:focus {
    border: none !important;
}
.hoz-vert-center {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}
.element_container {
    width: 350px;
    min-height: 350px;
    padding: 10px;
}
</style>
