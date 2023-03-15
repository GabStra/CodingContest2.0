<script lang="ts">
import { defineComponent } from "vue";
import { router, URL } from "../scripts/router";
import UserInfo from "../components/UserInfo.vue";
import { NOTIFICATION_TYPE } from "../models/notification";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons-vue";

export default defineComponent({
  components: {
    UserInfo,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
  },
  data() {
    return {
      collapsed: null,
    };
  },
  setup() {
    return { URL, router };
  },
  methods: {
    toggleCollapsed() {
      //this.collapsed = false;
    },
    manageLogout: async function () {
      try {
        await this.$api.logout();
        router.push({ path: URL.LOGIN });
      } catch {
        this.$emit("newNotification", {
          type: NOTIFICATION_TYPE.ERROR,
          message: "Richiesta fallita",
        });
      }
    },
  },
});
</script>

<template>
  <a-layout class="container">
    <a-layout
      ><a-layout-header
        :style="{
          padding: '0 10px',
          position: 'fixed',
          zIndex: 1,
          width: '100%',
        }"
      >
        <div class="header_container">
          <a-button type="text" @click="toggleCollapsed">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>

          <h3 style="margin-bottom: 0px">Coding Contest 2.0</h3>
          <UserInfo />
        </div> </a-layout-header
    ></a-layout>

    <a-layout class="container">
      <a-layout-sider breakpoint="lg" :collapsedWidth="0" :trigger="null">
        <a-menu theme="dark">
          <a-menu-item key="1">
            <span class="nav-text">Istituti</span>
          </a-menu-item>
          <a-menu-item key="1">
            <span class="nav-text">Corsi</span>
          </a-menu-item>
          <a-sub-menu key="sub2">
            <template #title>Navigation Four</template>
            <a-menu-item key="7">Option 7</a-menu-item>
            <a-menu-item key="8">Option 8</a-menu-item>
            <a-menu-item key="9">Option 9</a-menu-item>
            <a-menu-item key="10">Option 10</a-menu-item>
          </a-sub-menu>
          <a-menu-item key="2">
            <span class="nav-text">Impostazioni</span>
          </a-menu-item>
          <a-menu-item key="4">
            <span @click="manageLogout" class="nav-text">Logout</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content>
        <div class="content">
          <router-view
            @newNotification="(alert: any) => $emit('newNotification', alert)"
          />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.header_container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.content {
  padding: 20px;
}
.container {
  width: 100%;
  height: 100%;
}
</style>
