<script lang="ts">
import { FormInstance } from "ant-design-vue";
import { defineComponent } from "vue";
import { Login } from "shared/view_models/login";
import {
  validate,
  VALIDATION_LANGUAGE,
  parseValidationErrorsToMap,
} from "shared/helper/validator";

export default defineComponent({
  data() {
    return {
      loginData: new Login(),
      errors: new Map<string, string>(),
    };
  },
  methods: {
    handleSubmit: async function () {
      try {
        let errors = await validate(this.loginData, VALIDATION_LANGUAGE.IT);
        parseValidationErrorsToMap(this.errors, errors);
        if (errors.length === 0) await this.$api.login(this.loginData);
      } catch (errorInfo) {
        console.log("Failed:", errorInfo);
      }
    },
  },
});
</script>
<template>
  <div class="form">
    <a-form layout="vertical" :model="loginData" ref="loginForm">
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
        <a-button type="primary" html-type="submit" @click="handleSubmit"
          >Accedi</a-button
        >
      </a-form-item>
    </a-form>
    <a-divider />
    <a href="">Registrati</a>
  </div>
</template>

<style scoped>
.form {
  width: 300px;
}
</style>
