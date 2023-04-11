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
      <a-avatar size="medium">
        <template #icon><UserOutlined /></template>
      </a-avatar>
      <div class="userInfo-column">
        <span
          style="max-width: 100px; text-overflow: ellipsis; overflow: hidden"
          >{{ sessionStore.userData?.userName }}</span
        >
        <div>
          <template v-if="sessionStore.userData?.role === ROLE.USER">
            <a-tag color="green">Studente</a-tag>
          </template>
          <template v-if="sessionStore.userData?.role === ROLE.ADMIN">
            <a-tag color="orange">Docente</a-tag>
          </template>
          <template v-if="sessionStore.userData?.role === ROLE.SUPER_ADMIN">
            <a-tag color="red">Admin</a-tag>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.userInfo-container {
  padding: 5px;
}
.userInfo-row {
  display: flex;
  flex-direction: row;
  gap: 15px;
  justify-content: center;
  align-items: center;
}
.userInfo-column {
  display: flex;
  justify-content: center;
  line-height: 24px !important;
  flex-direction: column;
}
</style>
