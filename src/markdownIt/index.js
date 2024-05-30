import MarkdownIt from "markdown-it";
import underline from "markdown-it-plugin-underline";
import setuse from "markdown-it-plugin-common";
import mark from "markdown-it-mark";
import markdownItAttrs from "markdown-it-attrs";
import implicitFigures from "markdown-it-implicit-figures";
import embed from "./markdown-it-embed";

let markdownIt = new MarkdownIt({
    html: true,
    // linkify: true,
    typographer: true,
});
markdownIt.use(underline);
markdownIt.use(setuse('span','%%'));
// markdownIt.use(setuse('figure','%%'));
// markdownIt.use(setuse('figcaption','--'));
markdownIt.use(embed('oembed','url'));
markdownIt.use(mark);
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

export default markdownIt