<script lang="ts">
import { defineComponent } from 'vue'
import { Course } from 'shared/dto/course'

export default defineComponent({
    data() {
        return {
            courses: [] as Course[],
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
