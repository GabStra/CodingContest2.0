<script lang="ts">
import { defineComponent } from "vue";
import { CourseDTO } from "shared/dto/courseDTO";
import { LabeledValue } from "ant-design-vue/es/select";
import {
  validate,
  VALIDATION_LANGUAGE,
  parseValidationErrorsToMap,
} from "shared/helper/validator";
import { ListElementDTO } from "shared/dto/ListElementDTO";
import { LoadingOutlined } from "@ant-design/icons-vue";
import { ENDPOINTS } from "../scripts/api";
import { POPUP_TYPE } from "../models/popup";

export default defineComponent({
  components: {
    LoadingOutlined,
  },
  props: ["id"],
  data() {
    return {
      courseData: new CourseDTO(),
      errors: new Map<string, string>(),
      users: [] as ListElementDTO<number, string>[],
      isLoading: false,
      isUsersListLoading: false,
    };
  },
  computed: {
    options() {
      if (!this.users || !this.courseData || !this.courseData.idDocenti)
        return [];

      let results = this.users.map(
        (user: ListElementDTO<number, string>) =>
          <LabeledValue>{
            label: user.data,
            value: user.id,
          }
      );

      return results;
    },
  },
  methods: {
    onLoadCourse: async function () {
      this.isLoading = true;
      await this.loadCourse();
      this.isLoading = false;
    },
    loadCourse: async function () {
      let response = await this.$api.get<CourseDTO>(
        ENDPOINTS.COURSE,
        { id: Number(this.$route.params.id) },
        true
      );
      if (response === null) return;
      this.courseData = response.data;
    },
    onLoadUsers: async function () {
      this.isUsersListLoading = true;
      await this.loadUsers();
      this.isUsersListLoading = false;
    },
    loadUsers: async function () {
      let response = await this.$api.get<ListElementDTO<number, string>[]>(
        ENDPOINTS.USERS_LIST,
        null,
        true
      );
      if (response === null) return;
      this.users = response.data;
    },
    handleSubmit: async function () {
      this.isLoading = true;
      await this.saveCourse();
      this.isLoading = false;
    },

    saveCourse: async function () {
      let errors = await validate(this.courseData, VALIDATION_LANGUAGE.IT);
      parseValidationErrorsToMap(this.errors, errors);
      if (errors.length !== 0) return;
      let response = await this.$api.post<any, CourseDTO>(
        ENDPOINTS.NEW_COURSE,
        this.courseData,
        true
      );
      if (response === null) return;
      this.$emit("newPopup", {
        type: POPUP_TYPE.SUCCESS,
        message: "Salvataggio corso riuscito",
      });
    },
  },
  beforeMount() {
    this.courseData.idDocenti = [];
    if (!!this.$route.params.id) {
      this.onLoadCourse();
    }

    this.loadUsers();
  },
});
</script>

<template>
  <div>
    <LoadingOutlined v-if="isLoading" />
    <div v-else>
      <a-form layout="vertical" :model="courseData">
        <div class="center">
          <h1>
            <a-typography-text strong>{{
              !!courseData.id ? "Modifica corso" : "Nuovo corso"
            }}</a-typography-text>
          </h1>
        </div>
        <a-divider />
        <a-form-item
          label="Nome"
          name="nome"
          :validateStatus="errors.has('nome') ? 'error' : undefined"
          :help="errors.get('nome')"
        >
          <a-input v-model:value="courseData.nome" />
        </a-form-item>
        <a-form-item
          label="Info"
          name="info"
          :validateStatus="errors.has('info') ? 'error' : undefined"
          :help="errors.get('info')"
        >
          <a-textarea v-model:value="courseData.info" :rows="4" />
        </a-form-item>

        <div class="center" v-show="isUsersListLoading">
          <LoadingOutlined spin />
        </div>

        <a-form-item
          label="Docenti"
          name="idDocenti"
          v-show="!isUsersListLoading"
        >
          <a-select
            v-model:value="courseData.idDocenti"
            :options="options"
            mode="multiple"
            show-search
          />
        </a-form-item>

        <a-form-item name="attivo" :wrapper-col="{ span: 16 }">
          <a-checkbox v-model:checked="courseData.attivo">Attivo</a-checkbox>
        </a-form-item>
      </a-form>
      <a-button type="primary" @click="handleSubmit">Salva</a-button>
    </div>
  </div>
</template>