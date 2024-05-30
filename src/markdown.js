import { mavonEditor } from 'mavon-editor';
import setuse from "markdown-it-plugin-common";
import markdownItAttrs from "markdown-it-attrs";
import implicitFigures from "markdown-it-implicit-figures";
import embed from "./markdownIt/markdown-it-embed";

const markdownIt = mavonEditor.getMarkdownIt();
markdownIt.use(setuse('span','%%'));
// markdownIt.use(setuse('figure','%%'));
// markdownIt.use(setuse('figcaption','--'));
markdownIt.use(embed('iframe','src',[['width','100%'],['height','500px']]));
markdownIt.use(markdownItAttrs, {
    leftDelimiter: '{',
    rightDelimiter: '}',
    allowedAttributes: []
});
markdownIt.use(implicitFigures, {
    dataType: false,
    figcaption: true,
    tabindex: false,
    link: false
});

export default mavonEditor