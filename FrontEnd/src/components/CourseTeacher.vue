<script lang="ts">
import { defineComponent } from 'vue'
import TagsSection from './TagsSection.vue'
import ExercisesSection from './ExercisesSection.vue'

export default defineComponent({
    components: {
        TagsSection,
        ExercisesSection,
    },
    beforeMount() {
        //TEST AUTHORIZATION
    },
})
</script>

<template>
    <div>
        <TagsSection />
        <ExercisesSection />
    </div>
</template>
