
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import EventHub from "../event";
import { toWidget,viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import {AttachmentCommand,
        AttachDeleteCommand,
        findElementAncestor,
        BalloonsView} from './utils';

export default class Attachment extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [ Widget,ContextualBalloon ];
    }

    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'Attachment';
    }

    /**
     * @inheritDoc
     */
    constructor( editor ) {
        super( editor );
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;

        this._defineSchema();
        this._defineConverters();

        editor.commands.add( 'attachment', new AttachmentCommand( editor ) );
        editor.commands.add( 'attachdelete', new AttachDeleteCommand( editor ) );
        editor.editing.mapper.on(
            'viewToModelPosition',
            viewToModelPositionOutsideModelElement( editor.model, viewElement => viewElement.hasClass( 'attach-file' ) )
        );

        this.balloonView = this._createView();
        this._balloon = editor.plugins.get( ContextualBalloon );
        this._enableUserBalloonInteractions();
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register( 'attachment', {
            allowWhere: '$text',
            isInline: true,
            isObject: true,
            allowAttributes: [ 'filename' ]
        } );
    }
    _defineConverters() {
        const conversion = this.editor.conversion;

        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'span',
                classes: [ 'attach-file' ]
            },
            model: ( viewElement, modelWriter ) => {
                const filename = viewElement.getChild( 0 ).data;
                return modelWriter.createElement( 'attachment', { filename } );
            }
        } );

        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'attachment',
            view: ( modelItem, viewWriter ) => {
                const widgetElement = createAttachmentView( modelItem, viewWriter );

                return toWidget( widgetElement, viewWriter );
            }
        } );

        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'attachment',
            view: createAttachmentView
        } );

        function createAttachmentView( modelItem, viewWriter ) {
            const filename = modelItem.getAttribute( 'filename' );

            const attachmentView = viewWriter.createContainerElement( 'span', {
                class: 'attach-file'
            } );

            const innerText = viewWriter.createText(filename);
            viewWriter.insert( viewWriter.createPositionAt( attachmentView, 0 ), innerText );

            return attachmentView;
        }
    }

    _createView() {
        const editor = this.editor;

        const view = new BalloonsView( editor.locale );

        this.listenTo( view, 'preview', () => {
            let attachEl=this._getSelectedElement();
            if(attachEl){
                for (let i=0;i<attachEl.childCount;i++) {
                    let text = attachEl.getChild( i );
                    if(text.data){
                        EventHub.$emit('to-preview-attachment',text.data);
                        break;
                    }
                }
            }
        } );

        this.listenTo( view, 'download', () => {
            let attachEl=this._getSelectedElement();
            if(attachEl){
                for (let i=0;i<attachEl.childCount;i++) {
                    let text = attachEl.getChild( i );
                    if(text.data){
                        EventHub.$emit('to-download-attachment',text.data);
                        break;
                    }
                }
            }
        } );
        view.keystrokes.set( 'Esc', ( data, cancel ) => {
            this._hideUI();
        } );
        return view;
    }
    _enableUserBalloonInteractions() {
        const viewDocument = this.editor.editing.view.document;

        this.listenTo( viewDocument, 'click', (evt,data) => {
            this.clickItem=data.view.domConverter.mapDomToView(data.domTarget);
            const parent = this._getSelectedElement();
            if ( parent ) {
                this._showUI();
            }
        } );

        this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
            if ( this._isUIVisible ) {
                this._hideUI();
                // cancel();
            }
        } );

        clickOutsideHandler( {
            emitter: this.balloonView,
            activator: () => this._isUIInPanel,
            contextElements: [ this._balloon.view.element ],
            callback: () => this._hideUI()
        } );
    }
    _getSelectedElement() {
        if(!this.clickItem) {
            return null;
        }
        return findElementAncestor(this.clickItem);
    }
    _addView() {
        if ( this._isUIInPanel ) {
            return;
        }

        this._balloon.add( {
            view: this.balloonView,
            position: this._getBalloonPositionData()
        } );
    }
    _getBalloonPositionData() {
        const view = this.editor.editing.view;
        const viewDocument = view.document;
        const targetSource = this._getSelectedElement();

        const target = targetSource ?
            view.domConverter.mapViewToDom( targetSource ) :
            view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );

        return { target };
    }
    _showUI() {
        const editor = this.editor;
        const command = editor.commands.get( 'attachment' );

        if ( !command.isEnabled ) {
            return;
        }
        if ( !!this._getSelectedElement() ) {
            this._addView();
            this._startUpdatingUI();
        }
    }
    _startUpdatingUI() {
        const editor = this.editor;
        const viewDocument = editor.editing.view.document;

        let prevSelected = this._getSelectedElement();
        let prevSelectionParent = getSelectionParent();

        const update = () => {
            const selected = this._getSelectedElement();
            const selectionParent = getSelectionParent();

            if ( ( prevSelected && !selected ) ||
                ( !prevSelected && selectionParent !== prevSelectionParent ) ) {
                this._hideUI();
            }
            else if ( this._isUIVisible ) {
                this._balloon.updatePosition( this._getBalloonPositionData() );
            }

            prevSelected = selected;
            prevSelectionParent = selectionParent;
        };

        function getSelectionParent() {
            return viewDocument.selection.focus.getAncestors()
                .reverse()
                .find( node => node.is( 'element' ) );
        }

        this.listenTo( editor.ui, 'update', update );
        this.listenTo( this._balloon, 'change:visibleView', update );
    }
    _hideUI() {
        if ( !this._isUIInPanel ) {
            return;
        }

        const editor = this.editor;
        this.stopListening( editor.ui, 'update' );
        this.stopListening( this._balloon, 'change:visibleView' );
        editor.editing.view.focus();
        this._balloon.remove( this.balloonView );
    }
    get _isUIVisible() {
        return this._balloon.visibleView === this.balloonView;
    }
    get _isUIInPanel() {
        return this._balloon.hasView( this.balloonView );
    }
}