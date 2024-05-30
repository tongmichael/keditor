<template>
    <div :class="{'no-title':!hasTitle}">
        <div class="top-title" v-if="hasTitle">
            <input v-model="title" @change="$emit('update:titleValue',title)" placeholder="请输入标题"/>
        </div>
        <ck-editor :editor="editor" :config="editorConfig" @ready="onReady" @input="onChange"></ck-editor>
    </div>
</template>

<script>
import CKEditor from '@ckeditor/ckeditor5-vue';
import DecoupledEditor from "./editor";
import {ckTomk, mkTock} from "./transition";
import {mapState} from "vuex";
import EventHub from "./event";

export default {
    name: 'app',
    components: {
        CkEditor: CKEditor.component
    },
    props: ["hasTitle", "titleValue", "upArea", "imageAdapter", "mediaAdapter"],
    data() {
        return {
            editor: DecoupledEditor,
            text: '',
            editorConfig: {},
            ckTomk,
            mkTock,
            attachments: {},
            title: '',
            editorItem: {},
            initData: ''
        };
    },
    watch: {
        titleValue() {
            this.title = this.titleValue;
        },
        // attachments:{
        //     handler(newValue, oldValue) {
        //         let files=[];
        //         for(let id in newValue){
        //             if(newValue[id]){
        //                 files.push(newValue[id])
        // 			}
        // 		}
        //         this.$emit("attachment-change",files);
        //     },
        //     deep: true
        // }
    },
    computed: {
        ...mapState([
            "routeData"
        ])
    },
    methods: {
        setText(text) {
            if (this.editorItem.setData) {
                this.editorItem.setData(text);
            } else {
                this.initData = text;
            }
            this.text = text;
        },
        setMarkdown(mkd) {
            this.setText(this.mkTock(mkd));
        },
        getText() {
            return this.text;
        },
        getMarkdown() {
            return this.ckTomk(this.text);
        },
        insertMedia(url) {
            this.editorItem.execute('mediaEmbed', url);
        },
        insertAttachment(name) {
            this.editorItem.execute('attachment', {value: name});
        },
        removeAttachment(name) {
            this.editorItem.execute('attachdelete', {value: name});
        },
        deleteAttach(id) {
            let attachs = this.text.match(/\<a[^\>]+\>[^\<]*\<\/a>/g);
            for (let i = 0; i < attachs.length; i++) {
                if (attachs[i].includes('rest/contact/file/' + id)) {
                    this.setText(this.text.replace(attachs[i], ''));
                }
            }
        },
        onReady(editor) {
            // Insert the toolbar before the editable area.
            editor.ui.getEditableElement()
                .parentElement
                .insertBefore(
                    editor.ui.view.toolbar.element,
                    editor.ui.getEditableElement()
                );
            if (this.imageAdapter) {
                editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
                    return new this.imageAdapter(loader, this.upArea);
                };
            }
            this.$emit("editor-ready", editor);
            this.editorItem = editor;
            if (this.initData) {
                this.setText(this.initData);
                this.initData = '';
            }
        },
        onChange(value, ev, editor) {
            this.text = value;
            // let links=editor.sourceElement.getElementsByTagName("a");
            // let ids=[];
            // for(let i=0;i<links.length;i++){
            //     if(links[i] && links[i].href
            //         && links[i].href.includes('rest/contact/file/')){
            //         let urls=links[i].href.split('rest/contact/file/');
            //         let id=urls[urls.length-1];
            //         if(this.attachments[id]){
            //             this.attachments[id].name=links[i].innerText;
            //         }else{
            //             this.$set(this.attachments,id,{id,name:links[i].innerText});
            //         }
            //         ids.push(id)
            //     }
            // }
            // for(let id in this.attachments){
            // 	if(!ids.includes(id)){
            //         this.attachments[id]=null;
            // 	}
            // }
        },
        async changeMedias(ev) {
            // this.$emit("editor-media", ev)
            try{
                let url=await this.mediaAdapter(ev, this.upArea);
                this.insertMedia(url);
            }catch (e) {
                console.log(e);
            }
        },
        changeFiles(ev) {
            this.$emit("editor-attach", ev)
        },
        toPreAttach(ev) {
            this.$emit("to-preview-attachment", ev)
        },
        toDownAttach(ev) {
            this.$emit("to-download-attachment", ev)
        },
        pressEnter(ev){
            if(ev.ctrlKey){
                if(ev.key==="s" || ev.keyCode===83){
                    ev.preventDefault();
                    this.$emit("ck-save");
                }
            }
        }
    },
    mounted() {
        this.title = this.titleValue;
        EventHub.$on("editor-media", this.changeMedias);
        EventHub.$on("editor-attach", this.changeFiles);
        EventHub.$on("to-preview-attachment", this.toPreAttach);
        EventHub.$on("to-download-attachment", this.toDownAttach);
        document.addEventListener("keydown",this.pressEnter);
    },
    beforeDestroy() {
        EventHub.$off("editor-media", this.changeMedias);
        EventHub.$off("editor-attach", this.changeFiles);
        EventHub.$off("to-preview-attachment", this.toPreAttach);
        EventHub.$off("to-download-attachment", this.toDownAttach);
        document.removeEventListener("keydown",this.pressEnter);
    }
}
</script>
