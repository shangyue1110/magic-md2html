# H1

>CreateTime:2018年7月18日

<tag label="test,测试,md,magicMd2Html,parser">

<ToC>

## H2

### H3

#### H4

##### H5

###### H6

## List

### &lt;ul&gt;

* 测试一级
  * 测试二级
  * 测试二级
    * 测试三级
    * 测试三级
  * 测试二级
* 测试一级

### &lt;ol&gt;

1. `你好`
  1. hi
  2. Helo
   1. hello
   2. happy
  3. why?
2. 真的
3. what's u name?

### mix &lt;ul&gt; & &lt;ol&gt;

1. 1
  * 1.1
    1. 1.1.1
    2. 1.1.2
    3. 1.1.3
  * 1.1.3.1
  * 1.1.3.2
    4. 1.1.4
  * 1.2
2. 2
3. 3
4. 4

### &lt;dl&gt;

```
<dl>
    <dt>name</dt>
    <dd>the description of name</dd>
    <dt>age</dt>
    <dd>the description of age</dd>
    <dt>alias</dt>
    <dd>别名</dd>
</dl>
```
<dl>
    <dt>name</dt>
    <dd>the description of name</dd>
    <dt>age</dt>
    <dd>the description of age</dd>
    <dt>alias</dt>
    <dd>别名</dd>
</dl>

<hr>

```
<dl class="magic-dl-flat">
    <dt>name</dt>
    <dd>the description of name</dd>
    <dt>age</dt>
    <dd>the description of age</dd>
    <dt>alias</dt>
    <dd>别名</dd>
</dl>
```
<dl class="magic-dl-flat">
    <dt>name</dt>
    <dd>the description of name</dd>
    <dt>age</dt>
    <dd>the description of age</dd>
    <dt>alias</dt>
    <dd>别名</dd>
</dl>

## Blockquote

>引用内容
>>再次引用
>>>第三次引用
>>回到上级
>bye!

## code

>暂未提供代码高亮的相关调用 ( Code highlight hasn't supported now. you can do it your self!)

by &#x60;&#x60;&#x60;

```
// 这里是真的代码了吧
const hi (name)=> 'say hello!'+name
```
by tab

    123
    你好
    斯蒂芬斯
    我知道你在干嘛
    Hello New York

## line inner element

* italic&nbsp;&nbsp;&nbsp;*That's true*
* bold&nbsp;&nbsp;&nbsp;__也许是个好消息__
* delete&nbsp;&nbsp;&nbsp;~~也许不是~~

## link

[测试链接](https://www.npmjs.com/package/magic-md2html)

## 图片

![file](../test/attachfiles/magic.jpg)

![image online](https://i2.kym-cdn.com/entries/icons/original/000/012/686/Magic-Book-Wallpaper.jpg)

## 表格

|  name  | age | sex  |
| -------- |-------|:--:|
|  Alex    |   12  | F |
| Alice    |   10  | M |
| Angerlus    |   17  | F |
| Eric    |   12  | F |
| Down    |   11  | F |

## hr

<hr>



