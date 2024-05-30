import turndownService from "./turndownService";
import markdownIt from "./markdownIt";
import downloadIt from './download/markdownIt';

export function ckTomk(html){//CKEditor 到 markdown
    let result = html;
    return turndownService.turndown(result);
}

export function mkTock(mark){//markdown 到 CKEditor
    let result = mark;
    try{
        result= result.replace(new RegExp('(?<=(^|\\n\\n)[^\\S\\r\\n]*)[^\\S\\r\\n]','g'),'( )');
        result= result.replace(new RegExp('(?<=(^|\\n\\n)#+[^\\S\\r\\n]+)[^\\S\\r\\n]','g'),'( )');
    }catch (e) {
        console.log(e);
    }
    result=markdownIt.render(result);
    try{
        // result = result.replace(new RegExp('(?<=\\<pre[^\\>]*\\>\\s*\\<code[^\\>]*\\>([^\\<\\>]|\\<\\/?br\\>)*)\\( \\)(?=([^\\<\\>]|\\<\\/?br\\>)*\\<\\/code\\>\\s*\\<\\/pre\\>)','g'),' ');
        let tempCodes=result.match(/<pre[^\>]*\>\s*\<code[^\>]*\>([^\<\>]|\<\/?br\>)*\<\/code\>\s*\<\/pre\>/g);
        if(tempCodes){
            for (let i=0;i<tempCodes.length;i++) {
                let tempCode=tempCodes[i].replace(/\( \)/g,' ');
                result=result.replace(tempCodes[i],tempCode);
            }
        }
        result = result.replace(/\( \)/g,'&nbsp;');
        result = result.replace(/\<p[^\>]*\>(?=\<(figure|oembed)[^\>]*\>)/g,'');
        result = result.replace(new RegExp('(?<=\\<\\/(figure|oembed)\\>)\\<\\/p\\>','g'),'');
        result = result.replace(new RegExp('(?<=\\<\\/(figure|oembed|table)\\>)\\n+(?=\\<(figure|oembed|table)[^\\>]*\\>)','g'),'');
        result = result.replace(/\n+(?=\<\/code\>\s*\<\/pre\>)/g,'');
        // result = result.replace(/(?<=\<pre[^\>]*\>\s*\<code[^\>]*\>([^\<\>]|\<\/?br\>)*)\&amp\;(?=([^\<\>]|\<\/?br\>)*\<\/code\>\s*\<\/pre\>)/g,'&');
    }catch (e) {
        console.log(e);
    }
    return result
}

export function mkToht(mark){//markdown 到 html
    let result = mark;
    try{
        result= result.replace(new RegExp('(?<=(^|\\n\\n)[^\\S\\r\\n]*)[^\\S\\r\\n]','g'),'( )');
        result= result.replace(new RegExp('(?<=(^|\\n\\n)#+[^\\S\\r\\n]+)[^\\S\\r\\n]','g'),'( )');
    }catch (e) {
        console.log(e);
    }
    result=downloadIt.render(result);
    try{
        // result = result.replace(new RegExp('(?<=\\<pre[^\\>]*\\>\\s*\\<code[^\\>]*\\>([^\\<\\>]|\\<\\/?br\\>)*)\\( \\)(?=([^\\<\\>]|\\<\\/?br\\>)*\\<\\/code\\>\\s*\\<\\/pre\\>)','g'),' ');
        let tempCodes=result.match(/<pre[^\>]*\>\s*\<code[^\>]*\>([^\<\>]|\<\/?br\>)*\<\/code\>\s*\<\/pre\>/g);
        if(tempCodes){
            for (let i=0;i<tempCodes.length;i++) {
                let tempCode=tempCodes[i].replace(/\( \)/g,' ');
                result=result.replace(tempCodes[i],tempCode);
            }
        }
        result = result.replace(/\( \)/g,'&nbsp;');
        result = result.replace(/\<p[^\>]*\>(?=\<(figure|oembed)[^\>]*\>)/g,'');
        result = result.replace(new RegExp('(?<=\\<\\/(figure|oembed)\\>)\\<\\/p\\>','g'),'');
        result = result.replace(new RegExp('(?<=\\<\\/(figure|oembed|table)\\>)\\n+(?=\\<(figure|oembed|table)[^\\>]*\\>)','g'),'');
        result = result.replace(/\n+(?=\<\/code\>\s*\<\/pre\>)/g,'');
        // result = result.replace(/(?<=\<pre[^\>]*\>\s*\<code[^\>]*\>([^\<\>]|\<\/?br\>)*)\&amp\;(?=([^\<\>]|\<\/?br\>)*\<\/code\>\s*\<\/pre\>)/g,'&');
    }catch (e) {
        console.log(e);
    }
    return result
}