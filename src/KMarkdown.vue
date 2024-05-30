<template>
	<div>
        <div class="top-title" v-if="hasTitle">
            <input v-model="title" @change="$emit('update:titleValue',title)" placeholder="请输入标题"/>
            <!--<div>{{title || '未命名'}}</div>-->
        </div>
        <mavon-editor ref="mke" v-model="model"
                      @save="$emit('mk-save')"
                      @imgAdd="uploadImg"
                      codeStyle="default"
                      :toolbars="toolbars"/>
	</div>
</template>

<script>
    import {ckTomk,mkTock} from "./transition";
    import {mapState} from "vuex";
    import mavonEditor from './markdown';
    import 'mavon-editor/dist/css/index.css';

    export default {
        name: 'app',
        components: {
            mavonEditor
        },
        props:["hasTitle","titleValue","upArea","imageAdapter"],
        data() {
            return {
                model: '',
                ckTomk,
                mkTock,
                title:'',
                toolbars:{
                    bold: true, // 粗体
                    italic: true, // 斜体
                    header: true, // 标题
                    underline: true, // 下划线
                    strikethrough: true, // 中划线
                    mark: true, // 标记
                    superscript: false, // 上角标
                    subscript: false, // 下角标
                    quote: true, // 引用
                    ol: true, // 有序列表
                    ul: true, // 无序列表
                    link: true, // 链接
                    imagelink: true, // 图片链接
                    code: true, // code
                    table: true, // 表格
                    fullscreen: false, // 全屏编辑
                    readmodel: false, // 沉浸式阅读
                    htmlcode: true, // 展示html源码
                    help: true, // 帮助
                    undo: true, // 上一步
                    redo: true, // 下一步
                    trash: true, // 清空
                    save: true, // 保存（触发events中的save事件）
                    navigation: true, // 导航目录
                    alignleft: true, // 左对齐
                    aligncenter: true, // 居中
                    alignright: true, // 右对齐
                    subfield: true, // 单双栏模式
                    preview: true, // 预览
                }
            };
        },
        watch:{
            titleValue(){
                this.title=this.titleValue;
            }
        },
		computed:{
            ...mapState([
                "routeData"
            ])
		},
        methods: {
            setText(text){
                this.model = this.ckTomk(text);
			},
            setMarkdown(mkd){
                this.model = mkd;
            },
			getText(){
                return this.mkTock(this.model);
			},
            getMarkdown(){
                return this.model;
            },
            insertAttachment(name){

            },
            removeAttachment(name){

            },
            async uploadImg(name,file){
                let path=await this.imageAdapter(file,this.upArea);
                if(path){
                    this.$refs.mke.$img2Url(name, path);
                }
            },
            onReady(editor) {

            },
            onChange(value,ev,editor) {

            }
        },
        mounted(){
            this.title=this.titleValue;
        }
    }
</script>
