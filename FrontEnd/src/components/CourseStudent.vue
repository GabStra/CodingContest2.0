<script lang="ts">
import { defineComponent } from 'vue'
import { Exercise } from 'shared/dto/exercise'
import { LEVEL, LEVEL_LABELS } from 'shared/constants/levels'
import { ENDPOINTS } from 'shared/constants/endpoints'
import { LoadingOutlined } from '@ant-design/icons-vue'

import interpolate from 'color-interpolate'

export default defineComponent({
    components: {
        LoadingOutlined,
    },
    data() {
        return {
            exercises: [] as Exercise[],
            isLoading: false,
        }
    },
    setup() {
        const colorGradient = interpolate(['#41fc03', '#fcf003', '#fc0303'])
        return {
            LEVEL,
            LEVEL_LABELS,
            colorGradient,
        }
    },
    watch: {
        '$route.query.id'(to, from) {
            if (!to) return
            this.onLoadExercises()
        },
    },
    methods: {
        getColorFromLevel(level: LEVEL) {
            return this.colorGradient(level / 10)
        },
        onLoadExercises: async function () {
            this.isLoading = true
            await this.loadExercises()
            this.isLoading = false
        },
        loadExercises: async function () {
            let response = await this.$api.get<Exercise[]>(
                ENDPOINTS.EXERCISES_STUDENT,
                { course: Number(this.$route.query.id) },
                true
            )
            if (response === null) return
            this.exercises = response.data
        },
    },
    beforeMount() {
        this.onLoadExercises()
    },
})
</script>
<template></template>
<style scoped lang="less">
.page {
    padding: 20px;
    border: 1px solid #5e5e5e;
}
</style>
