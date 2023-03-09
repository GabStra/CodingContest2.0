<template>
  <a-layout class="container" has-sider>
    <a-layout-sider>
      <a-menu theme="dark" mode="inline"> </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content :style="{ margin: '24px 16px 0', overflow: 'initial' }">
        <router-view />
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
