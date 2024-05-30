import TurndownService from "turndown";
import tables from "./table";

function figureTo(content,node) {
    let attrs='';
    if(node && node.attributes && node.attributes.length){
        for(let i=0;i<node.attributes.length;i++){
            let item=node.attributes[i];
            attrs=(attrs?attrs+' ':'') + item.name + '="' +item.value +'"'  ;
        }
    }
    if(attrs){
        attrs='\n{'+attrs+'}'
    }
    content = content.replace(/(^\n+)|(\n+$)/g, '');
    let figcaption=(content.match(/\)\-\-[\s\S]*\-\-$/) || [''])[0];
    content=content.replace(/\)\-\-[\s\S]*\-\-$/,')');
    figcaption=figcaption.replace(/^\)\-\-/,'').replace(/\-\-$/,'');
    if(figcaption){
        content=content.replace(/^\!\[([^\[\]]|(\[[^\[\]]*\]))*\]\(/,`![${figcaption}](`);
    }
    if(content.match(/^\!\[/)){
        content=content+attrs
    }
    if(!content.match(/^\<table([^\S\r\n]|\>)/)){
        content='\n\n'+content+'\n\n'
    }
    return content
}

function oembedTo(content,node) {
    // let attrs='';
    // if(node && node.attributes && node.attributes.length){
    //     for(let i=0;i<node.attributes.length;i++){
    //         let item=node.attributes[i];
    //         attrs=(attrs?attrs+' ':'') + item.name + '="' +item.value +'"'  ;
    //     }
    // }
    // if(attrs){
    //     attrs='{'+attrs+'}'
    // }
    // return '^^嵌入媒体^^' + attrs

    let url=node && node.getAttribute('url');
    if(url){
        if(url.match(new RegExp('https\\:\\/\\/'+'\\/file\\/localPreview'+'\\?id\\=(\\w+)'))){   //prvFileReg()
            url=url.replace("https://","");
        }
        return '@[]('+url+')'
    }
    return ''
}

let turndownService = new TurndownService({
    bulletListMarker:'-',
    codeBlockStyle:'fenced',
    headingStyle:'atx',
    blankReplacement: function (content, node) {
        if(node.tagName==='FIGURE'){
            return figureTo(content, node);
        }
        if(node.tagName==='OEMBED'){
            return oembedTo(content, node);
        }
        return node.isBlock ? '\n\n' : ''
    }
});

turndownService.use([tables]);

turndownService.addRule('emphasis', {
    filter: ['em', 'i'],
    replacement: function (content) {
        if(!content.trim()){
            return ''
        }
        let left='',right='';
        let lefts=content.match(/^\s+/);
        let rights=content.match(/\s+$/);
        left=lefts && lefts[0] || '';
        right=rights && rights[0] || '';
        content=content.trim();
        if(!left && content.match(/^[^0-9a-zA-Z\u4e00-\u9fa5]/)){
            left=' ';
        }
        if(!right && content.match(/[^0-9a-zA-Z\u4e00-\u9fa5]$/)){
            right=' ';
        }
        return left+'*' + content + '*'+right
    }
});

turndownService.addRule('strong', {
    filter: ['strong', 'b'],
    replacement: function (content) {
        if(!content.trim()){
            return ''
        }
        let left='',right='';
        let lefts=content.match(/^\s+/);
        let rights=content.match(/\s+$/);
        left=lefts && lefts[0] || '';
        right=rights && rights[0] || '';
        content=content.trim();
        if(!left && content.match(/^[^0-9a-zA-Z\u4e00-\u9fa5]/)){
            left=' ';
        }
        if(!right && content.match(/[^0-9a-zA-Z\u4e00-\u9fa5]$/)){
            right=' ';
        }
        return left+'**' + content + '**'+right
    }
});

turndownService.addRule('underline', {
    filter: 'u',
    replacement: function (content) {
        if(!content.trim()){
            return ''
        }
        let left='',right='';
        let lefts=content.match(/^\s+/);
        let rights=content.match(/\s+$/);
        left=lefts && lefts[0] || '';
        right=rights && rights[0] || '';
        content=content.trim();
        if(!left && content.match(/^[^0-9a-zA-Z\u4e00-\u9fa5]/)){
            left=' ';
        }
        if(!right && content.match(/[^0-9a-zA-Z\u4e00-\u9fa5]$/)){
            right=' ';
        }
        return left+'++' + content + '++'+right
    }
});

turndownService.addRule('strikethrough', {
    filter: 's',
    replacement: function (content) {
        if(!content.trim()){
            return ''
        }
        let left='',right='';
        let lefts=content.match(/^\s+/);
        let rights=content.match(/\s+$/);
        left=lefts && lefts[0] || '';
        right=rights && rights[0] || '';
        content=content.trim();
        if(!left && content.match(/^[^0-9a-zA-Z\u4e00-\u9fa5]/)){
            left=' ';
        }
        if(!right && content.match(/[^0-9a-zA-Z\u4e00-\u9fa5]$/)){
            right=' ';
        }
        return left+'~~' + content + '~~'+right
    }
});

turndownService.addRule('fontstyle', {
    filter: 'span',
    replacement: function (content,node) {
        // if(!content.trim()){
        //     return ''
        // }
        // let attrs='';
        // if(node && node.attributes && node.attributes.length){
        //     for(let i=0;i<node.attributes.length;i++){
        //         let item=node.attributes[i];
        //         attrs=attrs+' '+ item.name + '="' +item.value +'"';
        //     }
        // }
        // let left='',right='';
        // let lefts=content.match(/^\s+/);
        // let rights=content.match(/\s+$/);
        // left=lefts && lefts[0] || '';
        // right=rights && rights[0] || '';
        // content=content.trim();
        // return left+'<span'+attrs+'>' + content + '</span>'+right
        if(!content.trim()){
            return ''
        }
        let attrs='';
        if(node && node.attributes && node.attributes.length){
            for(let i=0;i<node.attributes.length;i++){
                let item=node.attributes[i];
                attrs=(attrs?attrs+' ':'') + item.name + '="' +item.value +'"'  ;
            }
        }
        if(attrs){
            attrs='{'+attrs+'}'
        }
        let left='',right='';
        let lefts=content.match(/^\s+/);
        let rights=content.match(/\s+$/);
        left=lefts && lefts[0] || '';
        right=rights && rights[0] || '';
        content=content.trim();
        if(!left && content.match(/^[^0-9a-zA-Z\u4e00-\u9fa5]/)){
            left=' ';
        }
        if(!right && content.match(/[^0-9a-zA-Z\u4e00-\u9fa5]$/)){
            right=' ';
        }
        return left+'%%' + content + '%%'+attrs+right
    }
});

turndownService.addRule('mark', {
    filter: 'mark',
    replacement: function (content,node) {
        if(!content.trim()){
            return ''
        }
        let attrs='';
        if(node && node.attributes && node.attributes.length){
            for(let i=0;i<node.attributes.length;i++){
                let item=node.attributes[i];
                attrs=(attrs?attrs+' ':'') + item.name + '="' +item.value +'"'  ;
            }
        }
        if(attrs){
            attrs='{'+attrs+'}'
        }
        let left='',right='';
        let lefts=content.match(/^\s+/);
        let rights=content.match(/\s+$/);
        left=lefts && lefts[0] || '';
        right=rights && rights[0] || '';
        content=content.trim();
        return left+'==' + content + '=='+attrs+right
    }
});

turndownService.addRule('figure', {
    filter: 'figure',
    replacement: figureTo
});

turndownService.addRule('figcaption', {
    filter: 'figcaption',
    replacement: function (content,node) {
        return '--' + content + '--'
    }
});

turndownService.addRule('paragraph', {
    filter: 'p',
    replacement: function (content,node) {
        // if(node.parentNode && ["TH","TD","LI"].includes(node.parentNode.tagName)){
        //     return content
        // }
        let attrs='';
        if(node && node.attributes && node.attributes.length){
            for(let i=0;i<node.attributes.length;i++){
                let item=node.attributes[i];
                attrs=(attrs?attrs+' ':'') + item.name + '="' +item.value +'"'  ;
            }
        }
        if(attrs){
            attrs=' {'+attrs+'}'
        }
        return '\n\n' + content+attrs + '\n\n'
    }
});

turndownService.addRule('listItem', {
    filter: 'li',
    replacement: function (content,node, options) {
        let attrs='';
        if(node && node.attributes && node.attributes.length){
            for(let i=0;i<node.attributes.length;i++){
                let item=node.attributes[i];
                attrs=(attrs?attrs+' ':'') + item.name + '="' +item.value +'"'  ;
            }
        }
        if(attrs){
            attrs=' {'+attrs+'}'
        }

        content = content
            .replace(/^\n+/, '') // remove leading newlines
            .replace(/\n+$/, '\n') // replace trailing newlines with just a single one
            .replace(/\n/gm, '\n    '); // indent
        var prefix = options.bulletListMarker + '   ';
        var parent = node.parentNode;
        if (parent.nodeName === 'OL') {
            var start = parent.getAttribute('start');
            var index = Array.prototype.indexOf.call(parent.children, node);
            prefix = (start ? Number(start) + index : index + 1) + '.  ';
        }
        return (
            prefix + content+attrs + (node.nextSibling && !/\n$/.test(content) ? '\n' : '')
        )
    }
});



function repeat (character, count) {
    return Array(count + 1).join(character)
}

turndownService.addRule('heading', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: function (content,node, options) {
        let attrs='';
        if(node && node.attributes && node.attributes.length){
            for(let i=0;i<node.attributes.length;i++){
                let item=node.attributes[i];
                attrs=(attrs?attrs+' ':'') + item.name + '="' +item.value +'"'  ;
            }
        }
        if(attrs){
            attrs=' {'+attrs+'}'
        }

        var hLevel = Number(node.nodeName.charAt(1));

        if (options.headingStyle === 'setext' && hLevel < 3) {
            var underline = repeat((hLevel === 1 ? '=' : '-'), content.length);
            return (
                '\n\n' + content+attrs + '\n' + underline + '\n\n'
            )
        } else {
            return '\n\n' + repeat('#', hLevel) + ' ' + content +attrs+ '\n\n'
        }
    }
});

export default turndownService