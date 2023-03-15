<script lang="ts">
import { defineComponent } from "vue";
import { mapStores } from "pinia";
import { useSessionStore } from "../scripts/store";
import { ROLE } from "shared/constants/role";
import { UserOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  components: {
    UserOutlined,
  },
  computed: {
    ...mapStores(useSessionStore),
  },
  setup() {
    return { ROLE };
  },
});
</script>
<template>
  <div class="userInfo-container">
    <div class="userInfo-row">
      <a-avatar size="large">
        <template #icon><UserOutlined /></template>
      </a-avatar>
      <div class="userInfo-column">
        <span>{{ sessionStore.userData?.userName }}</span>
        <template v-if="sessionStore.userData?.role === ROLE.USER">
          <a-tag color="green">studente</a-tag>
        </template>
        <template v-if="sessionStore.userData?.role === ROLE.ADMIN">
          <a-tag color="orange">docente</a-tag>
        </template>
        <template v-if="sessionStore.userData?.role === ROLE.SUPER_ADMIN">
          <a-tag color="red">admin</a-tag>
        </template>
      </div>
    </div>
  </div>
</template>
<style scoped>
.userInfo-container {
  height: 100%;
  padding: 5px;
}
.userInfo-row {
  display: flex;
  flex-direction: row;
  gap: 15px;
  justify-content: space-evenly;
  height: 100%;
  align-items: center;
}
.userInfo-column {
  font-family: "roboto";
  color: white;
  display: flex;
  justify-content: center;
  line-height: 24px !important;
  flex-direction: column;
}
</style>
