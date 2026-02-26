# 移动端 web 开发小记

1、`-webkit-tap-highlight-color` 这个属性只用于 iOS (iPhone和iPad)。当你点击一个链接或者通过 Javascript 定义的可点击元素的时候，它就会出现一个半透明的灰色背景。要重设这个表现，你可以设置 -webkit-tap-highlight-color 为任何颜色。想要禁用这个高亮，设置颜色的 alpha 值为0即可。

`-webkit-tap-highlight-color:rgba(255,255,255,0)` 可以同时屏蔽 ios点击元素时出现的阴影。

备注：transparent 的属性值在 android 下无效。

2、`-webkit-appearance:none` 可以同时屏蔽输入框怪异的内阴影。

3、`-webkit-transform:translate3d(0, 0, 0)` 在 ios 下可以让动画更加流畅（这个属性会调用硬件加速模式），但是在 android 下不可乱用，很多见所未见的 bug 就是因为这个。

4、`@-webkit-keyframes` 可以预定义很多你所想到的动画，然后通过 -webkit-transition 来调用。

5、`-webkit-background-size` 可以做高清图标，不过一些低版本的 android 只能识别 background-size，所以有必要两个都要写上。用这个属性的时候推荐使用 cover 这个值，可以自动去匹配宽和高。

6、`text-shadow` 多用这个属性，可以美化文字效果。

7、`border-radius`、`box-shadow`、`gradient`、`border-image`，不解释，可以精简代码。

8、android、ios4及以下，固定宽/高块级元素的 `overflow:scroll/auto` 失效，属于浏览器的 bug，可借助第三方工具实现。

9、ios5+ 可以通过 `scrollTo(0,0)` 来自动隐藏浏览器地址栏。

10、`<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, width=device-width">`, width 定义 viewport 宽度，initial-scale 初始化缩放比例，maximum-scale 允许用户缩放的最大比例，minimum-scale 允许用户缩放的最小比例，user-scalable 是否允许用户缩放。

12、css3动画会影响你的自动聚焦，所以自动聚焦要在动画执行之前来做，或者直接舍弃。

13、使用 media query 适配不同屏幕。

14、`-webkit-nbsp-mode` 
换行有时是很棘手的事情，有时你希望文字在适当的地方断行(而不是折行)，有时你又不想这样。一个能控制这个的属性就是 -webkit-nbsp-mode，它让你可以改变 &nbsp; 空白符的行为，强制文字在它被用到的地方断行。通过设置值为 space 即可实现。


