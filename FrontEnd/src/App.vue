<script lang="ts">
import { defineComponent } from "vue";
import { Notification } from "./models/notification";
import { notification as popup } from "ant-design-vue";

export default defineComponent({
  methods: {
    HandleNewNotification(notification: Notification) {
      popup[notification.type]({
        message: notification.message,
        description: notification.description,
      });
    },
  },
});
</script>

<template>
  <router-view @newNotification="HandleNewNotification" />
</template>
