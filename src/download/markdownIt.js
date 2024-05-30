import MarkdownIt from "markdown-it";
import underline from "markdown-it-plugin-underline";
import setuse from "markdown-it-plugin-common";
import mark from "markdown-it-mark";
import markdownItAttrs from "markdown-it-attrs";
import implicitFigures from "markdown-it-implicit-figures";
import embed from "../markdownIt/markdown-it-embed";

let downloadIt = new MarkdownIt({
    html: true,
    // linkify: true,
    typographer: true,
});
downloadIt.use(underline);
downloadIt.use(setuse('span','%%'));
// downloadIt.use(setuse('figure','%%'));
// downloadIt.use(setuse('figcaption','--'));
downloadIt.use(embed('iframe','src',[['width','100%'],['height','500px']]));
downloadIt.use(mark);
downloadIt.use(markdownItAttrs, {
    leftDelimiter: '{',
    rightDelimiter: '}',
    allowedAttributes: []
});
downloadIt.use(implicitFigures, {
    dataType: false,
    figcaption: true,
    tabindex: false,
    link: false
});

export default downloadIt