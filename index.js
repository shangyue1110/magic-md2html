
const through = require('through2'),
    marked = require('marked'),
    PluginError = require('plugin-error'),
    fs=require('fs'),
    Mcfg =require('./magic.config'),
    StringDecoder = require('string_decoder').StringDecoder,
    decoder = new StringDecoder(Mcfg.Def_Encode);    //  default is utf8

const buildTemplate= (options) => {
    const localOpts=Object.assign(Mcfg.Def_Config_format,options);
    //  读取模板
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
            //  取出第一个
            let cur=arr.shift(),
                regRes=cur.match(Mcfg.TitleContentRegex),
                curContent=regRes ? regRes[1] : cur,
                curD=parseInt(cur.substring(2,3));
            if(curDeep == 1){
                htmlArr.push('<ul>\n');
                curDeep++;
            }

            if(curDeep == curD){
                htmlArr.push(`\t<li><a>${curContent}</a>\n`);
            }else if(curDeep < curD){
                //  传入 h1 当前 h2， 1<2
                htmlArr.push(`\t<ul>
<li><a>${curContent}</a></li>\n`);
            } else if(curDeep > curD){
                //  传入 h3 当前 h2， 3>2
                htmlArr.push(`</ul>\n</li>\n</li>
\t<li><a>${curContent}</a>\n`);

            }

            if(arr.length){
                organizeUl(arr,curD,htmlArr);
            }else{
                htmlArr.push('</ul>\n');
            }
        };
        organizeUl(target,1,tagStrArr);
        toc=tagStrArr.join('\n');
    }
    return toc;
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

    /*if(!markedOpts.hasOwnProperty('renderer')){
        let myRender=new marked.Renderer();
        myRender.heading = (text, level) => `
<h${level} class=""><a class="anchor">${text}</a></h${level}>`.trim();
        markedOpts.renderer=myRender;
    }*/

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
                let htmlTmp=d,metaInfo,
                    tagInfos=mdInfo.match(Mcfg.TagLabelRegex);
                if(tagInfos){
                    metaInfo=`
<meta name="generator" content="magic-md2html" />
<meta http-equiv="content-language" content="en-US,zh-CN" />
<meta name="author" content="${localOpts.metaInfo.author || '{{author}}'}" />
<meta name="keywords" content="${tagInfos[1]}" />
<meta name="description" content="{{description}}" />
<meta http-equiv="date" content="${new Date()}" />
<meta name="copyright" content="${localOpts.metaInfo.copyright}" />
`.trim();
                    //  render tags
                    let tagLis=[];
                    tagInfos[1].split(',').forEach((val,i,arr)=>{
                        let tagLi=`<li><a>${val}</a></li>\n`;
                        tagLis.push(tagLi);
                    });
                    let tagLabelWrap=`<ul>\n${tagLis.join(' ')}</ul>`;

                    //  替换 html 里的 meta 占位符
                    htmlTmp=htmlTmp.replace(Mcfg.TemplateDef.Meta,metaInfo);
                    //  替换 md 内容里的 tagLabel
                    mdInfo=mdInfo.replace(tagInfos[0],tagLabelWrap);
                }

                //  提取所有h1-h3
                let titleArr=mdInfo.match(Mcfg.TitleRegex),
                    h1Title=titleArr.shift(),
                    h1TitleReg=Mcfg.TitleContentRegex.exec(h1Title),
                    h1Content=h1TitleReg.length==2 ? h1TitleReg[1]:'未命名-'+h1Title;

                //  替换 TOC
                if(localOpts.enableToC){
                    let titleHtml=parseToC(titleArr);
                    mdInfo=mdInfo.replace(Mcfg.ToCTag,titleHtml);
                }



                //  替换正文
                htmlTmp = htmlTmp.replace(Mcfg.TemplateDef.Content, mdInfo)
                    .replace(Mcfg.TemplateDef.Title,h1Content);
                //  文内 description / author 信息 也可预留处理。


                //  转回 buffer

                file.contents = Buffer.from(htmlTmp);
                file.extname = Mcfg.OutFileSuffix;

                cb(null, file);
            });

        });
    });

};
