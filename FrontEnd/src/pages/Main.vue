<script lang="ts">
import { StoreDefinition, mapState } from "pinia";
import { defineComponent } from "vue";
import { useSessionStore } from "../scripts/store";
export default defineComponent({});
</script>
<template>
  <div class="container">
    <div class="element_container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component
            :is="Component"
            @newNotification="(alert:any) => $emit('newNotification', alert)"
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
.element_container {
  padding: 20px;
  border-radius: 14px 14px 14px 14px;
  -webkit-border-radius: 14px 14px 14px 14px;
  -moz-border-radius: 14px 14px 14px 14px;
  background: #2b2a33;
}

.container {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
