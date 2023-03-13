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
      setTimeout(() => {}, 10000);
    },
  },
});
</script>

<template>
  <div class="alertContainer">
    <template v-for="alert in alerts">
      <a-alert :message="alert.message" :type="alert.type" show-icon />
    </template>
  </div>

  <router-view @addAlert="HandleNewAlert" />
</template>

<style scoped>
.ant-alert {
  font-size: 20px;
}
.alertContainer {
  position: absolute;
  z-index: 1000;
  width: 300px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  bottom: 20px;
}
</style>
