
import Command from '@ckeditor/ckeditor5-core/src/command';
import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import TooltipView from '@ckeditor/ckeditor5-ui/src/tooltip/tooltipview';
import IconView from '@ckeditor/ckeditor5-ui/src/icon/iconview';
import Template from '@ckeditor/ckeditor5-ui/src/template';
import { attachLinkToDocumentation } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import { findOptimalInsertionPosition,toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import {downloadIcon,previewIcon} from '../assets/icons';
import mindPlaceholderIcon from "@ckeditor/ckeditor5-media-embed/theme/icons/media-placeholder.svg";

/*附件*/

function getNodeByText( node, text) {
    let result=[];
    if(text && node.getAttribute( "filename" ) === text
        && node.is( "attachment" )){
        result.push(node);
    }
    if(node.getChildren){
        for(let child of node.getChildren()){
            result = result.concat(getNodeByText(child, text));
        }
    }
    return result
}

export class AttachmentCommand extends Command {

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const isAllowed = model.schema.checkChild( selection.focus.parent, 'attachment' );
        this.isEnabled = isAllowed;
    }

    execute( options = {} ) {

        const editor = this.editor;

        editor.model.change( writer => {
            const attachment = writer.createElement( 'attachment', { filename: options.value } );

            editor.model.insertContent( attachment );

            // writer.setSelection( attachment, 'on' );
        } );
    }
}

export class AttachDeleteCommand extends Command {

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const isAllowed = model.schema.checkChild( selection.focus.parent, 'attachment' );
        this.isEnabled = isAllowed;
    }

    execute( options = {} ) {
        const model = this.editor.model;

        model.change( writer => {
            let attachItems=[];
            const roots = model.document.roots;
            for (let i=0;i<roots.length;i++){
                let root = roots.get(i);
                if(root.rootName!=='$graveyard'
                    && (!options.rootName || root.rootName===options.rootName)){
                    attachItems=attachItems.concat(getNodeByText(root,options.value));
                }
            }
            if(attachItems && attachItems.length){
                for (let i=0;i<attachItems.length;i++){
                    writer.remove(attachItems[i]);
                }
            }
        } );
    }
}

export function isElement( node ) {
    return node.is( 'attachment' ) || !!node.hasClass( 'attach-file' );
}
export function findElementAncestor( position ) {
    return position.getAncestors({includeSelf:true,parentFirst:true}).find( ancestor => isElement( ancestor ) );
}

export class BalloonsView extends View {
    /**
     * @inheritDoc
     */
    constructor( locale ) {
        super( locale );

        this.keystrokes = new KeystrokeHandler();

        this.previewButtonView = this._createButton("预览",previewIcon, 'preview');

        this.downloadButtonView = this._createButton("下载",downloadIcon, 'download');


        this.setTemplate( {
            tag: 'div',

            attributes: {
                class: [
                    'ck',
                    'ck-link-actions',
                ],

                tabindex: '-1'
            },

            children: [
                this.previewButtonView,
                this.downloadButtonView
            ]
        } );
    }

    /**
     * @inheritDoc
     */
    render() {
        super.render();

        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo( this.element );
    }

    _createButton( label, icon, eventName ) {
        const button = new ButtonView( this.locale );

        button.set( {
            label,
            icon,
            tooltip: true
        } );

        button.delegate( 'execute' ).to( this, eventName );

        return button;
    }
}

/*脑图*/

export const mindPreUrl=window.mindPreUrl || '';//"http://localhost:8083/#"

export class MindRegistry {

    constructor( locale, config ) {
        const providers = config.providers;
        const extraProviders = config.extraProviders || [];
        const removedProviders = new Set( config.removeProviders );
        const providerDefinitions = providers
            .concat( extraProviders )
            .filter( provider => {
                const name = provider.name;

                if ( !name ) {

                    console.warn( attachLinkToDocumentation(
                        'mindmap-embed-no-provider-name: The configured mind provider has no name and cannot be used.'
                    ), { provider } );

                    return false;
                }

                return !removedProviders.has( name );
            } );

        this.locale = locale;

        this.providerDefinitions = providerDefinitions;
    }

    hasMind( url ) {
        return !!this._getMind( url );
    }

    updateMindViewElement( figure,writer, url, options ) {
        return this._getMind( url ).updateViewElement( figure,writer, options );
    }

    getMindViewElement( writer, url, options ) {
        return this._getMind( url ).getViewElement( writer, options );
    }

    _getMind( url ) {
        if ( !url ) {
            return new Mind( this.locale );
        }

        url = url.trim();

        for ( const definition of this.providerDefinitions ) {
            const previewRenderer = definition.html;
            let pattern = definition.url;

            if ( !Array.isArray( pattern ) ) {
                pattern = [ pattern ];
            }

            for ( const subPattern of pattern ) {
                const match = this._getUrlMatches( url, subPattern );

                if ( match ) {
                    return new Mind( this.locale, url, match, previewRenderer );
                }
            }
        }

        return null;
    }

    _getUrlMatches( url, pattern ) {

        let match = url.match( pattern );

        if ( match ) {
            return match;
        }

        let rawUrl = url.replace( /^(\w+):\/\/([^/:]+)(:\d*)?\/?#?/, '' );
        match = rawUrl.match( pattern );

        if ( match ) {
            return match;
        }

        return null;
    }
}

function getViewMind( viewFigure ) {
    for ( const child of viewFigure.getChildren() ) {
        if ( child.hasClass && child.hasClass('ck-mind__wrapper') ) {
            return child;
        }
    }
}

class Mind {
    constructor( locale, url, match, previewRenderer ) {

        this.url = url || null;

        this._t = locale.t;

        this._match = match;

        this._previewRenderer = previewRenderer;
    }

    updateViewElement(figure, writer, options){
        if(!options.renderForEditingView || !figure){
            return
        }
        let uibox=getViewMind(figure);
        if(!uibox){
            return
        }
        writer.setAttribute( 'data-oembed-url', this.url, uibox );
        const domElement = options.domConverter.mapViewToDom(uibox);
        if(!domElement){
            return
        }
        const framElement=domElement.getElementsByTagName("iframe")[0];
        if(!framElement){
            return
        }
        let src=this.url || '';
        if(!options.isReadOnly){
            src=src.replace('/mindmap/view/','/mindmap/edit/');
        }
        //iframe的src只在初始时设置，后续编辑时不更新
        // framElement.setAttribute("src",this._getValidUrl(src));
        return true
    }

    getViewElement( writer, options ) {
        const attributes = {};

        if ( options.renderForEditingView || ( options.renderMindPreview && this.url && this._previewRenderer ) ) {
            if ( this.url ) {
                attributes[ 'data-oembed-url' ] = this.url;
            }

            if ( options.renderForEditingView ) {
                attributes.class = 'ck-mind__wrapper';
            }

            const mindHtml = this._getPreviewHtml( options );

            return writer.createUIElement( 'div', attributes, function( domDocument ) {
                const domElement = this.toDomElement( domDocument );

                domElement.innerHTML = mindHtml;

                return domElement;
            } );
        } else {
            if ( this.url ) {
                attributes.url = this.url;
            }

            return writer.createEmptyElement( 'oembed', attributes );
        }
    }

    _getPreviewHtml( options ) {
        if ( this._previewRenderer ) {
            return this._previewRenderer( this._match );
        } else {
            if ( this.url && options.renderForEditingView ) {
                return this._getPlaceholderHtml();
            }

            return '';
        }
    }

    _getPlaceholderHtml() {
        const tooltip = new TooltipView();
        const icon = new IconView();

        tooltip.text = "从新窗口打开思维导图";
        icon.content = mindPlaceholderIcon;
        icon.viewBox = '0 0 64 42';

        const placeholder = new Template( {
            tag: 'div',
            attributes: {
                class: 'ck ck-reset_all ck-mind__placeholder'
            },
            children: [
                {
                    tag: 'div',
                    attributes: {
                        class: 'ck-mind__placeholder__icon'
                    },
                    children: [ icon ]
                },
                {
                    tag: 'a',
                    attributes: {
                        class: 'ck-mind__placeholder__url',
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        href: this.url
                    },
                    children: [
                        {
                            tag: 'span',
                            attributes: {
                                class: 'ck-mind__placeholder__url__text'
                            },
                            children: [ this.url ]
                        },
                        tooltip
                    ]
                }
            ]
        } ).render();

        return placeholder.outerHTML;
    }

    _getValidUrl( url ) {
        if ( !url ) {
            return url;
        }

        if ( url.match( /^(\w+):\/\/([^/:]+)(:\d*)?\/?#?/ ) ) {
            return url;
        }

        let prefix=mindPreUrl;
        if(!prefix){
            let isHistoryMode='';
            if(window.location.href.match( /^(\w+):\/\/([^/:]+)(:\d*)?\/?#/ )){
                isHistoryMode='/#'
            }
            let needBaseUrl='';
            let baseUrl=(process.env.BASE_URL || '');
            if(baseUrl && baseUrl.startsWith('/') && url.indexOf(baseUrl)!==0){
                needBaseUrl=baseUrl;
            }
            prefix=window.location.protocol+'//'+window.location.host + isHistoryMode + needBaseUrl
        }

        return prefix + url;
    }
}

export function toMindWidget( viewElement, writer, label ) {
    writer.setCustomProperty( 'mindmap', true, viewElement );

    return toWidget( viewElement, writer, { hasSelectionHandle: true, label } );
}

export function modelToViewUrlAttributeConverter( registry, options ) {
    return dispatcher => {
        dispatcher.on( 'attribute:url:mindmap', converter );
    };

    function converter( evt, data, conversionApi ) {
        if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
            return;
        }

        const url = data.attributeNewValue;
        const viewWriter = conversionApi.writer;
        const figure = conversionApi.mapper.toViewElement( data.item );

        // 如果已存在只更新属性不重新创建dom
        if(registry.updateMindViewElement( figure,viewWriter, url, options )){
            return;
        }

        let uibox=getViewMind(figure);
        if(!!uibox){
            viewWriter.remove( viewWriter.createRangeOn( uibox ) );
        }else{
            viewWriter.remove( viewWriter.createRangeIn( figure ) );
        }

        const mindViewElement = registry.getMindViewElement( viewWriter, url, options );

        viewWriter.insert( viewWriter.createPositionAt( figure, 'end' ), mindViewElement );
    }
}

function getFillerOffset() {
    return null;
}

export function createMindFigureElement( writer,registry, url,options ) {
    const figure = writer.createContainerElement( 'figure', { class: 'mindmap' } );

    figure.getFillerOffset = getFillerOffset;

    writer.insert( writer.createPositionAt( figure, 0 ), registry.getMindViewElement( writer, url, options ) );

    return figure;
}

export function getSelectedMindModelWidget( selection ) {
    const selectedElement = selection.getSelectedElement();

    if ( selectedElement && selectedElement.is( 'mindmap' ) ) {
        return selectedElement;
    }

    return null;
}

export function insertMind( model, url, insertPosition ) {
    model.change( writer => {
        const mindElement = writer.createElement( 'mindmap', { url } );

        model.insertContent( mindElement, insertPosition );

        writer.setSelection( mindElement, 'on' );
    } );
}

function getNodeByFrameId( node, id) {
    if(node.is( 'mindmap' )
        && (node.getAttribute( "url" ) || "").includes(id)){
        return node;
    }
    if(node.getChildren){
        for(let child of node.getChildren()){
            let result = getNodeByFrameId(child, id);
            if(result){
                return result;
            }
        }
    }
    return null
}

export class MindmapCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const schema = model.schema;
        const position = selection.getFirstPosition();
        const selectedMind = getSelectedMindModelWidget( selection );

        let parent = position.parent;

        if ( parent != parent.root ) {
            parent = parent.parent;
        }

        this.value = selectedMind ? selectedMind.getAttribute( 'url' ) : null;
        this.isEnabled = schema.checkChild( parent, 'mindmap' );
    }

    execute( options = {} ) {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectedMind = getSelectedMindModelWidget( selection );
        const url='/mindmap/view/'+
            (options.frameId || ('mindframe-'+new Date().valueOf()+String.fromCharCode(Math.floor(Math.random()*26)+97)))+
            (options.mapData?('/'+options.mapData):'');

        if ( options.frameId ) {
            model.change( writer => {
                let frameElement;
                const roots = model.document.roots;
                for (let i=0;i<roots.length;i++){
                    let root = roots.get(i);
                    if(!frameElement && root.rootName!=='$graveyard'
                        && (!options.rootName || root.rootName===options.rootName)){
                        frameElement=getNodeByFrameId(root,options.frameId);
                    }
                }
                if(frameElement)
                writer.setAttribute( 'url', url, frameElement );
            } );
        } else if ( selectedMind ) {
            model.change( writer => {
                writer.setAttribute( 'url', url, selectedMind );
            } );
        } else {
            const insertPosition = findOptimalInsertionPosition( selection, model );

            insertMind( model, url, insertPosition );
        }
    }
}