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
import { NOTIFICATION_TYPE } from "../models/notification";
import {
  NewPasswordResponseDTO,
  NEW_PASSWORD_STATUS,
} from "shared/dto/newPasswordDTO";
import { router, URL } from "../scripts/router";
import { LoadingOutlined } from "@ant-design/icons-vue";

export default defineComponent({
  emit: ["onSuccess", "onError"],
  components: {
    LoadingOutlined,
  },
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
    handleSave: async function () {
      let errors = await validate(this.newPasswordData, VALIDATION_LANGUAGE.IT);
      parseValidationErrorsToMap(this.errors, errors);
      if (errors.length !== 0) return;

      let saveNewPassword = this.saveNewPassword;
      Modal.confirm({
        title: "Attenzione",
        icon: createVNode(ExclamationCircleOutlined),
        content: "Sei sicuro di voler procedere al salvataggio della password?",
        okType: "danger",
        okText: "Si",
        cancelText: "Annulla",
        onOk() {
          saveNewPassword();
        },
      });
    },
    saveNewPassword: async function () {
      try {
        let response = await this.$api.newPassword(this.newPasswordData);
        this.manageNotification(response);
        if (response.status === NEW_PASSWORD_STATUS.SUCCESS) {
          router.push({ path: URL.LOGIN });
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

    checkLink: async function () {
      try {
        this.isLoading = true;
        let response = await this.$api.newPasswordCheck(this.newPasswordData);
        if (response.status === NEW_PASSWORD_STATUS.EXPIRED) {
          this.expiredNotification();
          router.push({ path: URL.LOGIN });
        }
      } catch {
        this.$emit("newNotification", {
          type: NOTIFICATION_TYPE.ERROR,
          message: "Richiesta fallita",
        });
        router.push({ path: URL.LOGIN });
      } finally {
        this.isLoading = false;
      }
    },

    expiredNotification() {
      this.$emit("newNotification", {
        type: NOTIFICATION_TYPE.ERROR,
        message: "Link scaduto",
      });
    },

    manageNotification(response: NewPasswordResponseDTO) {
      switch (response.status) {
        case NEW_PASSWORD_STATUS.SUCCESS:
          this.$emit("newNotification", {
            type: NOTIFICATION_TYPE.SUCCESS,
            message: "Password aggiornata",
          });
          return;

        case NEW_PASSWORD_STATUS.FAIL:
          this.$emit("newNotification", {
            type: NOTIFICATION_TYPE.ERROR,
            message: "Salvataggio fallito",
          });
          return;

        case NEW_PASSWORD_STATUS.EXPIRED:
          this.$emit("newNotification", {
            type: NOTIFICATION_TYPE.ERROR,
            message: "Token scaduto",
          });
          return;
      }
    },
  },
  mounted() {
    this.newPasswordData.token = this.$route.query.token as string;
    if (!this.newPasswordData.token) router.push({ path: URL.HOME });
    this.checkLink();
  },
});
</script>
<template>
  <div class="element_container">
    <div v-show="isLoading">
      <LoadingOutlined spin />
    </div>
    <a-form layout="vertical" :model="newPasswordData" v-show="!isLoading">
      <h2>Nuova password</h2>
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
        <a-space>
          <a-button type="primary" @click="handleSave" :loading="isLoading"
            >Salva</a-button
          >
          <a-button @click="() => $router.push({ path: URL.LOGIN })"
            >Annulla</a-button
          >
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>
<style scoped>
.element_container {
  width: 300px;
}
</style>
