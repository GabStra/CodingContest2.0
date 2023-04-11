<script lang="ts">
import { defineComponent } from "vue";
import { router, URL } from "../scripts/router";
import UserInfo from "../components/UserInfo.vue";
import { POPUP_TYPE } from "../models/popup";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons-vue";
import Menu from "../components/Menu.vue";

export default defineComponent({
  components: {
    UserInfo,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    Menu,
  },
  data() {
    return {
      collapsed: null,
      isVisible: false,
      menuCollapsed: true,
    };
  },
  setup() {
    return { URL, router };
  },
  methods: {
    toggleCollapsed() {
      this.menuCollapsed = !this.menuCollapsed;
    },
    onCollapse(collapsed: boolean) {
      this.isVisible = collapsed;
      this.menuCollapsed = true;
    },
  },
});
</script>

<template>
  <a-layout class="container">
    <a-layout>
      <a-layout-header class="header" v-show="isVisible">
        <MenuUnfoldOutlined
          class="menu_button"
          @click="toggleCollapsed"
          v-if="menuCollapsed"
        />
        <MenuFoldOutlined class="menu_button" @click="toggleCollapsed" v-else />

        <h3 style="margin-bottom: 0px">
          <a-typography-text strong>CodingContest 2.0</a-typography-text>
        </h3>
      </a-layout-header>
    </a-layout>

    <a-layout class="container">
      <a-layout-sider
        breakpoint="lg"
        :collapsedWidth="0"
        :trigger="null"
        @collapse="onCollapse"
        v-show="!isVisible"
      >
        <div class="center" style="margin-top: 10px">
          <h3>
            <a-typography-text strong>CodingContest 2.0</a-typography-text>
          </h3>
        </div>
        <a-divider style="margin-top: 12px; margin-bottom: 12px" />
        <UserInfo />
        <a-divider style="margin-top: 12px; margin-bottom: 12px" />
        <Menu />
      </a-layout-sider>
      <a-layout-sider class="menu" v-show="!menuCollapsed">
        <UserInfo style="margin-top: 12px" />
        <a-divider style="margin-top: 12px; margin-bottom: 12px" />
        <Menu />
      </a-layout-sider>
      <a-layout-content>
        <div class="content">
          <transition name="fade" mode="out-in">
            <router-view @newPopup="(alert: any) => $emit('newPopup', alert)" />
          </transition>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.menu_button {
  font-size: 1.2em;
}

.ant-layout-header {
  background: #121212;
  padding: 0 25px;
}
.header {
  border-bottom: 1px solid #383838;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content {
  margin: 20px;
  padding: 20px;
  height: 95%;
  background: #121212 !important;
  border: 1px solid #383838;
}
.container {
  width: 100%;
  height: 100%;
  background-color: #121212;
}

.menu {
  position: fixed;
  z-index: 1000;
  height: 100%;
}
</style>
