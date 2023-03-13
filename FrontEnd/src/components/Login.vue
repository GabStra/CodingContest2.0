<script lang="ts">
import { defineComponent } from "vue";
import { LoginDTO } from "shared/dto/loginDTO";
import {
  validate,
  VALIDATION_LANGUAGE,
  parseValidationErrorsToMap,
} from "shared/helper/validator";
import { mapStores } from "pinia";
import { useSessionStore } from "../scripts/store";
import { ALERT_TYPE } from "../models/alert";
import { router, URL } from "../scripts/router";
export default defineComponent({
  emit: ["onSuccess", "onError"],
  data() {
    return {
      loginData: new LoginDTO(),
      errors: new Map<string, string>(),
      isLoading: false,
    };
  },
  setup() {
    return {
      URL,
    };
  },
  computed: {
    ...mapStores(useSessionStore),
  },
  methods: {
    handleSubmit: async function () {
      try {
        this.isLoading = true;
        let errors = await validate(this.loginData, VALIDATION_LANGUAGE.IT);
        parseValidationErrorsToMap(this.errors, errors);
        if (errors.length === 0) {
          this.sessionStore.userData = await this.$api.login(this.loginData);
          this.$emit("addAlert", {
            type: ALERT_TYPE.SUCCESS,
            message: "Login riuscito",
          });
          router.push({ path: URL.HOME });
        }
      } catch (errorInfo) {
        this.$emit("addAlert", {
          type: ALERT_TYPE.ERROR,
          message: "Richiesta fallita",
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script>
<template>
  <div>
    <a-form layout="vertical" :model="loginData" ref="loginForm">
      <h2>Coding Contest 2.0</h2>
      <a-divider />
      <a-form-item
        label="Email"
        name="email"
        :validateStatus="errors.has('email') ? 'error' : undefined"
        :help="errors.get('email')"
      >
        <a-input v-model:value="loginData.email" />
      </a-form-item>

      <a-form-item
        label="Password"
        name="password"
        :validateStatus="errors.has('password') ? 'error' : undefined"
        :help="errors.get('password')"
      >
        <a-input-password v-model:value="loginData.password" />
      </a-form-item>

      <a-form-item name="rememberMe" :wrapper-col="{ span: 16 }">
        <a-checkbox v-model:checked="loginData.rememberMe"
          >Ricordarmi</a-checkbox
        >
      </a-form-item>

      <a-form-item :wrapper-col="{ span: 16 }">
        <a-button type="primary" @click="handleSubmit" :loading="isLoading"
          >Accedi</a-button
        >
      </a-form-item>
    </a-form>
    <a-divider />
    <router-link :to="{ path: URL.REGISTRATION }"> Registrati </router-link>
    <a-divider type="vertical" />
    <router-link :to="{ path: URL.PASSWORD_RECOVERY }">
      Recupera Password
    </router-link>
  </div>
</template>
