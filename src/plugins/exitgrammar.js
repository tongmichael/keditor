import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';

export default class Exitgrammar extends Plugin {
    init() {
        const editor = this.editor;
        const Hightlight = editor.plugins.get( 'Highlight' );//HighlightEditing

        bindTwoStepCaretToAttribute({
            view: editor.editing.view,
            model: editor.model,
            emitter: Hightlight,
            attribute: 'highlight',
            locale:editor.locale
        });
    }
}