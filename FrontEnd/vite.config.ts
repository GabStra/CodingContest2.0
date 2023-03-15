import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          "primary-color": "#02a80f",
          "font-size-base": "16px",
        },
        javascriptEnabled: true,
      },
      scss: {
        additionalData: `@import "@/main.scss";`,
      },
    },
  },
  resolve: {
    alias: [
      { find: /^~/, replacement: "" },
      { find: "@", replacement: path.resolve(__dirname, "src") },
    ],
  },
});
