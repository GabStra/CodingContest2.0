<script lang="ts">
import { defineComponent } from "vue";
import { router, ROUTES, URL } from "../scripts/router";
import { CourseDTO } from "shared/dto/courseDTO";
import { LoadingOutlined } from "@ant-design/icons-vue";
import { ENDPOINTS } from "../scripts/api";
import { POPUP_TYPE } from "../models/popup";
import { mapActions } from "pinia";
import { useSessionStore } from "../scripts/store";
import { ListElementDTO } from "shared/dto/ListElementDTO";
export default defineComponent({
  components: {
    LoadingOutlined,
  },
  data() {
    return {
      courses: [] as CourseDTO[],
      isLoading: false,
      searchValue: "" as string,
    };
  },
  methods: {
    ...mapActions(useSessionStore, ["loadMyCoursesAsStudent"]),
    ...mapActions(useSessionStore, ["loadMyCoursesAsTeacher"]),
    onLoadCourses: async function () {
      this.isLoading = true;
      await this.loadCourses();
      this.isLoading = false;
    },
    loadCourses: async function () {
      let response = await this.$api.get<CourseDTO[]>(
        ENDPOINTS.AVAILABLE_COURSES,
        null,
        true
      );
      if (response === null) return;
      this.courses = response.data;
    },
    register: async function (course: CourseDTO) {
      let response = await this.$api.post<any, CourseDTO>(
        ENDPOINTS.REGISTER_COURSE,
        { id: course.id } as CourseDTO,
        true
      );
      if (response === null) return;
      this.$emit("newPopup", {
        type: POPUP_TYPE.SUCCESS,
        message: "Richiesta inviata",
      });

      this.courses = this.courses.filter(function (item) {
        return item.id !== course.id!;
      });

      await this.onLoadCourses();
      this.loadMyCoursesAsStudent();
      this.loadMyCoursesAsTeacher();
    },
  },
  setup() {
    const columns = [
      {
        title: "Nome",
        dataIndex: "nome",
        key: "nome",
        width: "auto",
      },
      {
        title: "Docenti",
        dataIndex: "nomiDocenti",
        key: "nomiDocenti",
        width: "auto",
        slots: { customRender: "docenti" },
      },
      {
        title: "Iscritti",
        dataIndex: "numeroIscritti",
        key: "numeroIscritti",
        width: "auto",
      },
      {
        title: "",
        key: "actions",
        dataIndex: "tags",
        width: "50px",
        slots: { customRender: "actions" },
      },
    ];
    return {
      URL,
      ROUTES,
      columns,
    };
  },
  computed: {
    datasource() {
      let currentCourses = !!this.searchValue
        ? this.courses.filter((course) =>
            course.nome.includes(this.searchValue)
          )
        : this.courses;
      return currentCourses.map((course, index) => {
        return {
          key: index,
          ...course,
        };
      });
    },
  },
  beforeMount() {
    this.onLoadCourses();
  },
});
</script>

<template>
  <div>
    <div class="center">
      <h2>
        <a-typography-text strong> Corsi disponibili</a-typography-text>
      </h2>
    </div>
    <a-divider />
    <div v-show="isLoading">
      <div class="center">
        <LoadingOutlined spin />
      </div>
    </div>
    <div class="fill" v-show="!isLoading">
      <a-table :columns="columns" :data-source="datasource">
        <template #title>
          <a-input
            v-model:value="searchValue"
            placeholder="Nome corso"
            class="search-input"
          />
        </template>
        <template #attivo="{ record }">
          <div class="center">
            <CheckOutlined v-if="record.attivo" />
            <CloseOutlined v-else />
          </div>
        </template>
        <template #docenti="{ record }">
          <div v-for="(item, index) in record.nomiDocenti">
            {{ item }}
          </div>
        </template>
        <template #actions="{ record }">
          <template v-if="!record.isRegistered">
            <a-popconfirm
              v-if="datasource.length"
              placement="left"
              :title="`Sicuro di volerti iscrivere al corso ${record.nome}?`"
              @confirm="register(record)"
            >
              <a
                ><a-tag color="orange" style="padding: 4px 15px"
                  >Iscriviti</a-tag
                ></a
              >
            </a-popconfirm>
          </template>
          <template v-else>
            <template v-if="record.isRegistrationActive"
              ><a-tag color="red" style="padding: 4px 15px"
                >In Attesa</a-tag
              ></template
            >
            <template v-else
              ><a
                ><a-tag color="green" style="padding: 4px 15px"
                  >Accedi</a-tag
                ></a
              ></template
            >
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<style scoped>
.search-input {
  width: 200px;
  color: #e1e1e1;
}
</style>
