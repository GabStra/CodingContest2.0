<script lang="ts">
import { EditorView } from "@codemirror/view";
import { defineComponent } from "vue";
import { Codemirror } from "vue-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
export default defineComponent({
  data() {
    return {
      editorView: EditorView,
    };
  },
  setup() {
    const extensions = [cpp(), oneDark];
    return {
      extensions,
    };
  },
});
</script>

<template>
  <codemirror
    v-model="code"
    :ref="editorView"
    :style="{ height: '400px' }"
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    @ready="handleReady"
  />
</template>
