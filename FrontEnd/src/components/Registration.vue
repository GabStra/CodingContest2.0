<script lang="ts">
import { defineComponent } from "vue";
import {
  RegistrationDTO,
  RegistrationResponseDTO,
  REGISTRATION_STATUS,
} from "shared/dto/registrationDTO";
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
      registrationData: new RegistrationDTO(),
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
        let errors = await validate(
          this.registrationData,
          VALIDATION_LANGUAGE.IT
        );
        parseValidationErrorsToMap(this.errors, errors);
        if (errors.length !== 0) {
          this.isLoading = false;
          return;
        }
        let response = await this.$api.registration(this.registrationData);
        this.manageNotification(response);
        if (response.status === REGISTRATION_STATUS.Success) {
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

    manageNotification(response: RegistrationResponseDTO) {
      switch (response.status) {
        case REGISTRATION_STATUS.EmailInUse:
          this.$emit("newNotification", {
            type: NOTIFICATION_TYPE.ERROR,
            message: "Email già in uso",
          });
          return;

        case REGISTRATION_STATUS.UserIdInUse:
          this.$emit("newNotification", {
            type: NOTIFICATION_TYPE.ERROR,
            message: "Matricola o Username già in uso",
          });
          return;

        case REGISTRATION_STATUS.Success:
          this.$emit("newNotification", {
            type: NOTIFICATION_TYPE.SUCCESS,
            message: "Registrazione avvenuta con successo",
            description:
              "Riceverai a breve una mail per la verifica della mail",
          });
          return;
      }
    },
  },
});
</script>
<template>
  <div class="element_container">
    <a-form layout="vertical" :model="registrationData">
      <h2>Registrazione</h2>
      <a-divider />
      <a-form-item
        label="Username/Matricola"
        name="userId"
        :validateStatus="errors.has('userId') ? 'error' : undefined"
        :help="errors.get('userId')"
      >
        <a-input v-model:value="registrationData.userId" />
      </a-form-item>
      <a-form-item
        label="Nome e Cognome"
        name="userName"
        :validateStatus="errors.has('userName') ? 'error' : undefined"
        :help="errors.get('userName')"
      >
        <a-input v-model:value="registrationData.userName" />
      </a-form-item>

      <a-form-item
        label="Email"
        name="userEmail"
        :validateStatus="errors.has('userEmail') ? 'error' : undefined"
        :help="errors.get('userEmail')"
      >
        <a-input v-model:value="registrationData.userEmail" />
      </a-form-item>

      <a-form-item
        label="Password"
        name="userPass"
        :validateStatus="errors.has('userPass') ? 'error' : undefined"
        :help="errors.get('userPass')"
      >
        <a-input-password v-model:value="registrationData.userPass" />
      </a-form-item>

      <div class="center">
        <a-button type="primary" @click="handleSubmit" :loading="isLoading"
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
}

.center {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
</style>
