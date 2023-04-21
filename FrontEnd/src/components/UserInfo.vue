<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useSessionStore } from '../scripts/store'
import { UserOutlined } from '@ant-design/icons-vue'
export default defineComponent({
    components: {
        UserOutlined,
    },
    data() {
        return {
            showDefault: false,
        }
    },
    watch: {
        'sessionStore.userData.avatar': {
            handler: function (to, from) {
                console.log('avatar changed')
                this.$forceUpdate()
            },
            deep: true,
        },
    },
    computed: {
        ...mapStores(useSessionStore),
        imageUrl() {
            return new URL(
                `/src/assets/icons/${this.sessionStore.userData!.avatar}.svg`,
                import.meta.url
            ).href
        },
    },
})
</script>
<template>
    <div class="userInfo-container">
        <div class="userInfo-row">
            <template v-if="!showDefault">
                <img
                    :src="imageUrl"
                    style="width: 70px"
                    @error="showDefault = true" />
            </template>
            <template v-else>
                <a-avatar size="medium">
                    <template #icon><UserOutlined /></template>
                </a-avatar>
            </template>
            <div class="userInfo-column">
                <span
                    style="
                        max-width: 100px;
                        text-overflow: ellipsis;
                        overflow: hidden;
                    "
                    >{{ sessionStore.userData?.userName }}</span
                >
            </div>
        </div>
    </div>
</template>
<style scoped>
.userInfo-container {
    padding: 5px;
}
.userInfo-row {
    padding-left: 20px;
    display: flex;
    flex-direction: row;
    gap: 15px;
    justify-content: flex-start;
    align-items: center;
}
.userInfo-column {
    display: flex;
    justify-content: center;
    line-height: 24px !important;
    flex-direction: column;
}
</style>
