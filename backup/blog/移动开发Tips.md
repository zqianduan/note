### 滚动问题

iOS5 和安卓4.1 开始支持 div 内滚动条：

    -webkit-overflow-scrolling: touch; 
    overflow: auto;   

老版本尽量使用 body 滚动条或者采用 iscroll

### backgroundp-size 兼容性

安卓4.4 版本之前不支持将 backgroundp-size 与 background 合并，如果在 background 中简写 background-size，整条语句就失效了，gulp 的 css-min 压缩默认会将两个属性合并，因此需要添加如下配置项：

    minifyCSS({'noAdvanced': true});

### iOS7 的 header 问题

header 会覆盖在 webview 上层，其他版本则没有这个问题。

### 动画性能

主要有 3 个相关维度影响了动画性能：

* 分辨率：高分辨率的机器更吃性能。我的小米2s滑动还不如我的安卓2.2的老机器。

* webview 版本：安卓4.4 以前的 webview 是一个简化版的 webkit 内核，性能很差，4.4以后采用了 chromium 的内核性能有了很大的提升。

* 硬件性能：硬件性能越好，当然对流畅度越好。

### hover 效果

移动端是没有 hover 效果的，如果在 CSS 中有如下代码：

    .test{color:red;}
    .test:hover{color:blue;}

在某些浏览器下，比如iOS的Safari，实际生效的会是第二行代码。也就是说，该元素的颜色实际上会一直保持蓝色。

### flex 布局

移动端可以使用flex进行布局，但是需要注意flex的语法标准是修订过一次的，一部分浏览器使用的是老的语法，一部分采用新的语法，因此需要注意兼容性问题，比如需要像下面这样的写法：

    .row {
      display: -webkit-box;
      display: -webkit-flex;
      display: -moz-box;
      display: -moz-flex;
      display: -ms-flexbox;
      display: flex;
      padding: 5px;
      width: 100%; }

### 300ms延迟

移动端的click事件有300ms的延迟，一方面可以通过touch事件的组合来模拟一个tap事件来代替click（很多库中都有对tap的封装），另外在Safari和Android chrome 32以后的版本上已经移除了click事件的延迟，随着浏览器的发展，或许几年后可以逐步放弃模拟的方式。

### safari 的 alert 存在 bug

如果存在这样的代码结构：

    $("ele").click(function(){
        if(condition){
            do ...
            alert("success")
        }
        else{
            do ...
            alert("failed")
        }
    })

最终if和else中的逻辑都会执行，而去掉alert后则恢复正常。只有在手机safari中发现该问题，在其它浏览器中没发现这样的问题。

### 覆盖 WebView 默认的样式

    body {
        -webkit-touch-callout: none;    /*在iOS浏览器里面，假如用户长按a标签，都会出现默认的弹出菜单事件*/
        -webkit-text-size-adjust:none;  /* 字型大小是不會變的，而使用者就無法透過縮放網頁來達成放大字型 */
        -webkit-appearance: none;       /*可以改变按钮或者其它控件看起来类似本地的控件*/
        -webkit-tap-highlight-color: transparent;/*Mobile上点击链接高亮的时候设置颜色为透明*/ 
        -webkit-user-drag: none;        /*-webkit-user-drag CSS 属性控制能否将元素作为一个整体拖动。*/
    }
    a {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0); /*很多Android 浏览器的 a 链接有边框，这里取消它*/
    }
    /* For WebApp */
    body {  
        -webkit-user-select : none; /* 如果用户长按web网页的文本内容，都会出现选中的行为，提供复制文字等功能。禁止用户选中文字 for iOS */
    } 
    a, img {  
        -webkit-touch-callout: none;  /* 禁止用户在新窗口打开页面、如何禁止用户保存图片＼复制图片 for iOS */  
    } 

### iOS 8 box-shadow 不显示

解决方法：

border-radius: 1px;
Android4.4 滑动操作时会触发touchcancle

Android4.4以上版本改换了浏览内核，在touchstart之后，如果发现你进行滑动操作，那么就会触发touchcancle，后续绑定在touchmove和touchend上的回调就不会再执行了。

解决方法：

    在touchmove事件回调函数中添加e.preventDefault();

### Android2.3 innerHTML不能用于赋值页面元素

Android2.3系统下，对页面上存在的元素做innerHTML赋值会报错，但是可以createElement出来的元素使用innerHTML赋值。jQuery的html()方法可以兼容。

### Android2.3 border radius不支持百分比

如果要构造圆形，可以使用

    border-radius: 9999px;

### iOS 6 webview scroll 会 clear timer

iOS 6下webview下如果滚动条滚动，会清掉setTimeout/setInterval，因此如果在有滚动条的情况下需要timer正常执行，可以暂时禁掉滚动条。

### :active 支持问题。

iOS 7+ 、android4.4+ 都支持:active, 在iOS 6， android4.1下:active不会触发，但只要在外层元素上随便绑定一个touch事件，就可以触发，例如：

    document.body.addEventListener('touchstart', function(){
       console.log("touchstart"); //随便什么都可以。
    }) 

### 移动端字体

三大手机系统的字体：

_ios 系统_

* 默认中文字体是 Heiti SC

* 默认英文字体是 Helvetica

* 默认数字字体是 HelveticaNeue

* 无微软雅黑字体

_android 系统_

* 默认中文字体是 Droid sans fallback
* 默认英文和数字字体是 Droid Sans
* 无微软雅黑字体

_winphone 系统_

* 默认中文字体是 Dengxian(方正等线体)

* 默认英文和数字字体是 Segoe

* 无微软雅黑字体

各个手机系统有自己的默认字体，且都不支持微软雅黑 如无特殊需求，手机端无需定义中文字体，使用系统默认 英文字体和数字字体可使用 Helvetica ，三种系统都支持

    /* 移动端定义字体的代码 */
    body { font-family: Helvetica; }

### Retina 显示屏，及其带来的问题

`retina`：一种具备超高像素密度的液晶屏，同样大小的屏幕上显示的像素点由 1 个变为多个，如在同样带下的屏幕上，苹果设备的 retina 显示屏中，像素点 1 个变为 4 个

在高清显示屏中的位图被放大，图片会变得模糊，*因此移动端的视觉稿通常会设计为传统 PC 的 2 倍*

那么，前端的应对方案是：

设计稿切出来的图片长宽保证为偶数，并使用 backgroud-size 把图片缩小为原来的 1/2

    //  例如图片宽高为：200px*200px，那么写法如下
    .css { width: 100px; height: 100px; background-size: 100px 100px; }

其它元素的取值为原来的1/2，例如视觉稿40px的字体，使用样式的写法为20px

    .css { font-size: 20px; }

### 移动端字体单位 font-size 选择 px 还是 rem

对于只需要适配手机设备，使用px即可

对于需要适配各种移动设备，使用rem，例如只需要适配iPhone和iPad等分辨率差别比较挺大的设备

rem配置参考：

    html {font-size:10px}
    @media screen and (min-width:480px) and (max-width:639px) {
        html {
            font-size: 15px
        }
    }
    @media screen and (min-width:640px) and (max-width:719px) {
        html {
            font-size: 20px
        }
    }
    @media screen and (min-width:720px) and (max-width:749px) {
        html {
            font-size: 22.5px
        }
    }
    @media screen and (min-width:750px) and (max-width:799px) {
        html {
            font-size: 23.5px
        }
    }
    @media screen and (min-width:800px) and (max-width:959px) {
        html {
            font-size: 25px
        }
    }
    @media screen and (min-width:960px) and (max-width:1079px) {
        html {
            font-size: 30px
        }
    }
    @media screen and (min-width:1080px) {
        html {
            font-size: 32px
        }
    }

### 屏幕旋转的事件和样式

window.orientation，取值：正负 90 表示横屏模式、0 和 180 表现为竖屏模式

    window.onorientationchange = function() {
        switch(window.orientation){
            case -90:
            case 90:
            alert("横屏:" + window.orientation);
            case 0:
            case 180:
            alert("竖屏:" + window.orientation);
            break;
        }
    } 

样式

    // 竖屏时使用的样式
    @media all and (orientation:portrait) {
        .css{}
    }

    // 横屏时使用的样式
    @media all and (orientation:landscape) {
        .css{}
    }

### audio 元素和 video 元素在 ios 和 andriod 中无法自动播放

方案1：触屏即播

    $('html').one('touchstart',function(){
        audio.play()
    })

方案2：利用微信api

    document.addEventListener("WeixinJSBridgeReady", function () {
        document.getElementById('audio').play();
        document.getElementById('video').play();
    }, false);



