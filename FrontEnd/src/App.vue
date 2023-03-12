<script lang="ts">
import { defineComponent } from "vue";
import { Alert } from "./models/alert";

export default defineComponent({
  data() {
    return {
      alerts: [] as Alert[],
    };
  },
  methods: {
    HandleNewAlert(alert: Alert) {
      this.alerts = [];
      this.alerts.push(alert);
    },
  },
});
</script>

<template>
  <div class="alertContainer">
    <template v-for="alert in alerts">
      <a-alert :message="alert.message" :type="alert.type" show-icon closable />
    </template>
  </div>

  <router-view @addAlert="HandleNewAlert" />
</template>

<style scoped>
.alertContainer {
  position: absolute;
  bottom: 10px;
  z-index: 1000;
  min-width: 200px;
  width: 20vw;
  right: 10px;
}
</style>
