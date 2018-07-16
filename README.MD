# magic-md2html

Based on [marked](https://www.npmjs.com/package/marked);

Use marked.Renderer to control html class

This tool is used to batch generate html whit your custom html template!

firstly, you need a html template, just like this:
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
{{meta}}
{{cssHref}}
    <title>{{title}}</title>
</head>
<body>
<div>{{content}}</div>
{{footer}}
{{extraScript}}
</body>
</html>
```

secondly, write extra content file, just like metaInfo, footer, extraScript, style files, etc. you can find
examples in directory `test/attachfiles`.

finally, prepare some markdown files, set configuration and run gulp task!
Then you can obtain your html file in dist directory!

## Custom extends for markdown

for test, perhaps simple to study other tools in npm registry, I add two kinds of extend in md file.
1. ToC tag
2. label tag

you can use them as simple as possible, just like this:
* add `<ToC>` tag in your md file, then this tool will auto create ToC at where you marked the tag.
* add `<tag label="test,测试,md,magicMd2Html,parser">` tag in your md file, then this tool will auto create labels with `<ul>` at where you marked the tag.

of course, you need your own style file to control how ToC and labels display.

## html template fields

`{{meta}}` means where to replaced meta info in html, used to SEO information.

`{{author}}` inner setting, you can see it in `index.js`, used to replaced with md file author.
it will be allowed to get real author in md file if you announced in file, the feature will release on next version.

`{{description}}` inner setting, you can see it in `index.js`, same with field `author`, used to replaced with description in md file.

`{{cssHref}}` used to replaced attached file which contains css link info, just like `<link rel="stylesheet" href="some css file url"/>`

`{{title}}` used to replaced with html title when transform md file.

`{{content}}` used to replaced html tags which transformed by `marked` that the content in md file.

`{{extraScript}}` used to add some common script to html file, this field will be replaced with content in pointed extra file, refer to configuration: `extraScriptPath`

`{{footer}}` used to add some common footer, just like statistics script, common info, links to business partner, etc.
Also, this field will be replaced with content in pointed extra file, refer to configuration: `footerPath`


## Configuration

    buildTemplate: false, 
    enableToC:false,
    templatePath:'',
    cssFilePath:'',
    extraScriptPath:'',
    footerPath:'',
    metaInfo:{
        author:'',
        copyright:''
    }
    markedOptions:{},

### buildTemplate

bool, default is false, to control whether pre build html template or not!
if set `false`, your html template must has no these fields:

* {{cssHref}}
* {{footer}}
* {{extraScript}}

whether buildTemplate exist or not, the field `{{content}}` is required for replaced with md content.

### enableToC

bool, default is false, to control whether generate ToC tags from `<h1>`,`<h2>`,`<h3>` or not.

### templatePath

string, this field is required in options, if you hasn't set `buildTemplate:true`,
this field must point the path of html template with limited template fields;

>for example, in dir `test`, if I set `buildTemplate:true`,
>the field `templatePath` must be filled with `./test/index.template.html`.
>If I set `buildTemplate:false`, the field `templatePath` should be pointed at path of `./test/template.html`.

### cssFilePath

string, if you set `buildTemplate:true`,
you can point the file which contains the stylesheet fragment what will be replaced with `{{cssHref}}` in html template.
Just like `<link rel="stylesheet" href=""/>` or `<style></style>`.

### extraScriptPath

string, if you set `buildTemplate:true`,
you can point the file which contains the extra script fragment file what will be replaced with `{{extraScript}}` in html template.

### footerPath

string, if you set `buildTemplate:true`,
you can point the file which contains the extra footer html fragment what will be replaced with `{{footer}}` in html template.

### metaInfo

object, contains two field: `author` and `copyright`, if all md files are from same author,
you can set author here globally.

* `author` will be replaced in meta tag like `<meta name="author" content="varlinor" />`
* `copyright` will be formatted in meta tag like `<meta name="copyright" content="varlinor © " />`

>PS: if pointed author in md file, this global setting will be covered, perhaps next version will add this feature.

### markedOptions

object, this object represent `marked` [options](https://marked.js.org/#/USING_ADVANCED.md#options),
so we can set `markedOptions.renderer` to customize your own style for all these elements below:
```
Block level renderer methods
- code(*string* code, *string* language)
- blockquote(*string* quote)
- html(*string* html)
- heading(*string* text, *number*  level)
- hr()
- list(*string* body, *boolean* ordered)
- listitem(*string*  text)
- paragraph(*string* text)
- table(*string* header, *string* body)
- tablerow(*string* content)
- tablecell(*string* content, *object* flags)

`flags` has the following properties:
{
    header: true || false,
    align: 'center' || 'left' || 'right'
}

Inline level renderer methods
- strong(*string* text)
- em(*string* text)
- codespan(*string* code)
- br()
- del(*string* text)
- link(*string* href, *string* title, *string* text)
- image(*string* href, *string* title, *string* text)
- text(*string* text)
```

## Some Ideas

Originally, I think perhaps I should set css class as variables in this configuration, just like format below:
```
options={
    ...
    tagClassDef:{
        blockquoteClass:'',
        hrClasss:'',
        olClass:'',
        ulClass:'',
        pClass:'',
        tableClass:'',
        strongClass:'',
        aClass:'',
        emClass:'',
        spanClass:'',
        imgClass:'',
        delClass:'',
    }
}
```

but, I think that's so stupid to do this.
Everyone can set their own styles, why should I limited the html format which transformed by `marked`.

## To User

This tool may not be so perfect to generate such a beautiful html pages, it comes from an idea by suddenly,
it is simple, but just matches my requirement. if you have some ideas for it, please let me know, thank you!