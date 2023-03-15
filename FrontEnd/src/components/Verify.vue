<script lang="ts">
import { defineComponent } from "vue";
import { NOTIFICATION_TYPE } from "../models/notification";
import { VerifyDTO, VERIFY_STATUS } from "shared/dto/verifyDTO";
import { router, URL } from "../scripts/router";
import { LoadingOutlined } from "@ant-design/icons-vue";

export default defineComponent({
  emit: ["onSuccess", "onError"],
  components: {
    LoadingOutlined,
  },
  data() {
    return {
      verifyData: new VerifyDTO(),
      status: null as VERIFY_STATUS | null,
      token: null as string | null,
      isLoading: false,
    };
  },
  setup() {
    return {
      VERIFY_STATUS,
    };
  },
  methods: {
    checkLink: async function () {
      try {
        this.isLoading = true;
        let response = await this.$api.verify(this.verifyData);
        this.status = response.status;
        setTimeout(() => {
          router.push({ path: URL.LOGIN });
        }, 10000);
      } catch {
        this.$emit("newNotification", {
          type: NOTIFICATION_TYPE.ERROR,
          message: "Richiesta fallita",
        });
        router.push({ path: URL.LOGIN });
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    this.verifyData.token = this.$route.query.token as string;
    if (!this.verifyData.token) router.push({ path: URL.HOME });
    this.checkLink();
  },
});
</script>
<template>
  <div>
    <div v-show="isLoading">
      <LoadingOutlined spin />
    </div>
    <div v-show="!isLoading">
      <template v-if="status === VERIFY_STATUS.SUCCESS">
        <a-alert
          message="Verifica riuscita"
          description="La schermata di login si caricherà automaticamente."
          type="success"
          show-icon
        />
      </template>
      <template v-if="status === VERIFY_STATUS.FAIL">
        <a-alert
          message="Verifica fallita"
          description="Il link potrebbe essere scaduto o errato."
          type="error"
          show-icon
        />
      </template>
    </div>
  </div>
</template>
