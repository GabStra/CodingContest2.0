<script lang="ts">
import { defineComponent } from "vue";
import LoginForm from "../components/LoginForm.vue";

export default defineComponent({
  components: {
    LoginForm,
  },
});
</script>
<template>
  <a-layout class="layout fill">
    <a-layout-content style="padding: 50px">
      <a-row class="fill" justify="center" align="middle">
        <a-col flex="350px"> <LoginForm /></a-col>
      </a-row>
    </a-layout-content>
    <a-layout-footer style="text-align: center"> Login </a-layout-footer>
  </a-layout>
</template>
