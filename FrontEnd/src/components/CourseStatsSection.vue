<script lang="ts">
import { defineComponent } from 'vue'
import { LEVEL, LEVEL_LABELS } from 'shared/constants/levels'
import { ENDPOINTS } from 'shared/constants/endpoints'
import { LoadingOutlined } from '@ant-design/icons-vue'
import { ExerciseTableRow } from 'shared/dto/exerciseTableRow'
import { getColorFromLevel } from '../utils/gradient'
import {
    fromTotalScoreToLevel,
    fromLevelToTotalScore,
} from 'shared/utils/mixed'
import LevelTag from './levelTag.vue'

export default defineComponent({
    components: {
        LoadingOutlined,
        LevelTag,
    },
    data() {
        return {
            exercises: [] as ExerciseTableRow[],
            totalScore: 0,
            isLoading: false,
        }
    },
    setup() {
        return {
            LEVEL,
            LEVEL_LABELS,
            getColorFromLevel,
            fromLevelToTotalScore,
        }
    },
    watch: {
        '$route.query.id'(to, from) {
            if (!to) return
            this.onLoadTotalScore()
        },
    },
    computed: {
        getLevel: function () {
            return fromTotalScoreToLevel(this.totalScore)
        },
    },
    methods: {
        onLoadTotalScore: async function () {
            this.isLoading = true
            await this.loadTotalScore()
            this.isLoading = false
        },
        loadTotalScore: async function () {
            let response = await this.$api.get<string>(
                ENDPOINTS.TOTAL_SCORE,
                { course: Number(this.$route.query.id) },
                true
            )
            if (response === null) return
            this.totalScore = Number(response.data)
        },
    },
    beforeMount: async function () {
        this.onLoadTotalScore()
    },
})
</script>
<template>
    <div style="margin-bottom: 10px">
        <template v-if="isLoading">
            <div class="center">
                <LoadingOutlined spin />
            </div>
        </template>
        <template v-else>
            <div class="space-between">
                <a-space>
                    <span>
                        <LevelTag :color="getColorFromLevel(getLevel)">
                            Livello {{ getLevel }}
                        </LevelTag>
                    </span>
                    <span> Punteggio: {{ totalScore }} </span>
                </a-space>
                <span>
                    -{{ fromLevelToTotalScore(getLevel + 1) - totalScore }}
                    punti al prossimo livello
                </span>
            </div>
        </template>
    </div>
</template>
