# 1. Android 4.x placeholder line-height 对齐问题

input 中的 placeholder 在 iOS 等设置 line-height 等于 height 的值即可保证垂直居中，而在 Android 4.x 中则会偏上。

使用 ::-webkit-input-placeholder 只能更改颜色，并不能修改 line-height， 解决办法是讲 input 的 line-height 设置成 normal 即可垂直居中。

MDN: [line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height)


2. -webkit-overflow-scrolling: touch; (ios5+);