<script lang="ts">
import { defineComponent } from "vue";
import { Popup } from "./models/popup";
import { notification } from "ant-design-vue";
import { NotificationPlacement } from "ant-design-vue";
import { useSessionStore } from "./scripts/store";
import { mapWritableState } from "pinia";
export default defineComponent({
  methods: {
    HandleNewPopup(popup: Popup) {
      notification.destroy();
      notification[popup.type]({
        message: popup.message,
        description: popup.description,
        placement: "bottomRight",
      });
    },
  },
  computed: {
    ...mapWritableState(useSessionStore, ["popups"]),
  },
  watch: {
    popups: {
      handler() {
        if (this.popups.length === 0) return;
        let popup = this.popups.pop()!;
        this.HandleNewPopup(popup);
      },
      deep: true,
    },
  },
});
</script>

<template>
  <router-view @newPopup="HandleNewPopup" />
</template>
