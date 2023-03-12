<script lang="ts">
import { defineComponent } from "vue";
import { router, ROUTE } from "../scripts/router";
export default defineComponent({
  setup() {
    return { ROUTE, router };
  },
});
</script>

<template>
  <a-layout class="container" has-sider>
    <a-layout-sider>
      <a-menu theme="dark" mode="inline"> </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content :style="{ margin: '24px 16px 0', overflow: 'initial' }">
        <a-button
          type="primary"
          @click="() => router.push({ name: ROUTE.LOGIN })"
          >vai a login</a-button
        >
        <router-view @addAlert="(alert: any) => $emit('addAlert', alert)" />
      </a-layout-content>
      <a-layout-footer :style="{ textAlign: 'center' }">
        Coding Contest 2.0
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
