import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import {mindmapIcon} from '../assets/icons';

export default class InsertMind extends Plugin {
    init() {
        const editor = this.editor;

        editor.ui.componentFactory.add( 'insertMind', locale => {
            const buttonView = new ButtonView( locale );

            buttonView.set( {
                label: '思维导图',
                icon: mindmapIcon,
                tooltip: true
            } );

            buttonView.on( 'execute', () => {
                // let id=[];
                // for (let i=0;i<=5;i++){
                //     id.push(Math.floor(Math.random()*26)+97);
                // }
                // id=String.fromCharCode(...id);
                editor.execute( 'mindmap');
                editor.editing.view.focus();
            } );

            return buttonView;
        } );

        function mindChanged(ev){
            if(ev.data && ev.data.frameId){
                editor.execute( 'mindmap',ev.data);
            }
        }

        this._mindChanged = mindChanged;

        window.addEventListener("message",this._mindChanged);
    }

    destroy() {
        window.removeEventListener("message",this._mindChanged);
    }
}