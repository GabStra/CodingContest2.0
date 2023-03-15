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
import { NOTIFICATION_TYPE } from "../models/notification";
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
    handleClick: async function () {
      try {
        this.isLoading = true;
        let errors = await validate(this.loginData, VALIDATION_LANGUAGE.IT);
        parseValidationErrorsToMap(this.errors, errors);
        console.log("TEST", this.errors, this.loginData);
        if (errors.length === 0) {
          this.sessionStore.userData = await this.$api.login(this.loginData);
          this.$emit("newNotification", {
            type: NOTIFICATION_TYPE.SUCCESS,
            message: "Login riuscito",
          });
          router.push({ path: URL.HOME });
        }
      } catch (errorInfo) {
        this.$emit("newNotification", {
          type: NOTIFICATION_TYPE.ERROR,
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
  <div class="element_container">
    <a-form layout="vertical" :model="loginData" ref="loginForm">
      <div class="center">
        <h2>Coding Contest 2.0</h2>
      </div>

      <a-divider />
      <a-form-item
        label="Email"
        name="email"
        :validateStatus="errors.has('email') ? 'error' : undefined"
        :help="errors.get('email')"
      >
        <a-input
          v-model:value="loginData.email"
          v-on:keyup.enter="handleClick"
        />
      </a-form-item>

      <a-form-item
        label="Password"
        name="password"
        :validateStatus="errors.has('password') ? 'error' : undefined"
        :help="errors.get('password')"
      >
        <a-input-password
          v-model:value="loginData.password"
          v-on:keyup.enter="handleClick"
        />
      </a-form-item>

      <a-form-item name="rememberMe" :wrapper-col="{ span: 16 }">
        <a-checkbox v-model:checked="loginData.rememberMe"
          >Ricordarmi</a-checkbox
        >
      </a-form-item>

      <a-form-item>
        <div class="center">
          <a-button type="primary" @click="handleClick" :loading="isLoading"
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
      <router-link :to="{ path: URL.REGISTRATION }"> Registrati </router-link>
    </div>
  </div>
</template>
<style scoped>
.center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.element_container {
  width: 350px;
}
</style>
