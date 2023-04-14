<script lang="ts">
import { createVNode, defineComponent } from 'vue'
import { router, ROUTES, URL } from '../scripts/router'
import { CourseDTO } from 'shared/dto/courseDTO'

export default defineComponent({
    data() {
        return {
            courses: [] as CourseDTO[],
            isLoading: false,
            activeKey: null,
        }
    },
    methods: {
        loadMyCourses: async function () {},
    },
})
</script>

<template>
    <a-collapse v-model:activeKey="activeKey" accordion>
        <template v-for="(item, index) in courses">
            <a-collapse-panel :header="item.nome"> </a-collapse-panel>
        </template>
    </a-collapse>
</template>
