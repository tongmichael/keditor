<template>
	<div ref="reader">
        <div></div>
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
    // import Prism from "prismjs";
    import hljs from "highlight.js";
    import 'highlight.js/styles/atom-one-light.css';

    export default {
        name: 'app',
        components: {
            CkEditor: CKEditor.component
        },
        props:["markValue","hasOutline","topOffset"],
        data() {
            return {
                value:'',
                mkTock,
                outlines:[],
                stitle:null,
                atTop:true
            };
        },
        watch:{
            markValue(n){
                this.setMarkdown(n || '');
            }
        },
        methods: {
            setText(text){
                if(this.value!==text){
                    this.value=text;
                    DecoupledEditor.create( '' )
                        .then( editor => {
                            editor.isReadOnly=true;
                            editor.setData(text);
                            let element=editor.ui.getEditableElement().cloneNode(true);
                            // Prism.highlightAllUnder(element);
                            element.querySelectorAll('pre code').forEach((block) => {
                                // hljs.highlightBlock(block);
                                let language=(block.className || '').match(/(^|\s)(language|lang)\-\S+($|\s)/);
                                language=language && language[0] || '';
                                language=language.replace(/\s?(language|lang)\-/,'').replace(/\s$/,'');
                                let code=(block.innerHTML || '')
                                    .replace(/\<\/?br[^\>]*\>/g,'\n')
                                    .replace( /&lt;/g, '<' )
                                    .replace( /&gt;/g, '>' )
                                    .replace( /&quot;/g, '"' )
                                    .replace( /&amp;/g, '&' );
                                block.innerHTML=hljs.highlight(language,code).value;
                            });
                            this.$refs.reader.replaceChild(element,this.$refs.reader.firstChild);
                            this.onChange(element);
                        } )
                        .catch( err => {
                            console.error( err.stack );
                        } );
                }
			},
            setMarkdown(mkd){
                this.setText(this.mkTock(mkd));
            },
            scrollTo(node){
                node.scrollIntoView(true);
            },
            onChange(element) {
                this.$emit("k-reader-change",this.value);
                if(!this.hasOutline){
                    return
                }
                try {
                    let outlines=[];
                    let titles=element.children;
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
                }catch (e) {
                    console.log(e);
                }
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
            this.setMarkdown(this.markValue || '');
        }
    }
</script>
