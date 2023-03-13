<script lang="ts">
import { defineComponent } from "vue";
import { PasswordRecoveryDTO } from "shared/dto/passwordRecoveryDTO";
import {
  validate,
  VALIDATION_LANGUAGE,
  parseValidationErrorsToMap,
} from "shared/helper/validator";

import { NOTIFICATION_TYPE } from "../models/notification";
import { URL } from "../scripts/router";

export default defineComponent({
  emit: ["onSuccess", "onError"],
  data() {
    return {
      passwordRecoveryData: new PasswordRecoveryDTO(),
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
    handleClick: async function () {
      try {
        this.isLoading = true;
        let errors = await validate(
          this.passwordRecoveryData,
          VALIDATION_LANGUAGE.IT
        );
        parseValidationErrorsToMap(this.errors, errors);
        if (errors.length === 0) {
          await this.$api.sendPasswordRecoveryEmail(this.passwordRecoveryData);
          this.$emit("newNotification", {
            type: NOTIFICATION_TYPE.SUCCESS,
            message: "Mail inviata a " + this.passwordRecoveryData.email,
          });
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
  <div class="form">
    <a-form layout="vertical" :model="passwordRecoveryData">
      <h2>Recupera password</h2>
      <a-divider />
      <a-form-item
        label="Email"
        name="email"
        :validateStatus="errors.has('email') ? 'error' : undefined"
        :help="errors.get('email')"
      >
        <a-input v-model:value="passwordRecoveryData.email" />
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
