
const gulp=require('gulp'),
    del=require('del'),
    fs=require('fs'),
    rename=require('gulp-rename'),
    maginMd2Html=require('./index'),
    Mcfg =require('./magic.config');

let config=Object.assign({
    TaskName:{
        CleanAll:'cleanAll',
        Test:'test'
    },
    DocRex:'./test/docs/**/*.md',
    ReleaseDir:'./dist/',
    options:{
        buildTemplate:false,
        templatePath:'./test/index.template.html',
        releasePath:'./dist',
        cssFilePath:'./test/attachfiles/css.txt',
        extraScriptPath:'./test/attachfiles/extraScript.txt',
        footerPath:'./test/attachfiles/footer.txt',
        metaInfo:{
            author:'varlinor@hotmail.com',
            copyright:'varlinor © '
        }
    }

},Mcfg);

require('./test/test')(gulp,{
    fs:fs,
    del:del,
    rename:rename,
    maginMd2Html:maginMd2Html
},config);