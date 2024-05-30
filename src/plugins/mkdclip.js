import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import {mkTock} from "../transition";
import { Modal } from "iview";

const maxlen = 10000;

function normalizeClipboardData( data ) {
    return data
        .replace( /<span(?: class="Apple-converted-space"|)>(\s+)<\/span>/g, ( fullMatch, spaces ) => {
            // Handle the most popular and problematic case when even a single space becomes an nbsp;.
            // Decode those to normal spaces. Read more in https://github.com/ckeditor/ckeditor5-clipboard/issues/2.
            if ( spaces.length == 1 ) {
                return ' ';
            }

            return spaces;
        } );
}

function plainTextToHtml( text ) {
    text = text
    // Encode <>.
        .replace( /</g, '&lt;' )
        .replace( />/g, '&gt;' )
        // Creates paragraphs for every line breaks.
        .replace( /\n/g, '</p><p>' )
        // Preserve trailing spaces (only the first and last one – the rest is handled below).
        .replace( /^\s/, '&nbsp;' )
        .replace( /\s$/, '&nbsp;' )
        // Preserve other subsequent spaces now.
        .replace( /\s\s/g, ' &nbsp;' );

    if ( text.indexOf( '</p><p>' ) > -1 ) {
        // If we created paragraphs above, add the trailing ones.
        text = `<p>${ text }</p>`;
    }

    // TODO:
    // * What about '\nfoo' vs ' foo'?

    return text;
}

function cutTooLong(text,len) {
    let part=text.slice(len);
    part=part.split('\n');
    if(part.length>1){
        part=part[0];
    }else{
        part='';
    }
    return text.slice(0,len)+part+'\n\n';
}

export default class MkdClip extends Plugin {
    init() {
        const editor = this.editor;
        this._htmlDataProcessor = new HtmlDataProcessor();

        editor.editing.view.document.on('clipboardInput', ( evt, data ) => {
            const dataTransfer = data.dataTransfer;
            let text=dataTransfer.getData( 'text/plain' ) || '';//dataTransfer.getData( 'text/html' ) ||
            if(text && text.match(/(\#{1,6}\s)|(\*{1,3}[^\*]+\*{1,3})|(\~{2}[^\~]+\~{2})|(\[[^\[\]]*\]\([^\(\)]\))/)){
                evt.stop();
                let confirm=Modal.confirm;
                confirm({
                    title: '粘贴提示',
                    content: `<p>检测到markdown语法，是否进行转换？</p>`,
                    okText:"是",
                    cancelText:"否",
                    onOk: () => {
                        // let content = mkTock( text );
                        // content = normalizeClipboardData( content );
                        // content = this._htmlDataProcessor.toView( content );
                        // editor.plugins.get( 'Clipboard' ).fire( 'inputTransformation', { content, dataTransfer } );
                        // editor.editing.view.scrollToTheSelection();
                        if(text.length>maxlen){
                            setTimeout(()=>{
                                confirm({
                                    title: '粘贴提示',
                                    content: `<p>文章过长，推荐使用导入，粘贴将无法复现全部内容，是否继续？</p>`,
                                    okText:"是",
                                    cancelText:"否",
                                    onOk: () => {
                                        this.setContent(cutTooLong(text,maxlen),dataTransfer,'markdown');
                                    },
                                    onCancel: () => {
                                    }
                                });
                            },500);
                        }else{
                            this.setContent(text,dataTransfer,'markdown');
                        }
                    },
                    onCancel: () => {
                        // let content = text;
                        // content = plainTextToHtml( content );
                        // content = this._htmlDataProcessor.toView( content );
                        // editor.plugins.get( 'Clipboard' ).fire( 'inputTransformation', { content, dataTransfer } );
                        // editor.editing.view.scrollToTheSelection();
                        if(text.length>maxlen){
                            setTimeout(()=>{
                                confirm({
                                    title: '粘贴提示',
                                    content: `<p>文章过长，推荐使用导入，粘贴将无法复现全部内容，是否继续？</p>`,
                                    okText:"是",
                                    cancelText:"否",
                                    onOk: () => {
                                        this.setContent(cutTooLong(text,maxlen),dataTransfer,'text');
                                    },
                                    onCancel: () => {
                                    }
                                });
                            },500);
                        }else{
                            this.setContent(text,dataTransfer,'text');
                        }
                    }
                });
            }else if(text.length>maxlen){
                evt.stop();
                confirm({
                    title: '粘贴提示',
                    content: `<p>文章过长，推荐使用导入，粘贴将无法复现全部内容，是否继续？</p>`,
                    okText:"是",
                    cancelText:"否",
                    onOk: () => {
                        this.setContent(cutTooLong(text,maxlen),dataTransfer,'text');
                    },
                    onCancel: () => {
                    }
                });
            }
        });
    }

    setContent(text,dataTransfer,type){
        const editor = this.editor;
        let content = text;
        if(type==='markdown'){
            content = mkTock( content );
            content = normalizeClipboardData( content );
        }else{
            content = plainTextToHtml( content );
        }
        try{
            content = this._htmlDataProcessor.toView( content );
        }catch (e) {
            content = editor.plugins.get( 'Clipboard' )._htmlDataProcessor.toView( content );
        }
        editor.plugins.get( 'Clipboard' ).fire( 'inputTransformation', { content, dataTransfer } );
        editor.editing.view.scrollToTheSelection();
    }
}