<template>
	<div>
		<ck-editor :editor="editor" :config="editorConfig" @ready="onReady" @input="onChange"></ck-editor>
	</div>
</template>

<script>
    import CKEditor from '@ckeditor/ckeditor5-vue';
    import ClassicEditor from "./comment";
    import {ckTomk,mkTock} from "./transition";
    import {mapState} from "vuex";

    export default {
        name: 'app',
        components: {
            CkEditor: CKEditor.component
        },
        props:["upArea","imageAdapter"],
        data() {
            return {
                editor: ClassicEditor,
                text:'',
                editorConfig: {},
                ckTomk,
                mkTock,
				// attachments:{},
                editorItem:{},
                initData:''
            };
        },
        // watch:{
        //     attachments:{
        //         handler(newValue, oldValue) {
        //             let files=[];
        //             for(let id in newValue){
        //                 if(newValue[id]){
        //                     files.push(newValue[id])
		// 				}
		// 			}
        //             this.$emit("attachment-change",files);
        //         },
        //         deep: true
        //     }
        // },
        computed:{
            ...mapState([
                "routeData"
            ])
        },
        methods: {
            setText(text){
                if(this.editorItem.setData){
                    this.editorItem.setData(text);
				}else{
                    this.initData=text;
				}
                this.text = text;
			},
            setMarkdown(mkd){
                this.setText(this.mkTock(mkd));
            },
			getText(){
                return this.text;
			},
            getMarkdown(){
                return this.ckTomk(this.text);
            },
            // deleteAttach(id){
            //     let attachs=this.text.match(/\<a[^\>]+\>[^\<]*\<\/a>/g);
            //     for(let i=0;i<attachs.length;i++){
            //         if(attachs[i].includes('rest/contact/file/'+id)){
            //             this.setText(this.text.replace(attachs[i],''));
			// 		}
			// 	}
			// },
            onReady(editor) {
                editor.ui.getEditableElement()
                    .parentElement
                    .appendChild(
                        editor.ui.view.toolbar.element
                    );
                if(this.imageAdapter){
                    editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
                        return new this.imageAdapter( loader,this.upArea);
                    };
                }
                this.$emit("editor-ready",editor);
                this.editorItem=editor;
                if(this.initData){
                    this.setText(this.initData);
                    this.initData='';
                }
            },
            onChange(value,ev,editor) {
                this.text=value;
                this.$emit("editor-input",value);
            //     let links=editor.sourceElement.getElementsByTagName("a");
            //     let ids=[];
            //     for(let i=0;i<links.length;i++){
            //         if(links[i] && links[i].href
            //             && links[i].href.includes('rest/contact/file/')){
            //             let urls=links[i].href.split('rest/contact/file/');
            //             let id=urls[urls.length-1];
            //             if(this.attachments[id]){
            //                 this.attachments[id].name=links[i].innerText;
            //             }else{
            //                 this.$set(this.attachments,id,{id,name:links[i].innerText});
            //             }
            //             ids.push(id)
            //         }
			// 	}
			// 	for(let id in this.attachments){
			// 		if(!ids.includes(id)){
            //             this.attachments[id]=null;
			// 		}
			// 	}
            }
        }
    }
</script>
