
module.exports= (() => ({
    PluginTitle:'Magic Md to Html',
    Version:'0.0.1',
    Def_Encode:'utf8',
    OutFileSuffix:'.html',
    TagLabelRegex:/<tag[^><]*label="([^"]*?)"[^><]*>/,
    TitleRegex:/<h[1-3][^><]*>(.+)<\/h[1-3]>/g,   //  匹配全部 /<h\d[^><]*[^><]*>(.+)<\/h\d>/g
    TitleContentRegex:/"\s*>(.*)<\/h\d>/,
    ToCTag:'<ToC>',
    TemplateDef:{
        Meta:'{{meta}}',
        Author:'{{author}}',
        Description:'{{description}}',
        Css:'{{cssHref}}',
        Title:'{{title}}',
        Content:'{{content}}',
        ExtraScript:'{{extraScript}}',
        Footer:'{{footer}}'
    },
    Def_Config_format:{
        debugMode:false,
        buildTemplate:false,
        enableToC:false,
        templatePath:'',
        cssFilePath:'',
        extraScriptPath:'',
        footerPath:'',
        markedOptions:{},
        metaInfo:{
            author:'',
            copyright:''
        }
    }

}) )();
