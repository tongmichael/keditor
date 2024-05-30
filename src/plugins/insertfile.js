import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {attachIcon} from '../assets/icons';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import EventHub from "../event";

export default class InsertFile extends Plugin {
    init() {
        const editor = this.editor;

        editor.ui.componentFactory.add( 'insertFile', locale => {
            const view = new FileDialogButtonView( locale );

            view.set( {
                acceptedType: '*',
                allowMultipleFiles: false
            } );

            view.buttonView.set( {
                label: '附件',
                icon: attachIcon,
                tooltip: true
            } );

            view.on( 'done', ( evt, file ) => {
                EventHub.$emit('editor-attach',file[0]);

                // editor.execute( 'attachment', { value: file[0].name } );
                // const content = `<span class="attach-file" contenteditable="false">${file[0].name}</span>`;
                // const viewFragment = editor.data.processor.toView( content );
                // const modelFragment = editor.data.toModel( viewFragment );
                // editor.model.insertContent( modelFragment );

                // const data = new FormData();
                // data.append('files', file[0]);
                // axios({
                //     url: "/knowledgeAcc/upAcc",
                //     method: 'post',
                //     params:{
                //         draftBm:''
                //     },
                //     data,
                //     headers: {
                //         "Content-Type": "multipart/form-data"
                //     }
                // }).then((res) => {
                //     editor.model.change( writer => {
                //         // const fileElement = writer.createElement( 'span', {
                //         //     class:"attachment-item",
                //         //     fileid: res.data.id,
                //         //     filename:res.data.name
                //         // } );
                //         // writer.insertText( res.data.name, fileElement );
                //         // // Insert the file in the current selection location.
                //         // editor.model.insertContent( fileElement, editor.model.document.selection );
                //         const insertPosition = editor.model.document.selection.getFirstPosition();
                //
                //         let api=axios.defaults && axios.defaults.baseURL || '';
                //         if(api.charAt(0)==="."){
                //             api = api.slice(1)
                //         }
                //         writer.insertText( res.data.name,{
                //                 linkHref: api+'/rest/contact/file/'+res.data.id
                //             },insertPosition );
                //     } );
                // }).catch((error) => {
                //     console.log(error);
                //     SucMessage.error('附件上传失败！');
                // });
            } );

            return view;
        } );
    }
}