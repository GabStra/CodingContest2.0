<script lang="ts">
import { EditorView, lineNumbers } from '@codemirror/view'
import { defineComponent } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { cpp } from '@codemirror/lang-cpp'
import { oneDark } from '@codemirror/theme-one-dark'
import {
    CaretRightOutlined,
    ClearOutlined,
    StopOutlined,
} from '@ant-design/icons-vue'
import { classname } from '@uiw/codemirror-extensions-classname'
import readOnlyRangesExtension from 'codemirror-readonly-ranges'
import { CppRequest } from 'shared/dist/compiled_proto/cpp'
import { EditorState } from '@codemirror/state'
import { ENDPOINTS } from 'shared/dist/constants/endpoints'
import { RemoteExecutionRequest } from 'shared/dist/dto/remoteExecutionRequest'
import { RemoteExecutionResult } from 'shared/dist/dto/remoteExecutionResult'
import { RemoteExecutionBase } from 'shared/dist/dto/remoteExecutionBase'

export default defineComponent({
    components: {
        Codemirror,
        CaretRightOutlined,
        ClearOutlined,
        StopOutlined,
    },

    data() {
        return {
            code: '',
            editorView: null as EditorView | null,
            renderEditor: 0,
            topLimit: 0,
            bottomLimit: 0,
            isLoading: false,
            console: '',
            top: '',
            bottom: '',
            extensionsTop: [] as any[],
            extensions: [] as any[],
            extensionsBottom: [] as any[],
            isReady: false,
            refresh: 0,
            remoteExecutionBase: null as RemoteExecutionBase | null,
            stdout: '',
            stderr: '',
            activeTab: 1,
            results: [] as boolean[],
        }
    },
    computed: {
        lineOffset() {
            return (
                this.code.split(/\r\n|\r|\n/).length +
                this.top.split(/\r\n|\r|\n/).length
            )
        },
        title() {
            return this.$route.query.titoloEsercizio
        },
    },
    watch: {
        stderr: function (value) {
            if (this.stderr) this.activeTab = 2
        },
        stdout: function (value) {
            if (this.stdout && !this.stderr) this.activeTab = 1
        },
    },
    methods: {
        handleReady(payload: any) {
            this.editorView = payload.view
        },
        toggleRefresh() {
            this.refresh = Number(!this.refresh)
        },
        reset() {
            this.code = this.remoteExecutionBase!.start
            this.top = this.remoteExecutionBase!.top
            this.bottom = this.remoteExecutionBase!.bottom
            this.stdout = ''
            this.stderr = ''
            this.activeTab = 1
        },
        async loadScript() {
            let response = await this.$api.get<RemoteExecutionBase>(
                ENDPOINTS.REMOTE_EXECUTION_DATA,
                null,
                true
            )
            if (response === null) return

            this.remoteExecutionBase = response.data
            this.code = response.data.start
            this.top = response.data.top
            this.bottom = response.data.bottom
            this.topLimit =
                response.data.start.split(/\r\n|\r|\n/).length +
                response.data.top.split(/\r\n|\r|\n/).length
        },
        async runCpp() {
            this.isLoading = true
            try {
                let response = await this.$api.postWithParams<
                    RemoteExecutionResult,
                    RemoteExecutionRequest
                >(
                    ENDPOINTS.EXERCISE_RUN,
                    { code: this.code },
                    {
                        course: Number(this.$route.query.idCorso),
                        title: this.$route.query.titoloEsercizio,
                    },
                    true
                )
                if (response === null) return
                this.stderr = response.data.stderr
                this.stdout = response.data.stdout
                this.results = response.data.results
            } finally {
                this.isLoading = false
            }
        },
        async stopCpp() {
            let response = await this.axios.post(
                'http://localhost:60000/stop-cpp',
                {
                    id: 'pippo',
                } as CppRequest
            )
        },
    },
    async beforeMount() {
        await this.loadScript()
        let getReadOnlyRanges = (
            targetState: EditorState
        ): Array<{ from: number | undefined; to: number | undefined }> => {
            return [
                {
                    from: targetState.doc.line(0).from, //same as: targetState.doc.line(0).from or 0
                    to: targetState.doc.line(targetState.doc.lines).to,
                },
            ]
        }

        let addLineReadOnly = classname({
            add: (lineNumber) => {
                return 'lineReadOnly'
            },
        })

        this.extensionsTop = [
            oneDark,
            cpp(),
            readOnlyRangesExtension(getReadOnlyRanges),
            addLineReadOnly,
            lineNumbers({
                formatNumber: (n, s) => {
                    return String(n).padStart(4, '0')
                },
            }),
        ]

        this.extensions = [
            oneDark,
            cpp(),
            lineNumbers({
                formatNumber: (n, s) => {
                    return String(n + 4).padStart(4, '0')
                },
            }),
        ]

        this.extensionsBottom = [
            cpp(),
            oneDark,
            readOnlyRangesExtension(getReadOnlyRanges),
            addLineReadOnly,
            lineNumbers({
                formatNumber: (n, s) => {
                    return String(n + this.lineOffset).padStart(4, '0')
                },
            }),
        ]

        this.isReady = true
    },
})
</script>

<template>
    <a-layout
        v-if="isReady"
        :style="{ background: 'transparent', 'max-height': '850px' }">
        <a-layout-header style="padding: 0 10px">
            <div class="space-between">
                <a-space>
                    <a-button
                        a-button
                        type="primary"
                        ghost
                        :style="{ width: '70px' }"
                        @click="runCpp"
                        :loading="isLoading">
                        <CaretRightOutlined />
                    </a-button>
                    <a-button
                        :style="{ width: '70px' }"
                        danger
                        @click="stopCpp">
                        <StopOutlined />
                    </a-button>
                    <a-popconfirm
                        placement="left"
                        :title="`Sicuro di voler procedere al reset?`"
                        @confirm="reset()">
                        <a-button :style="{ width: '70px' }">
                            <ClearOutlined />
                        </a-button>
                    </a-popconfirm>
                </a-space>
                <div
                    v-show="results && results.length > 0"
                    style="width: 100px">
                    <a-progress
                        stroke-linecap="square"
                        :percent="results.filter((x) => x).length" />
                </div>
            </div>
        </a-layout-header>
        <a-layout-content style="overflow: scroll">
            <div class="editor_container">
                <div class="overlay_element"></div>
                <codemirror
                    :modelValue="top"
                    class="editor_element"
                    :style="{ height: 'auto' }"
                    :extensions="extensionsTop"
                    :indent-with-tab="true"
                    :tab-size="4"
                    @change="(value) => (top = value)" />
            </div>
            <codemirror
                class="code-mirror-editor"
                :modelValue="code"
                :style="{ height: 'auto' }"
                :extensions="extensions"
                :indent-with-tab="true"
                :tab-size="4"
                @change="
                    (value) => {
                        code = value
                        toggleRefresh()
                    }
                " />
            <div class="editor_container">
                <div class="overlay_element"></div>
                <codemirror
                    :modelValue="bottom"
                    class="editor_element"
                    :style="{ height: 'auto' }"
                    :key="refresh"
                    :extensions="extensionsBottom"
                    :indent-with-tab="true"
                    :tab-size="4"
                    @change="(value) => (bottom = value)" />
            </div>
        </a-layout-content>
        <a-layout-footer style="padding: 24px 0px; background: transparent">
            <div class="container">
                <div class="console_container">
                    <a-tabs
                        v-model:activeKey="activeTab"
                        style="height: 100%"
                        type="card">
                        <a-tab-pane :key="1" force-render>
                            <template #tab>
                                Output
                                <a-badge :dot="!!stdout" />
                            </template>
                            <a-textarea
                                readonly
                                :value="stdout"
                                class="console"
                                :autoSize="false" />
                        </a-tab-pane>
                        <a-tab-pane :key="2">
                            <template #tab>
                                Errori
                                <a-badge :dot="!!stderr" />
                            </template>
                            <a-textarea
                                readonly
                                :value="stderr"
                                :style="{ color: 'red' }"
                                class="console"
                                :autoSize="false" />
                        </a-tab-pane>
                    </a-tabs>
                </div>
            </div>
        </a-layout-footer>
    </a-layout>
</template>

<style lang="scss">
.editor_container {
    position: relative;
    height: auto;
}
.overlay_element {
    background: gray;
    opacity: 0.5;
    width: 100%;
    height: 100%;
    z-index: 500;
    position: absolute;
    top: 0;
    right: 0;
}

.editor_element {
    position: absolute;
    top: 0;
    right: 0;
}

.console_container {
    height: 250px;
}

.console {
    background-color: #282c34;
    font-family: 'DroidSans';
    color: #fff;
    resize: 'none';
    height: 100% !important;
    resize: none;
    overflow: scroll;
}
</style>
