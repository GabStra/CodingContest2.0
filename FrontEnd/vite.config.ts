import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    css: {
        preprocessorOptions: {
            less: {
                modifyVars: {
                    'primary-color': '#4ebe31',
                    'font-size-base': '14px',
                    'border-radius-base': '0px',
                    'box-shadow-base': 'none',
                    'text-color': '#e1e1e1',
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
            { find: /^~/, replacement: '' },
            { find: '@', replacement: path.resolve(__dirname, 'src') },
        ],
    },
})
