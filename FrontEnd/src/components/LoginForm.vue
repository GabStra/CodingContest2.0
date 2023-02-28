<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>
<template>
  <a-form layout="vertical" name="normal_login" class="login-form">
    <a-form-item
      label="Username"
      name="username"
      :rules="[{ required: true, message: 'Please input your username!' }]"
    >
      <a-input>
        <template #prefix>
          <UserOutlined class="site-form-item-icon" />
        </template>
      </a-input>
    </a-form-item>

    <a-form-item
      label="Password"
      name="password"
      :rules="[{ required: true, message: 'Please input your password!' }]"
    >
      <a-input-password>
        <template #prefix>
          <LockOutlined class="site-form-item-icon" />
        </template>
      </a-input-password>
    </a-form-item>

    <a-form-item>
      <a-button type="primary" html-type="submit" class="login-form-button">
        Log in
      </a-button>
      <a :style="{ float: 'right' }" href="">Forgot password</a>
    </a-form-item>
    <a-divider />
    <a href="">register now!</a>
  </a-form>
</template>
