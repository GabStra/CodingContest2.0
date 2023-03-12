<script lang="ts">
import { defineComponent } from "vue";
import LoginForm from "../components/LoginForm.vue";

enum MODE {
  LOGIN,
  REGISTRATION,
}

export default defineComponent({
  components: {
    LoginForm,
  },
  setup() {
    return {
      MODE,
    };
  },
  data() {
    return {
      currentMode: MODE.REGISTRATION,
    };
  },
});
</script>
<template>
  <div class="container">
    <div class="form">
      <Transition>
        <template v-if="currentMode === MODE.LOGIN">
          <LoginForm @addAlert="(alert) => $emit('addAlert', alert)" />
        </template>
      </Transition>

      <template v-if="currentMode === MODE.REGISTRATION">
        <a @click="() => (currentMode = MODE.LOGIN)">back</a>
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.form {
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
