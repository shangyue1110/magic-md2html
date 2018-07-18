
const through = require('through2'),
    marked = require('marked'),
    PluginError = require('plugin-error'),
    fs=require('fs'),
    Mcfg =require('./magic.config'),
    StringDecoder = require('string_decoder').StringDecoder,
    decoder = new StringDecoder(Mcfg.Def_Encode);    //  default is utf8

const buildTemplate= (options) => {
    const localOpts=Object.assign(Mcfg.Def_Config_format,options);
    //  读取模板  read template
    try{
        fs.accessSync(localOpts.templatePath,fs.constants.R_OK);
    }catch(err){
        new PluginError(err ? 'no access!' : 'can read!');
        return;
    }
    let htmlTmp = fs.readFileSync(localOpts.templatePath,Mcfg.Def_Encode);

    //  read css
    if(localOpts.cssFilePath){
        let cssInfo = fs.readFileSync(localOpts.cssFilePath);
        htmlTmp=htmlTmp.replace( Mcfg.TemplateDef.Css,cssInfo );
    }
    //  read footer
    if(localOpts.footerPath){
        let footerInfo = fs.readFileSync(localOpts.footerPath);
        htmlTmp=htmlTmp.replace( Mcfg.TemplateDef.Footer,footerInfo );
    }
    // extra script
    if(localOpts.extraScriptPath){
        let scriptInfo = fs.readFileSync(localOpts.extraScriptPath);
        htmlTmp=htmlTmp.replace( Mcfg.TemplateDef.ExtraScript,scriptInfo );
    }

    fs.writeFileSync(Mcfg.RealTmpFilePath,htmlTmp,Mcfg.Def_Encode);
};

const parseToC=(titleArr)=>{
    let toc;
    if(Array.isArray(titleArr)){
        let tagStrArr=[],
            target=[].concat(titleArr);
        const organizeUl =(arr,curDeep,htmlArr)=>{
            //  取出第一个  get first item
            let cur=arr.shift(),
                regRes=cur.match(Mcfg.TitleContentRegex),
                curContent=regRes ? regRes[1] : cur,
                curD=parseInt(cur.substring(2,3));
            if(curDeep == 1){
                htmlArr.push('<ol>\n');
                curDeep++;
            }

            if(curDeep == curD){
                //  跳过第一个，同时为连续同级<li>标签补全</li>
                //  jump first, and completed tag <li> in same level
                if(htmlArr.length>1 && !htmlArr[htmlArr.length-1].endsWith('</li>')){
                    htmlArr.push('</li>');
                }
                htmlArr.push(`<li><a>${curContent}</a>\n`);
            }else if(curDeep < curD){
                //  传入 h1 当前 h2， 1<2
                htmlArr.push(`\t<ol>
<li><a>${curContent}</a>\n`);
            } else if(curDeep > curD){
                //  传入 h3 当前 h2， 3>2
                for(let i=curDeep-curD; i>0 ; i--){
                    htmlArr.push('</li>\n</ol>');
                }
                htmlArr.push(`</li>\n<li><a>${curContent}</a>\n`);

            }

            if(arr.length){
                organizeUl(arr,curD,htmlArr);
            }else{
                for(let i=curDeep-1; i>0 ; i--){
                    htmlArr.push('</li></ol>');
                }

            }
        };
        organizeUl(target,1,tagStrArr);
        toc=tagStrArr.join('\n');
    }
    return toc;
};

/**
 * clean empty tags in template
 */
const cleanEmptyTemplateTag=(html)=>{
    let result=html;
    if(html){
        const tags=Mcfg.TemplateDef;
        for(let key in tags){
            let tag=tags[key];
            result=result.replace(tag,' ');
        }
    }
    return result;
};

module.exports = (options)=>{
    const localOpts=Object.assign(Mcfg.Def_Config_format,options),
        markedOpts=localOpts.markedOptions;
    if( localOpts.buildTemplate ){
        let realTmpPath=localOpts.templatePath.substring(0,localOpts.templatePath.lastIndexOf('/'));
        Mcfg.RealTmpFilePath=realTmpPath+'/template.html';
        //  处理模板
        buildTemplate(options);
        localOpts.templatePath=Mcfg.RealTmpFilePath;
        delete Mcfg.RealTmpFilePath;
    }

    return through.obj((file, enc, cb) => {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new PluginError(Mcfg.PluginTitle, 'Streaming not supported'));
            return;
        }

        marked(file.contents.toString(), markedOpts, (err, data) => {
            if (err) {
                cb(new PluginError(Mcfg.PluginTitle, err, {fileName: file.path}));
                return;
            }
            let mdInfo=decoder.write(Buffer.from(data));
            fs.readFile(localOpts.templatePath, Mcfg.Def_Encode, (err, d) => {
                //  提取 meta
                let htmlTmp=d,metaInfo=`
<meta name="generator" content="magic-md2html" />
<meta http-equiv="content-language" content="en-US,zh-CN" />
<meta http-equiv="date" content="${new Date()}" />
<meta name="copyright" content="${localOpts.metaInfo.copyright}" />
`.trim(),
                    tagInfos=mdInfo.match(Mcfg.TagLabelRegex);
                if(tagInfos){
                    metaInfo+=`
<meta name="author" content="${localOpts.metaInfo.author || '{{author}}'}" />
<meta name="keywords" content="${tagInfos[1]}" />
<meta name="description" content="{{description}}" />
`.trim();
                    //  render tags
                    let tagLis=[];
                    tagInfos[1].split(',').forEach((val,i,arr)=>{
                        let tagLi=`<li><a>${val}</a></li>\n`;
                        tagLis.push(tagLi);
                    });
                    let tagLabelWrap=`<div class="magic-labels"><span>tags:</span><ul>\n${tagLis.join(' ')}</ul></div>`;

                    localOpts.debugMode ? console.log(`Label tags:\n\t${tagLabelWrap}`) :'';
                    //  替换 md 内容里的 tagLabel
                    mdInfo=mdInfo.replace(tagInfos[0],tagLabelWrap);
                }

                localOpts.debugMode ? console.log(`Meta Info:\n\t${metaInfo}`) :'';

                //  替换 html 里的 meta 占位符
                htmlTmp=htmlTmp.replace(Mcfg.TemplateDef.Meta,metaInfo);

                //  提取所有h1-h4   get all tags by h1-h4
                let titleArr=mdInfo.match(Mcfg.TitleRegex);
                if(!titleArr){
                    cb(new PluginError(Mcfg.PluginTitle, "Cannot match any title tags!", {fileName: file.path}));
                    return;
                }

                localOpts.debugMode ? console.log(`All titles:\n\t${titleArr}`) :'';
                let h1Title=titleArr.shift(),
                    h1TitleReg=Mcfg.TitleContentRegex.exec(h1Title),
                    h1Content=h1TitleReg.length==2 ? h1TitleReg[1]:'untitled-'+h1Title;

                //  替换 TOC
                if(localOpts.enableToC){
                    let titleHtml=parseToC(titleArr),
                        tocHtml=`<div class="magic-toc"><span><i>Catalog:</i></span><hr/>
${titleHtml}</div>`;
                    localOpts.debugMode ? console.log(`Toc info:\n\t${tocHtml}`) :'';
                    mdInfo=mdInfo.replace(Mcfg.ToCTag,tocHtml);
                }



                //  替换正文
                htmlTmp = htmlTmp.replace(Mcfg.TemplateDef.Content, mdInfo)
                    .replace(Mcfg.TemplateDef.Title,h1Content);
                let finalHtml=cleanEmptyTemplateTag(htmlTmp);
                localOpts.debugMode ? console.log(`Final Html:\n\t${finalHtml}`) :'';
                //  文内 description / author 信息 也可预留处理。


                //  back to buffer

                file.contents = Buffer.from(finalHtml);
                file.extname = Mcfg.OutFileSuffix;

                cb(null, file);
            });

        });
    });

};
