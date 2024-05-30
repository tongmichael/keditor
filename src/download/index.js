import {mkToht} from "../transition.js";
import html2pdf from "html2pdf.js";
import canvg from "./canvg2.js";

function wait(time){
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve();
        },time);
    });
}

export async function exporPDF(content,name){
    if(typeof content!=='string'){
        await html2pdf().set({
            margin:10,
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        }).from(content).save(name);
        return
    }
    let html=mkToht(content);
    let container = document.createElement("div");
    container.innerHTML = html;
    container.classList.add('export-doc-style');
    document.body.appendChild(container);
    let fcollection=container.getElementsByTagName("iframe");
    let frames=[];
    for (let i=0;i<fcollection.length;i++) {
        frames.push(fcollection[i]);
    }
    for (let i=0;i<frames.length;i++) {
        let timeout=10;
        let mindmap=frames[i].contentDocument.getElementById("mindindoc");
        let mindcanvas=mindmap && mindmap.getElementsByClassName('map-canvas')[0];
        while(timeout>0 && !(mindcanvas && mindcanvas.hasChildNodes())){
            timeout--;
            mindmap=frames[i].contentDocument.getElementById("mindindoc");
            mindcanvas=mindmap && mindmap.getElementsByClassName('map-canvas')[0];
            await wait(1000);
        }
        if(mindcanvas && mindcanvas.hasChildNodes()){
            let scollection=mindcanvas.getElementsByTagName("svg");
            let svgs=[];
            for (let j=0;j<scollection.length;j++) {
                svgs.push(scollection[j]);
            }
            let height=mindmap.clientHeight;
            let width=mindmap.clientWidth;
            for (let j=0;j<svgs.length;j++){
                if(svgs[j].clientHeight===20000 && svgs[j].clientWidth===20000){
                    svgs[j].style.height=height+'px';
                    svgs[j].style.width=width+'px';
                    svgs[j].style.top=`calc(50% - ${height/2}px)`;
                    svgs[j].style.left=`calc(50% - ${width/2}px)`;
                    svgs[j].setAttribute("viewBox", `${10000-width/2} ${10000-height/2} ${width} ${height}`);
                }
                let sparent = svgs[j].parentNode;
                let sclass = svgs[j].className && svgs[j].className.baseVal || svgs[j].className;
                let scssText = svgs[j].style.cssText;
                let tempNode = document.createElement('div');
                tempNode.appendChild(svgs[j].cloneNode(true));
                let svg = tempNode.innerHTML;
                let canvas = document.createElement('canvas');
                canvg(canvas, svg);//转换
                let image = new Image();
                image.src = canvas.toDataURL("image/png");
                image.className=sclass;
                if(scssText){
                    image.style.cssText=scssText;
                }
                sparent.replaceChild(image,svgs[j]);
            }
            let fparent=frames[i].parentNode;
            let view = document.createElement('div');
            view.className='mindmap-view';
            view.appendChild(mindmap);
            view.style.height=height+'px';
            fparent.replaceChild(view,frames[i]);
            // mindmap.scrollTo(1e4-mindmap.offsetWidth/2,1e4-mindmap.offsetHeight/2);
            mindcanvas.style.top='calc(50% - 1e4px)';
            mindcanvas.style.left='calc(50% - 1e4px)';

            let toTrans=['root','tpc','grp','t','epd','g','children'];
            for (let i=0;i<toTrans.length;i++) {
                let collection=mindcanvas.getElementsByTagName(toTrans[i]);
                let items=[];
                for (let j=0;j<collection.length;j++) {
                    items.push(collection[j]);
                }
                for (let j=0;j<items.length;j++) {
                    let item = document.createElement('div');
                    item.className=(items[j].className?(items[j].className+' '):'') + items[j].tagName.toLowerCase();
                    if(items[j].style.cssText){
                        item.style.cssText=items[j].style.cssText;
                    }
                    let children=[];
                    for(let l=0;l<(items[j].children && items[j].children.length);l++){
                        children.push(items[j].children[l])
                    }
                    if(children.length){
                        for(let l=0;l<children.length;l++){
                            items[j].removeChild(children[l]);
                            item.appendChild(children[l]);
                        }
                    }else{
                        item.innerHTML=items[j].innerHTML;
                    }
                    items[j].parentNode.replaceChild(item,items[j]);
                }
            }
        }
    }

    await html2pdf().set({
        margin:10,
        // pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).from(container).save(name);
    document.body.removeChild(container);
}

function getLines(node,list,indexs,index){
    if(!node.children || !node.children.length){
        return
    }
    for (let i=0;i<node.children.length;i++){
        list.push(node.children[i]);
        indexs.push(index);
        if(!node.children[i].children || !node.children[i].children.length){
            continue;
        }
        for (let j=0;j<node.children[i].children.length;j++){
            if(node.children[i].children[j].tagName==='UL'
                || node.children[i].children[j].tagName==='OL'){
                getLines(node.children[i].children[j],list,indexs,index+1);
            }
        }
    }
}

function getTexts(node,list,style){
    let words=node.childNodes;
    if(!words || !words.length || (words.length===1 && words[0].nodeType===3)){
        let fontSize= ((style.fontSize || "14")+'').replace("px",'');
        fontSize=Math.round(parseFloat(fontSize)*12/14)+'';
        list.push({
            "bold": !!style.bold,
            "colorVal": (style.colorVal || "").replace("#",'') || null,
            "doubleStrike": !!style.doubleStrike,
            "fontFamily": style.fontFamily || null,
            "fontSize":fontSize,
            "italic": !!style.italic,
            "shdColor": (style.shdColor || "").replace("#",'') || null,
            "strike": !!style.strike,
            "text": node.textContent,
            "underLine": style.underLine || null
        });
        return
    }
    for (let k=0;k<words.length;k++){
        let word=words[k];
        if(word.tagName==='UL' || word.tagName==='OL'){
            continue;
        }
        let text={
            "bold": !!style.bold,
            "colorVal": (style.colorVal || "").replace("#",'') || null,
            "doubleStrike": !!style.doubleStrike,
            "fontFamily": style.fontFamily || null,
            "fontSize": ((style.fontSize || "14")+'').replace("px",''),
            "italic": !!style.italic,
            "shdColor": (style.shdColor || "").replace("#",'') || null,
            "strike": !!style.strike,
            "text": word.textContent,
            "underLine": style.underLine || null
        };
        if(word.tagName==='STRONG'){
            text.bold=true;
        }else if(word.tagName==='I'){
            text.italic=true;
        }else if(word.tagName==='U'){
            text.underLine=1;
        }else if(word.tagName==='S'){
            text.strike=true;
        }else if(word.tagName==='MARK'){
            if(word.className.includes("marker-yellow")){
                text.shdColor="fdfd77";
            }else if(word.className.includes("marker-green")){
                text.shdColor="63f963";
            }else if(word.className.includes("marker-pink")){
                text.shdColor="fc7999";
            }else if(word.className.includes("marker-blue")){
                text.shdColor="72cdfd";
            }
            if(word.className.includes("pen-red")){
                text.colorVal="e91313";
            }else if(word.className.includes("pen-green")){
                text.colorVal="118800";
            }
        }else if(word.tagName==='SPAN'){
            if(word.style.fontFamily){
                text.fontFamily=word.style.fontFamily;
            }
            if(word.style.fontSize){
                text.fontSize=((word.style.fontSize || '14')+'').replace("px",'');
            }
        }
        getTexts(word,list,text);
    }
}

export function parseWord(container){
    let results=[];
    let items=container.childNodes;
    for (let i=0;i<items.length;i++){
        let item=items[i];
        let result={
            number:null,
            objectType:0,
            paragraphStyle:{
                "codeBlock":false,
                "fontAlignment": 1,
                "indent": 0,
                "line": "1"
            },
            pic: {
                "fileName": "",
                "high": 0,
                "id": null,
                "type": null,
                "width": 0
            },
            style: "0",
            table: {
                "cells": [],
                "col": 0,
                "colCombine": [],
                "cols": [],
                "row": 0,
                "rowCombine": [],
                "rows": [],
                "width": 0
            },
            textStyles:[],
            wordList:[]
        };
        if(item.tagName==='FIGURE'){
            if(item.className.includes('table')){
                result.objectType=3;
                if(item.children && item.children.length){
                    for (let j=0;j<item.children.length;j++){
                        let table=item.children[j];
                        if(table.tagName==="TABLE" && table.children && table.children.length){
                            result.table.width=parseInt(table.clientWidth*256/14);
                            let cols=new Array();
                            let colCombine=new Array();
                            let rowCombine=new Array();
                            let row=0;
                            let cells=new Array();
                            for (let k=0;k<table.children.length;k++){
                                let tbox=table.children[k];
                                if(tbox.children && tbox.children.length){
                                    result.table.row=result.table.row+tbox.children.length;
                                    for (let l=0;l<tbox.children.length;l++){
                                        let tr=tbox.children[l];
                                        if(!rowCombine[row]){
                                            rowCombine[row]=new Array();
                                        }
                                        if(!colCombine[row]){
                                            colCombine[row]=new Array();
                                        }
                                        if(!cells[row]){
                                            cells[row]=new Array();
                                        }
                                        result.table.rows.push(parseInt(tr.clientHeight*256/14));
                                        if(tr.children && tr.children.length){
                                            let col=0;
                                            while (rowCombine[row][col] || colCombine[row][col] || cells[row][col]){
                                                col++;
                                            }
                                            for (let m=0;m<tr.children.length;m++){
                                                let td=tr.children[m];
                                                let colSpan=td.colSpan || 1;
                                                let rowSpan=td.rowSpan || 1;
                                                rowCombine[row][col]=2;
                                                colCombine[row][col]=2;
                                                if(td.childNodes && td.childNodes[0]
                                                    && (['SPAN','STRONG','I','U','S','MARK'].includes(td.childNodes[0].tagName) || td.childNodes[0].nodeType===3)){
                                                    let cellp={
                                                        objectType:1,
                                                        paragraphStyle:{
                                                            "codeBlock":false,
                                                            "fontAlignment": 1,
                                                            "indent": 0,
                                                            "line": "1"
                                                        },
                                                        textStyles:[]
                                                    };
                                                    getTexts(td,cellp.textStyles,{});
                                                    cells[row][col]=[cellp];
                                                }else{
                                                    cells[row][col]=parseWord(td);
                                                }
                                                if(rowSpan>1 && colSpan>1){
                                                    for (let n=row;n<row+rowSpan;n++){
                                                        for (let o=col;o<col+colSpan;o++){
                                                            if(n>row || o>col){
                                                                if(!rowCombine[n]){
                                                                    rowCombine[n]=new Array();
                                                                }
                                                                if(!colCombine[n]){
                                                                    colCombine[n]=new Array();
                                                                }
                                                                if(!cells[n]){
                                                                    cells[n]=new Array();
                                                                }
                                                                cells[n][o]=cells[row][col];
                                                                rowCombine[n][o]=1;
                                                                colCombine[n][o]=1;
                                                            }
                                                        }
                                                    }
                                                }else if(rowSpan>1){
                                                    for (let n=row+1;n<row+rowSpan;n++){
                                                        if(!rowCombine[n]){
                                                            rowCombine[n]=new Array();
                                                        }
                                                        if(!colCombine[n]){
                                                            colCombine[n]=new Array();
                                                        }
                                                        if(!cells[n]){
                                                            cells[n]=new Array();
                                                        }
                                                        cells[n][col]=cells[row][col];
                                                        rowCombine[n][col]=1;
                                                        colCombine[n][col]=2;
                                                    }
                                                }else if(colSpan>1){
                                                    for (let n=col+1;n<col+colSpan;n++){
                                                        cells[row][n]=cells[row][col];
                                                        rowCombine[row][n]=2;
                                                        colCombine[row][n]=1;
                                                    }
                                                }
                                                if(colSpan===1){
                                                    cols[col]=parseInt(td.clientWidth*256/14);
                                                }
                                                col=col+colSpan;

                                            }
                                            if(col>result.table.col){
                                                result.table.col=col;
                                            }
                                        }
                                        row++;
                                    }
                                }
                            }
                            result.table.cols=cols;
                            result.table.colCombine=colCombine;
                            result.table.rowCombine=rowCombine;
                            result.table.cells=cells;
                        }
                    }
                }
            }else if(item.className.includes('image')){
                result.objectType=2;
                if(item.className.includes('image-style-align-left')){
                    result.paragraphStyle.fontAlignment=1;
                }else if(item.className.includes('image-style-align-right')){
                    result.paragraphStyle.fontAlignment=3;
                }else{
                    result.paragraphStyle.fontAlignment=2;
                }
                if(item.firstElementChild && item.firstElementChild.tagName==="IMG"){
                    result.pic.high = parseInt(item.firstElementChild.clientHeight);
                    result.pic.width = parseInt(item.firstElementChild.clientWidth);
                    let idMatch=(item.firstElementChild.src || "").match(new RegExp('\\/file\\/\\S+\\/(\\w+)\\.?[a-zA-Z0-9]*$'));//getPrefix().fileReg+
                    result.pic.id = idMatch && idMatch[1] || item.firstElementChild.src || null;
                    let typeSp=(item.firstElementChild.src || "").split(".");
                    result.pic.type = {emf:2,wmf:3,pict:4,jpeg:5,png:6,dib:7,gif:8,tiff:9,eps:10,bmp:11,wpg:12}[typeSp[typeSp.length-1]] || null
                }
                if(item.lastElementChild && item.lastElementChild.tagName==="FIGCAPTION"){
                    result.pic.fileName=item.lastElementChild.textContent || "";
                }
            }
        }else if(item.tagName==='UL' || item.tagName==='OL'){
            if(item.tagName==='OL'){
                result.number=true;
            }else{
                result.number=false;
            }
            result.objectType=4;
            if(item.children && item.children[0]){
                result.paragraphStyle.fontAlignment={'center':2,'right':3}[item.children[0].style.textAlign] || 1;
            }
            let lines=[],indexs=[];
            getLines(item,lines,indexs,0);
            for (let j=0;j<lines.length;j++){
                let line=lines[j];
                let wordLine={
                    "listClass": indexs[j] || 0,
                    "texts": []
                };
                getTexts(line,wordLine.texts,{});
                result.wordList.push(wordLine);
            }
        }else if(item.tagName==='P' || item.tagName==='H1' || item.tagName==='H2' || item.tagName==='H3' || item.tagName==='H4'){
            result.objectType=1;
            result.paragraphStyle.fontAlignment={'center':2,'right':3}[item.style.textAlign] || 1;
            getTexts(item,result.textStyles,{});
            if(item.tagName==='H1'){
                result.style='1';
            }else if(item.tagName==='H2'){
                result.style='2';
            }else if(item.tagName==='H3'){
                result.style='3';
            }else if(item.tagName==='H4'){
                result.style='4';
            }
        }else if(item.tagName==='PRE' && item.childNodes && item.childNodes[0] && item.childNodes[0].tagName==='CODE'){
            result.objectType=1;
            result.paragraphStyle.codeBlock=true;
            let code=item.childNodes[0];
            if(code.childNodes && code.childNodes.length){
                for (let j=0;j<code.childNodes.length;j++){
                    let line=code.childNodes[j];
                    if(line.tagName!=='BR'){
                        let subRes=JSON.parse(JSON.stringify(result));
                        getTexts(line,subRes.textStyles,{});
                        results.push(subRes);
                    }
                }
            }
            result=null;
        }
        if(result)
        results.push(result);
    }
    return results
}