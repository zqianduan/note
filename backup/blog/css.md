# 1. HTML/CSS

## 1.0 BFC 和 HasLayout

### BFC 的定义

是 W3C CSS2.1 规范中的一个概念，它决定了元素如何对其元素进行定位，以及与其它元素的关系和相互作用。

在创建了 Block Formating Context 的元素中，其子元素会一个接一个地放置。垂直方向上他们的起点是一个包含块的顶部，两个相邻的元素之间的垂直距离取决于 margin 特性。在 Block Formating Context 中相邻的块级元素的垂直边距会折叠（collapse）。

在 Block Formating Context 中，每一个元素左外边距与包含块的左边相接触（对于从右到左的格式化，右外边接触右边），即使存在浮动也是如此（尽管一个元素的内容区域会由于浮动而压缩），除非这个元素也创建了一个 Block Formating Context。

### BFC到底是什么？

当涉及到可视化布局的时候，Block Formatting Context提供了一个环境，HTML元素在这个环境中按照一定规则进行布局。一个环境中的元素不会影响到其它环境中的布局。比如浮动元素会形成BFC，浮动元素内部子元素的主要受该浮动元素影响，两个浮动元素之间是互不影响的。这里有点类似一个BFC就是一个独立的行政单位的意思。

### 怎样才能形成BFC

* `float`的值不为`none`
* `overflow`的值不为`visible`
* `display`的值为`table-cell`, `table-caption`, `inline-block`中的任何一个
* `position`的值不为`relative`和`static`

### BFC 的作用

1. 不和浮动元素重叠

  如果一个浮动元素后面跟着一个非浮动的元素，那么就会产生一个覆盖的现象，很多自适应的两栏布局就是这么做的。比如下图的效果，[参考例子](http://hikejun.com/blog/2011/10/26/%E8%BF%91%E6%9C%9F%E9%9D%A2%E8%AF%95%E6%84%9F%E5%8F%97/)

2. 清除元素内部浮动

  只要把父元素设为BFC就可以清理子元素的浮动了，最常见的用法就是在父元素上设置`overflow: hidden`样式，对于 IE6 加上`zoom:1`就可以了(IE Haslayout)

3. 嵌套元素 margin 边距折叠问题的解决

  按照BFC的定义，只有同属于一个BFC时，两个元素才有可能发生垂直Margin的重叠，这个包括相邻元素，嵌套元素，只要他们之间没有阻挡(例如边框，非空内容，padding等)就会发生margin重叠。
  因此要解决margin重叠问题，只要让它们不在同一个BFC就行了，但是对于两个相邻元素来说，意义不大，没有必要给它们加个外壳，但是对于嵌套元素来说就很有必要了，只要把父元素设为BFC就可以了。这样子元素的margin就不会和父元素的margin发生重叠了。

### IE HasLayout

Layout 是一个 Internet Explorer for Windows 的私有概念，它决定了一个元素如何显示以及约束其包含的内容、如何与其他元素交互和建立联系、如何响应和传递应用程序事件、用户事件等。这种渲染特性可以通过某些 CSS 属性被不可逆转地触发。而有些 HTML 元素则默认就具有 layout。

一个元素“得到 layout”，或者说一个元素“拥有 layout” 的时候，是指它的微软专有属性 hasLayout 被设为了 true 。一个“layout 元素”可以是一个默认就拥有 layout 的元素或者是一个通过设置某些 CSS 属性得到 layout 的元素。

不同于标准属性，也不像某些浏览器的私有 CSS 属性，layout 无法通过某一个 CSS 声明直接设定 。也就是说没有“layout 属性”这么一个东西，元素要么本身自动拥有 layout，要么借助一些 CSS 声明悄悄地获得 layout。

下列元素应该是默认具有 layout 的：

* `<html>`, `<body>`
* `<table>`, `<tr>`, `<th>`, `<td>`
* `<img>`
* `<hr>`
* `<input>`, `<button>`, `<select>`, `<textarea>`, `<fieldset>`, `<legend>`
* `<iframe>`, `<embed>`, `<object>`, `<applet>`
* `<marquee>`

下列 CSS 属性和取值将会让一个元素获得 layout：

* position: `absolute` 
  绝对定位元素的包含区块(containing block)就会经常在这一方面出问题。
* float: `left` | `right` 
  由于 layout 元素的特性，浮动模型会有很多怪异的表现。
* display: `inline-block` 
  当一个内联级别的元素需要 layout 的时候往往就要用到它，这也可能也是这个 CSS 属性的唯一效果–让某个元素拥有 layout。`inline-block行为`在 IE 中是可以实现的，但是非常与众不同： IE/Win: inline-block and hasLayout 。
* width: 除 `auto` 外的任意值 
  很多人遇到 layout 相关问题发生时，一般都会先尝试用这个来修复。
* height: 除 `auto` 外的任意值 
  height: 1% 就在 Holly Hack 中用到。
* zoom: 除 `normal` 外的任意值 
  IE专有属性。不过 zoom: 1 可以临时用做调试。
* writing-mode: `tb-rl` 
  MS专有属性。

IE7中引入的hasLayout成员

* overflow: `hidden` | `scroll` | `auto`
  在 IE7 中，`overflow` 也变成了一个 layout 触发器，这个属性在之前版本 IE 中没有触发 layout 的功能。
* position: `fixed`
* min-width: 任意值 
  就算设为0也可以让该元素获得 layout。
* max-width: 除 `none` 之外的任意值
* min-height: 任意值 
  即使设为0也可以让该元素的 haslayout=true
* max-height: 除 `none` 之外的任意值

参考资料：

常规流( Normal flow )：[http://www.w3help.org/zh-cn/kb/010/](http://www.w3help.org/zh-cn/kb/010/)


## 1.1 圣杯布局

经典的三列布局，也叫做圣杯布局【Holy Grail of Layouts】，是Kevin Cornell在2006年提出的一个布局模型概念，在国内最早是由淘宝UED的工程师传播开来，在中国也有叫法是双飞翼布局，它的布局要求有几点：

1. 三列布局，中间宽度自适应，两边定宽
2. 中间栏要在浏览器中优先展示渲染
3. 允许任意列的高度最高
4. 要求只用一个额外的 div 标签
5. 要求用最少的 CSS，最少的 Hack 语句


        .wrap{padding: 0 100px 0 120px; overflow: hidden; zoom: 1;}
        .center, .left, .right{float: left; height: 200px; padding-bottom: 9999px; margin-bottom: -9999px;}
        .center{width: 100%; background: #eee;}
        .left{width: 120px; margin-left: -100%; background: #ace; position: relative; left: -120px;}
        .right{width: 100px; margin-left: -100px; background: #f50; position: relative; right: -100px;}
        
        <div class="header"></div>
        <div class="wrap">
          <div class="center"></div>
          <div class="left"></div>
          <div class="right"></div>
        </div>
        <div class="footer"></div>


## 1.2 inline-block 问题

* 行内元素 display:inline-block;

    html:
    <div class="item-list">
      <a href="#">行内元素a</a>
      <a href="#">行内元素a</a>
    </div>

    css:
    .item-list{ font-size: 0; *word-spacing: -0.18em;/* 这里是定值，不需要随字体类型、大小而变化 */ }
    item{ font-size: 12px; display:inline-block; *word-spacing: normal; }

    @media screen and (-webkit-min-device-pixel-ratio: 0){
      .item-list{ letter-spacing:-1em; } /* just target safari，因为font-size:0时，此条对chrome无效 */
    }

* 块级元素 display:inline-block;

IE7 及一下浏览器，块级元素 `display:inline-block;` 会换行，解决办法：

    html:
    <div class="item-list">
      <a href="#">行内元素a</a>
      <a href="#">行内元素a</a>
    </div>

    css:
    .item-list{ font-size:0; }
    .item{ font-size:12px; display:inline-block; *display:inline; *zoom:1; }

    @media screen and (-webkit-min-device-pixel-ratio: 0){
      .item-list{ letter-spacing:-1em; } /* just target safari，因为font-size:0时，此条对chrome无效 */
    }

## 1.3 What's the valid way to include an image with no src?

    <img src="javascript:void(0);">
    <img src="//:0">

参考资料： [What's the valid way to include an image with no src?](http://stackoverflow.com/questions/5775469/whats-the-valid-way-to-include-an-image-with-no-src)

## 1.4 position 详解

position 的属性值 `relative`, `absolute`, `fixed`, `static`, 'inherit'. 目前几乎所有主流的浏览器都支持 position 属性( inherit 除外，inherit 不支持所有包括 IE8 和之前版本的 IE 浏览器 )。


1. relative

相对定位，对象脱离正常文档流 ( 即在文档中已经不占据位置 )，相对于元素本身在文档中应该出现的位置来移动这个元素，可以通过 top, right, bottom, left ( 简称TRBL ) 来移动元素的位置，实际上该元素依然占据文档中原有的位置，只是视觉上相对原来的位置有移动。

2. absolute

绝对定位，对象脱离正常文档流，参照浏览器的左上角通过 TRBL 定位。可以选取具有定位的父级对象 ( 下文将说到 relative 与 absolute 的结合使用 ) 或者 body 坐标原点进行定位，也可以通过 z-index 进行层次分级。absolute 在没有设定 TRBL 值时是根据父级对象的坐标作为始点的 ( 此时依然受文档流影响 )，当设定 TRBL 值后则根据浏览器的左上角作为原始点。

3. fixed

绝对定位，对象脱离正常文档流，使用 top, right, bottom, left 等属性以窗口为参考点进行定位，当出现滚动条时，对象不会随着滚动。IE6及以下不支持此参数值。

4. static

默认值，没有定位，对象出现在正常的文档流中 ( 忽略 TRBL 以及 z-index )。

5. inherit

从父元素继承 position 属性。

6. relative 和 absolute 结合使用

对象的 position 属性为 absolute, 父对象 position 为 relative/absolute 时，根据父对象进行定位。


# 1.5 屏幕分辨率与网页设计尺寸

win7 任务栏高 40px

winxp 任务栏高 30px

maxthon 状态栏高 24px

firefox 状态栏高 22px

firefox 菜单栏高 132px

ie8 状态栏高 24px

ie8 菜单栏高 120px

ie6 状态栏高 24px

ie6 菜单栏高 114px

360 状态栏高 24px

360 菜单栏高 140px


综合以上数据，网页设计首屏高度参考如下图：


| 浏览器/分辨率      | IE6 | IE8 | maxthon | 360 | Firefox | 平均 |
| ---------------- |:---:|:---:|:-------:|:---:|:-------:|:---:|
| Winxp/1024\*768  | 600 | 596 | 567     | 574 | 584     | 584 |
| Winxp/1440\*900  | 732 | 728 | 699     | 706 | 716     | 716 | 
| Winxp/1280\*1024 | 856 | 852 | 823     | 830 | 840     | 840 |
| Win7/1024\*768   | 590 | 586 | 557     | 564 | 574     | 574 |
| Win7/1440\*900   | 722 | 718 | 689     | 696 | 706     | 706 |
| Win7/1280\*1024  | 846 | 842 | 813     | 820 | 830     | 830 |

单位：px


# 1.6 各浏览器Html5 Video支持的影音格式

`O: 支持   X: 不支持`

| 浏览器/影音格式  | Ogg Theora | MP4(H.264) | WebM |
| ---------------- |:----------:|:----------:|:----:|
| IE9              | X          | O          | X    |
| Firefox5+        | O          | X          | O    |
| Chrome13+        | O          | O          | O    |
| Safari5+         | X          | O          | X    |
| Opera11+         | O          | X          | O    |


最简单的方法，就只要备好 Mp4 与 Ogv 二种影音格式就可以了



