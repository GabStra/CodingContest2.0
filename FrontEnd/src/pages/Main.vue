<script lang="ts">
import { StoreDefinition, mapState } from "pinia";
import { defineComponent } from "vue";
import { useSessionStore } from "../scripts/store";
export default defineComponent({});
</script>
<template>
  <div class="container">
    <div class="page">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component
            :is="Component"
            @newPopup="(alert:any) => $emit('newPopup', alert)"
          />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style scoped lang="less">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page {
  padding: 20px;
  background: #121212;
  border: 1px solid #5e5e5e;
}

.container {
  width: 100%;
  height: 100%;
  min-height: 30%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
