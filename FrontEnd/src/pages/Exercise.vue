<script lang="ts">
import { EditorView, lineNumbers } from "@codemirror/view";
import { defineComponent } from "vue";
import { Codemirror } from "vue-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";

import { CaretRightOutlined } from "@ant-design/icons-vue";
import { classname } from "@uiw/codemirror-extensions-classname";
import readOnlyRangesExtension from "codemirror-readonly-ranges";
import { CppRequest } from "shared/compiled_proto/cpp";
import { EditorState } from "@codemirror/state";

export default defineComponent({
  components: {
    Codemirror,
    CaretRightOutlined,
  },

  data() {
    return {
      code: "",
      editorView: null as EditorView | null,
      renderEditor: 0,
      topLimit: 0,
      bottomLimit: 0,
      isLoading: false,
      console: "",
      top: "",
      bottom: "",
      extensionsTop: [] as any[],
      extensions: [] as any[],
      extensionsBottom: [] as any[],
      isReady: false,
      refresh: 0,
    };
  },
  computed: {
    lineOffset() {
      return (
        this.code.split(/\r\n|\r|\n/).length +
        this.top.split(/\r\n|\r|\n/).length
      );
    },
  },
  methods: {
    handleReady(payload: any) {
      this.editorView = payload.view;
    },

    toggleRefresh() {
      this.refresh = Number(!this.refresh);
    },

    async loadScript() {
      let response = await this.axios.get(
        "http://localhost:60000/get-base-code"
      );
      this.code = response.data.start;
      this.top = response.data.top;
      this.bottom = response.data.bottom;
      this.topLimit =
        response.data.start.split(/\r\n|\r|\n/).length +
        response.data.top.split(/\r\n|\r|\n/).length;
    },

    async runCpp() {
      this.isLoading = true;
      try {
        let response = await this.axios.post("http://localhost:60000/run-cpp", {
          id: "pippo",
          code: this.code,
        } as CppRequest);

        this.console = response.data.stdout + "\n" + response.data.stderr;
      } finally {
        this.isLoading = false;
      }
    },

    async stopCpp() {
      let response = await this.axios.post("http://localhost:60000/stop-cpp", {
        id: "pippo",
      } as CppRequest);
    },
  },
  async beforeMount() {
    await this.loadScript();
    let getReadOnlyRanges = (
      targetState: EditorState
    ): Array<{ from: number | undefined; to: number | undefined }> => {
      return [
        {
          from: targetState.doc.line(0).from, //same as: targetState.doc.line(0).from or 0
          to: targetState.doc.line(targetState.doc.lines).to,
        },
      ];
    };

    let addLineReadOnly = classname({
      add: (lineNumber) => {
        return "lineReadOnly";
      },
    });

    this.extensionsTop = [
      oneDark,
      cpp(),
      readOnlyRangesExtension(getReadOnlyRanges),
      addLineReadOnly,
      lineNumbers({
        formatNumber: (n, s) => {
          return String(n).padStart(3, "0");
        },
      }),
    ];

    this.extensions = [
      oneDark,
      cpp(),
      lineNumbers({
        formatNumber: (n, s) => {
          return String(n + 4).padStart(3, "0");
        },
      }),
    ];

    this.extensionsBottom = [
      cpp(),
      oneDark,
      readOnlyRangesExtension(getReadOnlyRanges),
      addLineReadOnly,
      lineNumbers({
        formatNumber: (n, s) => {
          return String(n + this.lineOffset).padStart(3, "0");
        },
      }),
    ];

    this.isReady = true;
  },
});
</script>

<template>
  <div class="container" v-if="isReady">
    <div class="buttonContainer">
      <a-button
        type="primary"
        :style="{ width: '70px' }"
        @click="runCpp"
        :loading="isLoading"
      >
        <template #icon><CaretRightOutlined /></template>
      </a-button>
      <a-button
        type="primary"
        :style="{ width: '70px' }"
        danger
        @click="stopCpp"
      >
        <template #icon>
          <svg
            width="10"
            height="10"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <rect width="10" height="10" rx="1" ry="1" />
          </svg>
        </template>
      </a-button>
    </div>
    <div class="editor">
      <div class="editor_container">
        <div class="overlay_element"></div>
        <codemirror
          :modelValue="top"
          class="editor_element"
          :style="{ height: 'auto' }"
          :extensions="extensionsTop"
          :indent-with-tab="true"
          :tab-size="4"
          @change="(value) => (top = value)"
        />
      </div>

      <codemirror
        :modelValue="code"
        :style="{ height: 'auto' }"
        :extensions="extensions"
        :indent-with-tab="true"
        :tab-size="4"
        @change="
          (value) => {
            code = value;
            toggleRefresh();
          }
        "
      />
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
          @change="(value) => (bottom = value)"
        />
      </div>
    </div>
    <div class="console_container">
      <a-textarea readonly :value="console" class="console" :autoSize="false" />
    </div>
  </div>
</template>

<style scoped lang="scss">
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
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  gap: 1%;

  .buttonContainer {
    display: flex;
    align-items: center;
    gap: 10px;
    height: auto;
  }

  .editor {
    height: 80%;
    display: flex;
    flex-direction: column;
    overflow: scroll;
    background-color: #282c34;
  }
  .console_container {
    height: 20%;
    background-color: #282c34;
  }

  .console {
    background-color: #282c34;
    font-family: "Roboto";
    color: #fff;
    resize: "none";
    height: 100%;
  }

  .ant-input:focus {
    border-color: black !important;
  }

  .ant-input:hover {
    border-color: black !important;
  }
}
</style>
