<script lang="ts">
import { defineComponent } from 'vue'
import { router, URL } from '../scripts/router'
export default defineComponent({
    setup() {
        return {
            URL,
        }
    },
})
</script>

<template>
    <a-result
        status="warning"
        title="Sito temporaneamente offline, ci scusiamo per il disagio.">
        <template #extra>
            <a-button
                type="primary"
                @click="() => $router.push({ path: URL.LOGIN })">
                Indietro
            </a-button>
        </template>
    </a-result>
</template>
