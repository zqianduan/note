# Javascript 动态创建样式表和样式规则

如今的这个年代，流行在Web页面上使用了大量的JavaScript，我们需要寻找各种方式来优化它们，使它们更快。我们使用事件委托来让事件监听器更有效率，使用降频技术来限定某些方法的使用次数，使用各种JavaScript加载器来动态加载我们需要的资源，等等。另外一种让页面更高效、更敏捷的方法是动态的添加或移除样式表里的样式，而不需要去查询DOM元素，对每个元素做样式调整。下面我们就来看看如何使用这种技术！

## 捕获样式表

你的页面上可能引用了不只一个的样式文件，你可以选择其中的一个。如果你指定了某个，你可以在HTML页面中的LINK 和 STYLE标签上加入ID来进行区别，获取CSSStyleSheet对象，它存放在document.styleSheets对象里。

    var sheets = document.styleSheets; // 返回一个 StyleSheetList 数组

    /*
     返回：
     StyleSheetList {0: CSSStyleSheet, 1: CSSStyleSheet, 2: CSSStyleSheet, 3: CSSStyleSheet, 4: CSSStyleSheet, 5: CSSStyleSheet, 6: CSSStyleSheet, 7: CSSStyleSheet, 8: CSSStyleSheet, 9: CSSStyleSheet, 10: CSSStyleSheet, 11: CSSStyleSheet, 12: CSSStyleSheet, 13: CSSStyleSheet, 14: CSSStyleSheet, 15: CSSStyleSheet, length: 16, item: function}
     */

    // 找到你想要修改的样式表
    var sheet = document.styleSheets[0];

一个重要的需要注意的事情是样式表的 media 属性——如果你不小心，当想往屏幕显示使用的样式表里做修改操作时，你也许会错误的修改了用于打印 (print) 时使用的样式表。CSSStyleSheet 对象里有各种属性信息，需要时你可以从中获取。

    // Get info about the first stylesheet
    console.log(document.styleSheets[0]);

    /*
    Return:  

    CSSStyleSheet
        cssRules: CSSRuleList
        disabled: false
        href: "http://davidwalsh.name/somesheet.css"
        media: MediaList
        ownerNode: link
        ownerRule: null
        parentStyleSheet: null
        rules: CSSRuleList
        title: null
        type: "text/css"
    */

    // Get the media type
    console.log(document.styleSheets[0].media.mediaText);

    /*
    Returns:
        "all" or "print" or whichever media is used for this stylesheet
    */

有很多方法都可以让你捕获一个样式表，往里面添加新样式规则。

## 创建一个新的样式表

大多数时候，最好的方法是创建一个新的STYLE元素，动态的往里面添加规则。非常简单：

    var sheet = (function() {
        // Create the <style> tag
        var style = document.createElement("style");

        // 如果你愿意的话，可以添加media属性 (或 media query) 
        // style.setAttribute("media", "screen")
        // style.setAttribute("media", "@media only screen and (max-width : 1024px)")

        // WebKit 补丁  
        style.appendChild(document.createTextNode(""));

        // Add the <style> element to the page
        document.head.appendChild(style);

        return style.sheet;
    })();

不幸的是，WebKit类型的浏览器需求做一点点小修改，才能让上面的代码正确的运行，但不管怎样，我们获得了想要的sheet。

## 添加样式规则 – 标准的addRule方法

CSSStyleSheet对象里有一个addRule方法，它可以接受3个参数：选择器、样式规则的CSS代码和一个整数，这个整数用来指示样式表的位置(相对于同样的选择器)：

    sheet.addRule("#myList li", "float: left; background: red !important;", 1);

位置缺省值为-1，表示放在最后。为了进行额外的控制，或偷懒的写法，你可以在规则里添加!important来消除位置引起的问题。调用addRule会返回-1——它什么都不表示。

你会发现，这种技术的优势在于，它可以动态的往页面上添加样式规则，并应用它们；你不必对每个元素进行操作，浏览器会自动应用这些规则。高效吧！

## 新增样式规则

CSSStyleSheet对象里还有一个insertRule方法，但在早期的IE里是没有这个方法的。insertRule方法把addRule方法的前两个参数混合到了一起：

    sheet.insertRule("header { float: left; opacity: 0.8; }", 1);

这个方法看起来很丑陋，但无疑也是非常有用的。

## 安全的应用样式规则

因为并不是所有的浏览器都支持insertRule，最好我们做一些封装来确保代码的有效执行。下面就是一个很简单的封装方法：

    function addCSSRule(sheet, selector, rules, index) {
        if(sheet.insertRule) {
            sheet.insertRule(selector + "{" + rules + "}", index);
        }
        else {
            sheet.addRule(selector, rules, index);
        }
    }

    // Use it!
    addCSSRule(document.styleSheets[0], "header", "float: left");

这个方法可以应对各种情况。如果你想把这个方法里的代码单独拿出来使用，最好用try{}catch(e){}把它们包起来。

## 为媒体查询(Media Queries)增加样式规则

有两个方法可以为特定的媒体查询增加样式规则。第一种是通过标准的insertRule方法：

    sheet.insertRule("@media only screen and (max-width : 1140px) { header { display: none; } }");

因为老式的IE不支持insertRule，我们可以使用另外一种方法，就是创建一个STYLE元素，赋予它正确的media属性，然后往里面添加新的样式规则。这种方式会增加额外的STYLE元素，但十分的简单。

我认为动态的往样式表里添加样式规则是一种十分高效而且简单的技术。记住在你的下一个应用里试一下这种技术，它会省了你很多功夫。

