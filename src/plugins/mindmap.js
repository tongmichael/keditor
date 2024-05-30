
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {MindmapCommand,createMindFigureElement,
    MindRegistry,modelToViewUrlAttributeConverter,
    toMindWidget,mindPreUrl} from './utils';

export default class Mindmap extends Plugin {

    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'Mindmap';
    }

    /**
     * @inheritDoc
     */
    constructor( editor ) {
        super( editor );

        editor.config.define( 'mindmap', {
            providers: [
                {
                    name: 'kms',
                    url: /^\/mindmap\/[a-z]+\/mindframe\-[0-9]+[a-z](\/[\-\%0-9]+)?$/,
                    html: match => {
                        let uri = match[ 0 ] || '';
                        if(!editor.isReadOnly){
                            uri=uri.replace('/mindmap/view/','/mindmap/edit/')
                        }

                        let prefix=mindPreUrl;
                        if(!prefix){
                            let isHistoryMode='';
                            if(window.location.href.match( /^(\w+):\/\/([^/:]+)(:\d*)?\/?#/ )){
                                isHistoryMode='/#'
                            }
                            let needBaseUrl='';
                            let baseUrl=(process.env.BASE_URL || '');
                            if(baseUrl && baseUrl.startsWith('/') && uri.indexOf(baseUrl)!==0){
                                needBaseUrl=baseUrl;
                            }
                            prefix=`${window.location.protocol}//${window.location.host}${isHistoryMode}${needBaseUrl}`;
                        }

                        return (
                            '<div style="position: relative; padding-bottom: 50%; height: 0; width: 100%;">' +
                            `<iframe src="${prefix}${uri}" ` +
                            'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
                            'frameborder="0" width="100%" height="100%">' +
                            '</iframe>' +
                            '</div>'
                        );
                    }
                }
            ]
        } );

        this.registry = new MindRegistry( editor.locale, editor.config.get( 'mindmap' ) );
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const renderMindPreview = editor.config.get( 'mindmap.previewsInData' );
        const registry = this.registry;

        editor.commands.add( 'mindmap', new MindmapCommand( editor ) );

        // Configure the schema.
        schema.register( 'mindmap', {
            isObject: true,
            isBlock: true,
            allowWhere: '$block',
            allowAttributes: [ 'url' ]
        } );

        // Model -> Data
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'mindmap',
            view: ( modelElement, viewWriter ) => {
                const url = modelElement.getAttribute( 'url' );
                return createMindFigureElement( viewWriter,registry, url,{
                    renderMindPreview: url && renderMindPreview
                });
            }
        } );

        // Model -> Data (url -> data-oembed-url)
        conversion.for( 'dataDowncast' ).add(
            modelToViewUrlAttributeConverter( registry, {
                renderMindPreview
            } ) );

        // Model -> View (element)
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'mindmap',
            view: ( modelElement, viewWriter ) => {
                const url = modelElement.getAttribute( 'url' );
                const figure = createMindFigureElement( viewWriter, registry, url, {
                    renderForEditingView: true
                } );

                return toMindWidget( figure, viewWriter, '思维导图' );
            }
        } );

        // Model -> View (url -> data-oembed-url)
        conversion.for( 'editingDowncast' ).add(
            modelToViewUrlAttributeConverter( registry, {
                renderForEditingView: true,
                domConverter:editor.editing.view.domConverter,
                isReadOnly:editor.isReadOnly
            } ) );

        // View -> Model (data-oembed-url -> url)
        conversion.for( 'upcast' )
            .elementToElement( {
                view: {
                    name: 'oembed',
                    attributes: {
                        url: true
                    }
                },
                model: ( viewMind, modelWriter ) => {
                    const url = viewMind.getAttribute( 'url' );

                    if ( registry.hasMind( url ) ) {
                        return modelWriter.createElement( 'mindmap', { url } );
                    }
                }
            } )
            .elementToElement( {
                view: {
                    name: 'div',
                    attributes: {
                        'data-oembed-url': true
                    }
                },
                model: ( viewMind, modelWriter ) => {
                    const url = viewMind.getAttribute( 'data-oembed-url' );

                    if ( registry.hasMind( url ) ) {
                        return modelWriter.createElement( 'mindmap', { url } );
                    }
                }
            } );
    }
}