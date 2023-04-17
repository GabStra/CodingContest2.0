<script lang="ts">
import { Tag } from "shared/dto/tag"
import { defineComponent } from "vue"
import { ENDPOINTS } from "shared/constants/endpoints"
import { LoadingOutlined } from "@ant-design/icons-vue"
import {
    parseValidationErrorsToMap,
    validate,
    VALIDATION_LANGUAGE,
} from "shared/utils/validator"
import { POPUP_TYPE } from "../models/popup"

export default defineComponent({
    components: {
        LoadingOutlined,
    },
    data() {
        return {
            tags: [] as Tag[],
            tagData: new Tag(),
            errors: new Map<string, string>(),
            isLoading: false,
            newTag: null as Tag | null,
        }
    },
    watch: {
        "$route.query.id"(to, from) {
            if (!to) return
            this.onLoadTags()
        },
    },
    methods: {
        onLoadTags: async function () {
            this.isLoading = true
            await this.loadTags()
            this.isLoading = false
        },
        loadTags: async function () {
            let response = await this.$api.get<Tag[]>(
                ENDPOINTS.TAGS,
                { course: Number(this.$route.query.id) },
                true
            )
            if (response === null) return
            this.tags = response.data
        },
        startEdit(tag: Tag) {
            if (this.newTag) this.cancelNewTag()
            this.tagData = new Tag(tag)
        },
        stopEdit() {
            if (this.newTag) this.cancelNewTag()
            this.tagData = new Tag()
        },
        addTag() {
            this.newTag = new Tag({ id: -1 })
            this.errors.clear()
            this.tagData = new Tag(this.newTag)
        },
        cancelNewTag() {
            this.newTag = null
        },
        saveTag: async function () {
            let errors = await validate(this.tagData, VALIDATION_LANGUAGE.IT)
            parseValidationErrorsToMap(this.errors, errors)
            if (errors.length !== 0) return
            let response = await this.$api.postWithParams<any, Tag>(
                ENDPOINTS.SAVE_TAG,
                this.tagData,
                { course: Number(this.$route.query.id) },
                true
            )
            if (response === null) return
            this.$emit("newPopup", {
                type: POPUP_TYPE.SUCCESS,
                message:
                    this.tagData.id === -1
                        ? "Categoria salvata"
                        : "Categoria modificata",
            })
            this.onLoadTags()
            if (this.tagData.id === -1) {
                this.cancelNewTag()
            } else {
                this.stopEdit()
            }
        },

        deleteTag: async function (id: number) {
            let response = await this.$api.delete<any>(
                ENDPOINTS.DELETE_TAG,
                { course: Number(this.$route.query.id), id: id },
                true
            )
            if (response === null) return
            this.$emit("newPopup", {
                type: POPUP_TYPE.SUCCESS,
                message: "Categoria eliminata",
            })
            this.onLoadTags()
        },
    },
    computed: {
        datasource() {
            let sortedTags = this.tags.sort(function (a, b) {
                return a.tag.localeCompare(b.tag)
            })

            return !!this.newTag ? [...sortedTags, this.newTag] : this.tags
        },
    },
    setup() {
        const columns = [
            {
                title: "Categoria",
                dataIndex: "tag",
                key: "tag",
                width: "auto",
                slots: { customRender: "tag" },
            },
            {
                title: "",
                key: "actions",
                dataIndex: "tags",
                width: "50px",
                slots: { customRender: "actions" },
            },
        ]
        return {
            URL,
            columns,
        }
    },
    beforeMount() {
        this.onLoadTags()
    },
})
</script>

<template>
    <div>
        <div class="center">
            <h2>
                <a-typography-text strong>Categorie</a-typography-text>
            </h2>
        </div>
        <a-divider />
        <div v-show="isLoading">
            <div class="center">
                <LoadingOutlined spin />
            </div>
        </div>
        <div class="fill" v-if="!isLoading">
            <a-table :columns="columns" :data-source="datasource">
                <template #title>
                    <a-button @click="addTag"> Aggiungi </a-button></template
                >
                <template #tag="{ record }">
                    <template v-if="record.id === tagData.id">
                        <a-form-item
                            label="Nome Categoria"
                            name="tag"
                            :validateStatus="
                                errors.has("tag") ? "error" : undefined
                            "
                            :help="errors.get("tag")">
                            <a-input v-model:value="tagData.tag" />
                        </a-form-item>
                    </template>
                    <template v-else>
                        {{ record.tag }}
                    </template>
                </template>
                <template #actions="{ record }">
                    <div class="center">
                        <a-space>
                            <template v-if="record.id === tagData.id">
                                <a-popconfirm
                                    placement="left"
                                    :title="
                                        record.id === -1
                                            ? "Sicuro di voler salvare la categoria?"
                                            : `Sicuro di voler confermare le modifiche?`
                                    "
                                    @confirm="saveTag">
                                    <a>Salva</a>
                                </a-popconfirm>
                                <a-divider type="vertical" />
                                <a @click="stopEdit">Annulla</a>
                            </template>
                            <template v-else>
                                <a @click="startEdit(record)">Modifica</a>
                                <a-divider type="vertical" />
                                <a-popconfirm
                                    placement="left"
                                    :title="`Sicuro di voler cancellare ${record.nome}?`"
                                    @confirm="deleteTag(record.id)">
                                    <a>Cancella</a>
                                </a-popconfirm>
                            </template>
                        </a-space>
                    </div>
                </template>
            </a-table>
        </div>
    </div>
</template>
