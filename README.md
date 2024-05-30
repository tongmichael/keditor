# 知识空间文本编辑器

知识空间文本编辑器

### KEditor 普通编辑组件
```
<k-editor ref="editItem"  
    class="editor-plugin-style k-bottom-edit" 
    :has-title="true" 
    :title-value.sync="title"
    @editor-ready="switchThen" 
    @editor-attach="changeFiles"
    @to-preview-attachment="previewFromEditor" 
    @to-download-attachment="downloadFromEditor"
    @ck-save="save"
    :image-adapter="imageAdapter"
    :up-area="params" 
    :media-adapter="uploadMedia"></k-editor>
   	
```

editor-plugin-style 为知识管理的默认样式，可以另写

k-bottom-edit 为知识管理的编辑页面样式，可以另写

editor-ready为编辑器初始化完成事件，在此事件后设置初始值
```this.$refs.editItem.setMarkdown(string_value)```

给编辑器设值可使用(setText为编辑器原始格式数据类似html,setMarkdown为通过turndown转换的数据)                 
```this.$refs.editItem.setText()```
```this.$refs.editItem.setMarkdown()```
获取当前内容可使用(getText为编辑器原始格式数据类似html,getMarkdown为通过turndown转换的数据)                 
```this.$refs.editItem.getText()```
```this.$refs.editItem.getMarkdown()```

editor-attach为编辑器选择附件事件，会返回一个File参数，上传File后可将附件名称插入段落
```this.$refs.editItem.insertAttachment(fileName);```

删除附件名称用
```this.$refs.editItem.removeAttachment(fileName);```

to-preview-attachment和to-download-attachment为点击附件气泡弹窗里的预览和下载按钮事件，请在外部自行实现


**上传接口需后台提供，以下上传接口只是个例子**

image-adapter和up-area用于实现图片上传，up-area为上传需要的参数,image-adapter请在外部定义一个adapter传入组件
```
import { SucMessage } from '@suc/ui';
import axios from 'axios';
import {upFile} from "./api"; //当前项目的接口，可自行修改

export default class EditorUploadAdapter {
    loader:any;
    uploadArea:string;

    constructor( loader:any,uploadArea:any ) {
        this.loader = loader;
        
        //uploadArea为上传参数，根据接口需要自行处理
        
        let area=``;
        if(uploadArea.type==='notice'){
            area=`/kms/space/${uploadArea.spaceBm || '0'}/notice/pic`
        }else{
            area=`/kms/space/${uploadArea.spaceBm || '0'}/base/${uploadArea.baseBm || '0'}/doc/${uploadArea.docBm || '0'}/pic`
        }
        this.uploadArea = area;
    }

    async upload() { //编辑器选择图片后自动会调取此方法，内部上传接口与参数可根据实际更改，注意Promise返回结果为{default:imgSrc,url:imgSrc}格式
        const data = new FormData();
        data.append('alias', "");
        data.append('area', this.uploadArea);
        data.append('file', await this.loader.file);  //this.loader.file为编辑器选择图片后自动返回
        data.append('remark', "");

        return new Promise((resolve, reject) => {
            axios({
                url: upFile(),
                method: 'post',
                data,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }).then((res:any) => {
                let resData={
                    default:res.data.path,
                    url:res.data.path
                };
                resolve(resData);
            }).catch((error:any) => {
                SucMessage.error('图片上传失败！');
            });
        });
    }
}

```

```
import EditorUploadAdapter from "@suc/kms-component/src/util/adapter";
...
imageAdapter:any=EditorUploadAdapter;

```

media-adapter用于实现播放媒体（如视频）上传,可直接传入一个函数，参数为File类型，返回为Promise类型并resolve视频地址

```
    uploadMedia(file:File){
        let loading = SucMessage.loading({
            content: '正在上传',
            duration: 0
        });
        let form=new FormData();
        form.append("alias","");
        form.append("area","/kms/space/media");
        form.append("file",file);
        form.append("remark","");
        //form为接口参数，实际格式与后台对接
        return new Promise((resolve, reject) => {
            this.$http({
                url: upFile(),//接口地址与后台对接
                method: "post",
                data: form
            }).then(({data})=>{
                loading();
                resolve(data.path); //返回Promise 需resolve上传后返回的视频地址
                SucMessage.success('上传成功！');
            }).catch(e=>{
                loading();
                reject();
                console.log(e);
                SucMessage.error('上传失败！');
            });
        });
    }
```

### KMarkdown markdown编辑器
```

<k-markdown ref="editItem" 
    class="markdown-plugin-style mk-bottom-edit" 
    :has-title="true"
    :title-value.sync="title" 
    :image-adapter="mkImageAdapter"
    :up-area="params"
    @mk-save="saveDraft(true)"></k-markdown>
    
```

与keditor不同的是image-adapter需要传一个函数而不是class,注意直接返回imgSrc
```
import { SucMessage } from '@suc/ui';
import axios from 'axios';
import {upFile} from "./api";

export async function mkImageUpload(file:File,uploadArea:any) {
    try{
        let area=``;
        if(uploadArea.type==='notice'){
            area=`/kms/space/${uploadArea.spaceBm || '0'}/notice/pic`
        }else{
            area=`/kms/space/${uploadArea.spaceBm || '0'}/base/${uploadArea.baseBm || '0'}/doc/${uploadArea.docBm || '0'}/pic`
        }
        const data = new FormData();
        data.append('alias', "");
        data.append('area', area);
        data.append('file', file);
        data.append('remark', "");
        let res=await axios({
            url: upFile(),
            method: 'post',
            data,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return res.data.path
    }catch (e) {
        SucMessage.error('图片上传失败！');
        console.log(e);
        return "";
    }
}
```

mk-save为markdown编辑器的保存按钮点击事件，keditor没有保存按钮如需要自己另加


### KReader 只显示不编辑
```
    <k-reader ref="docItem" 
        class="editor-plugin-style k-inset-doc" 
        :mark-value="item.articleContent"></k-reader>
```


### 思维导图
可在router里配置
```$xslt

        {
            name: 'kms-mindmap',
            path: '/mindmap/view/:frameId/:mapData?',
            component: () => import('@suc/keditor/src/Mindmap.vue')
        },
        {
            name: 'kms-mindmap-edit',
            path: '/mindmap/edit/:frameId/:mapData?',
            component: () => import('@suc/keditor/src/Mindmap.vue')
        },
```
或从https://cowork.sucsoft.com:3443/kms/kms-mindmap.git下载，部一个独立服务，并在项目里配置window.mindPreUrl

### 相关webpack配置
```
const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin');
const {styles} = require('@ckeditor/ckeditor5-dev-utils');

module.exports = {
    transpileDependencies: [
        /ckeditor5-[^/\\]+[/\\]src[/\\](?!lib).+\.js$/,
    ],
    chainWebpack: config => {
        const svgRule = config.module.rule('svg');
        // ./node_modules根据实际路径修改
        svgRule.exclude.add(path.join(__dirname, './node_modules', '@ckeditor'));
        config.module
            .rule('cke-svg')
            .test(/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/)
            .use('raw-loader')
            .loader('raw-loader');
        config.module
            .rule('cke-css')
            .test(/ckeditor5-[^/\\]+[/\\].+\.css$/)
            .use('postcss-loader')
            .loader('postcss-loader')
            .tap(() => {
                return styles.getPostCssConfig({
                    themeImporter: {
                        themePath: require.resolve('@ckeditor/ckeditor5-theme-lark'),
                    },
                    minify: true
                });
            });
    },
    configureWebpack: {
        plugins: [
            new CKEditorWebpackPlugin({
                language: 'zh-cn',
                additionalLanguages: 'all',
            })
        ]
    },
};

```








