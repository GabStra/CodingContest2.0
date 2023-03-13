<script lang="ts">
import { defineComponent } from "vue";
import { router, URL } from "../scripts/router";
export default defineComponent({
  setup() {
    return { URL, router };
  },
});
</script>

<template>
  <a-layout class="container">
    <a-layout-header>
      <a-menu mode="horizontal">
        <a-sub-menu key="sub1">
          <template #title>
            <span>
              <span>I miei corsi</span>
            </span>
          </template>
          <a-menu-item key="3">Tom</a-menu-item>
          <a-menu-item key="4">Bill</a-menu-item>
          <a-menu-item key="5">Alex</a-menu-item>
        </a-sub-menu>
        <a-menu-item key="1">
          <user-outlined />
          <span class="nav-text">Impostazioni</span>
        </a-menu-item>
      </a-menu></a-layout-header
    >
    <a-layout>
      <a-layout-content>
        <div class="content">
          <router-view
            @newNotification="(alert: any) => $emit('newNotification', alert)"
          />
        </div>
      </a-layout-content>
    </a-layout>
    <a-layout-footer>
      Coding Contest 2.0 | Icona di
      <a href="https://freeicons.io/profile/75801">Hilmy Abiyyu Asad</a> su
      <a href="https://freeicons.io">freeicons.io</a>
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
.content {
  padding: 20px;
  width: 100%;
  height: 100%;
}
.container {
  width: 100%;
  height: 100%;
}
</style>
