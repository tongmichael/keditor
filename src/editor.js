import DecoupledEditorBase from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
// import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import CodeBlock from './plugins/codeblock-overwrite/codeblock';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
// import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
// import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
// import GFMDataProcessor from '@ckeditor/ckeditor5-markdown-gfm/src/gfmdataprocessor';
//
// // Simple plugin which loads the data processor.
// function Markdown(editor) {
//     editor.data.processor = new GFMDataProcessor();
// }
import MkdClip from './plugins/mkdclip';
import InsertFile from './plugins/insertfile';
import Attachment from './plugins/attachment';
import InsertMind from './plugins/insertmind';
import Mindmap from './plugins/mindmap';
import Exitgrammar from './plugins/exitgrammar';
import InsertMedia from './plugins/insertmedia';


export default class DecoupledEditor extends DecoupledEditorBase {
}

// Plugins to include in the build.
DecoupledEditor.builtinPlugins = [
    // Markdown,
    Essentials,
    Alignment,
    FontSize,
    FontFamily,
    Highlight,
    // UploadAdapter,
    Autoformat,
    Bold,
    Italic,
    Strikethrough,
    Code,
    CodeBlock,
    Underline,
    BlockQuote,
    // CKFinder,
    // EasyImage,
    Heading,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    Link,
    List,
    MediaEmbed,
    Paragraph,
    PasteFromOffice,
    Table,
    TableToolbar,
    MkdClip,
    InsertFile,
    Attachment,
    InsertMind,
    Mindmap,
    Exitgrammar,
    InsertMedia
];

// Editor configuration.
DecoupledEditor.defaultConfig = {
    toolbar: {
        items: [
            'heading',
            '|',
            'fontsize',
            'fontfamily',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'code',
            'codeBlock',
            'highlight',
            '|',
            'alignment',
            '|',
            'numberedList',
            'bulletedList',
            '|',
            'link',
            'blockquote',
            'imageUpload',
            'insertMedia',
            'InsertMind',
            'insertFile',
            'insertTable',
            // 'mediaEmbed',
            '|',
            'undo',
            'redo'
        ]
    },
    fontSize: {
        options: [
            12,
            13,
            'default',
            15,
            16,
            19,
            22,
            24,
            29,
            32,
            40,
            48
        ]
    },
    heading: {
        options: [
            { model: 'paragraph', title: '正文', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
        ]
    },
    image: {
        styles: [
            'full',
            'alignLeft',
            'alignRight'
        ],
        toolbar: [
            'imageStyle:alignLeft',
            'imageStyle:full',
            'imageStyle:alignRight',
            '|',
            'imageTextAlternative'
        ]
    },
    link: {
        addTargetToExternalLinks: true
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
        ]
    },
    codeBlock:{
        languages: [
            { language: 'plaintext', label: 'Plain text' }, // The default language.
            { language: 'c', label: 'C' },
            { language: 'cs', label: 'C#' },
            { language: 'cpp', label: 'C++' },
            { language: 'css', label: 'CSS' },
            { language: 'diff', label: 'Diff' },
            { language: 'xml', label: 'HTML/XML' },
            { language: 'java', label: 'Java' },
            { language: 'javascript', label: 'JavaScript' },
            { language: 'php', label: 'PHP' },
            { language: 'python', label: 'Python' },
            { language: 'ruby', label: 'Ruby' },
            { language: 'typescript', label: 'TypeScript' },
        ]
    },
    mediaEmbed: {
        extraProviders: [
            {
                name: 'kmsProvider',
                url: /\/file(\/\w+)+(\/\w+\.\w+|\?id\=\w+)/,// prvFileReg()
                html: match => {
                    return (   //prvFile()
                        '<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 100%;">' +
                        `<iframe src="${match[0]}" ` +
                        'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
                        'frameborder="0" allowtransparency="true" allow="autoplay; encrypted-media">' +
                        '</iframe>' +
                        '</div>'
                    );
                }
            }
        ]
    },
    // This value must be kept in sync with the language defined in webpack.config.js.
    language: 'zh-cn'
};
