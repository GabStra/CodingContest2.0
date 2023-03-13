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
            @addAlert="(alert:any) => $emit('addAlert', alert)"
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
  width: 300px;
}

.container {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
