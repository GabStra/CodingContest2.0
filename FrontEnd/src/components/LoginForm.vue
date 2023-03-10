<script lang="ts">
import { FormInstance } from "ant-design-vue";
import { defineComponent } from "vue";
import { Login } from "../../../Shared/models/login";
import isEmail from "validator/lib/isEmail";
import { Rule } from "ant-design-vue/lib/form";
import axios from "axios";
export default defineComponent({
  data() {
    return {
      loginData: {} as Login,
    };
  },
  setup() {
    let validateEmail = async (rule: Rule, value: string) => {
      if (!!value && isEmail(value)) {
        return Promise.resolve();
      } else {
        return Promise.reject("Email inserita non valida");
      }
    };
    return {
      validateEmail,
    };
  },
  methods: {
    handleSubmit: async function () {
      try {
        const values = await (
          this.$refs.loginForm as FormInstance
        ).validateFields();
        await axios.post("http://localhost:60000/login", this.loginData, {
          withCredentials: true,
        });
        console.log("Success:", values);
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
        :rules="[{ required: true, validator: validateEmail }]"
      >
        <a-input v-model:value="loginData.email" />
      </a-form-item>

      <a-form-item
        label="Password"
        name="password"
        :rules="[{ required: true, message: 'Please input your password!' }]"
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
