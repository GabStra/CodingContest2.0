<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>
<template>
    <div class="container">
        <div class="page">
            <router-view v-slot="{ Component }">
                <transition name="main-fade" mode="out-in">
                    <component
                        :is="Component"
                        @newPopup="(alert:any) =>
                    $emit('newPopup', alert)" />
                </transition>
            </router-view>
        </div>
    </div>
</template>

<style scoped>
.main-fade-enter-active,
.main-fade-leave-active {
    transition: opacity 0.5s ease;
}

.main-fade-enter-from,
.main-fade-leave-to {
    opacity: 0;
}

.page {
    padding: 20px;
    background: #121212;
    border: 1px solid #5e5e5e;
}

.container {
    width: 100%;
    height: 100%;
    min-height: 30%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
