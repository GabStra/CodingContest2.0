<script lang="ts">
import { defineComponent } from 'vue'
import { shadeColor } from '../utils/gradient'
export default defineComponent({
    props: {
        color: String,
    },
    computed: {
        lighterColor: function () {
            return shadeColor(this.color!, -60)
        },
    },
})
</script>
<template>
    <span
        :style="{
            color: color,
            borderColor: color,
            backgroundColor: lighterColor,
        }"
        class="tag">
        <slot></slot>
    </span>
</template>
<style scoped>
.tag {
    padding: 0.2em;
    border-width: 1px;
    border-style: solid;
}
</style>
