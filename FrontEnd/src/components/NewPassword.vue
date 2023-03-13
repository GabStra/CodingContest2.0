<script lang="ts">
import { createVNode, defineComponent } from "vue";
import { NewPasswordDTO } from "shared/dto/newPasswordDTO";
import {
  validate,
  VALIDATION_LANGUAGE,
  parseValidationErrorsToMap,
} from "shared/helper/validator";
import { Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { ALERT_TYPE } from "../models/alert";
import { URL } from "../scripts/router";

export default defineComponent({
  emit: ["onSuccess", "onError"],
  data() {
    return {
      newPasswordData: new NewPasswordDTO(),
      errors: new Map<string, string>(),
      isLoading: false,
    };
  },
  setup() {
    return {
      URL,
    };
  },
  methods: {
    handleSaveNewPassword() {
      let errors = await validate(this.newPasswordData, VALIDATION_LANGUAGE.IT);
      parseValidationErrorsToMap(this.errors, errors);
      if (errors.length !== 0) return;

      let handleClick = this.handleClick;
      Modal.confirm({
        title: "Attenzione",
        icon: createVNode(ExclamationCircleOutlined),
        content: "Sei sicuro di voler procedere al salvataggio della password?",
        okType: "danger",
        okText: "Si",
        cancelText: "Annulla",
        onOk() {
          handleClick();
        },
      });
    },
    handleClick: async function () {
      try {
        await this.$api.sendPasswordRecoveryEmail(this.newPasswordData);
        this.$emit("addAlert", {
          type: ALERT_TYPE.SUCCESS,
          message: "Mail inviata",
        });
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
  <div class="form">
    <a-form layout="vertical" :model="newPasswordData">
      <h2>Recupera password</h2>
      <a-divider />
      <a-form-item
        label="Nuova password"
        name="password"
        :validateStatus="errors.has('password') ? 'error' : undefined"
        :help="errors.get('password')"
      >
        <a-input v-model:value="newPasswordData.password" />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" @click="handleClick" :loading="isLoading"
          >Invia mail</a-button
        >
        <a-divider type="vertical" />
        <a-button @click="() => $router.push({ path: URL.LOGIN })"
          >Annulla</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>
