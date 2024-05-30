<template>
	<div>
		<ck-editor :value="model" :editor="editor" :config="editorConfig" disabled @input="onChange" @ready="onReady"></ck-editor>
        <div class="outline-box" :class="{'not-follow':!atTop}" v-if="hasOutline && outlines && outlines.length">
            <div v-for="(title,index) in outlines" :key="index"
                 :class="'outline_level_'+title.level+(title===stitle?' active':'')" @click="scrollTo(title.node)">
                {{title.name}}
            </div>
        </div>
        <div class="outline-box" :class="{'not-follow':!atTop}" v-else-if="hasOutline">
            <div class="outline_none">暂无大纲</div>
        </div>
	</div>
</template>

<script>
    import CKEditor from '@ckeditor/ckeditor5-vue';
    import DecoupledEditor from "./reader";
    import {mkTock} from "./transition";

    export default {
        name: 'app',
        components: {
            CkEditor: CKEditor.component
        },
        props:["markValue","hasOutline","topOffset"],
        data() {
            return {
                editor: DecoupledEditor,
                model: '',
                editorConfig: {},
                mkTock,
                outlines:[],
                ready:false,
                stitle:null,
                atTop:true
            };
        },
        watch:{
            markValue(n){
                if(this.ready){
                    this.setMarkdown(n || '');
                }
            }
        },
        methods: {
            setText(text){
                this.model = text;
			},
            setMarkdown(mkd){
                this.model = this.mkTock(mkd);
            },
            scrollTo(node){
                node.scrollIntoView(true);
            },
            onChange(value,ev,editor) {
                this.$emit("k-reader-change",value);
                if(!this.hasOutline){
                    return
                }
                let outlines=[];
                let titles=editor.sourceElement.children;
                for(let i=0;i<titles.length;i++){
                    if(titles[i] && ['H1','H2','H3','H4','H5','H6'].includes(titles[i].tagName || '')){
                        outlines.push({
                            node:titles[i],
                            name:titles[i].textContent,
                            level:parseInt(titles[i].tagName.replace("H",""))
                        });
                    }
                }
                this.outlines = outlines;
            },
            onReady(){
                this.ready=true;
                this.setMarkdown(this.markValue || '');
            },
            getOutLine(ev){
                let offset=(this.topOffset || 0)-10;
                for(let i=0;i<this.outlines.length;i++){
                    let node=this.outlines[i].node;
                    let next=this.outlines[i+1] && this.outlines[i+1].node;
                    if(ev.target.scrollTop>=node.offsetTop+offset
                        && (!next || ev.target.scrollTop<next.offsetTop+offset)){
                        this.stitle=this.outlines[i];
                        break;
                    }
                }
                if(ev.target.scrollTop>63){
                    this.atTop=false
                }else{
                    this.atTop=true;
                }
                //atTop为true时position基于.knowledge-right-detail,不然则基于body;
            }
        },
        mounted() {

        }
    }
</script>
