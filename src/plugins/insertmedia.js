import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import EventHub from "../event";
import mediaIcon from '@ckeditor/ckeditor5-media-embed/theme/icons/media.svg';

export default class InsertMedia extends Plugin {
    init() {
        const editor = this.editor;

        editor.ui.componentFactory.add( 'insertMedia', locale => {
            const view = new FileDialogButtonView( locale );

            view.set( {
                acceptedType: '*',
                allowMultipleFiles: false
            } );

            view.buttonView.set( {
                label: '媒体',
                icon: mediaIcon,
                tooltip: true
            } );

            view.on( 'done', ( evt, file ) => {
                EventHub.$emit('editor-media',file[0]);
            });

            return view;
        } );
    }
}