(function($){
  /* HTML5新TAG支持 */
  if ($.browser.msie && $.browser.version != "9.0") {
    (function () {
      if (!/*@cc_on!@*/0) return;
      var e = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video".split(','),
        i = e.length;
      while (i--) {
        document.createElement(e[i])
      }
    })()
  }

  /* IE png透明修正 */
  if ($.browser.msie && $.browser.version < "9.0") {
    var clear = "/static/images/n.gif" //path to clear.gif
    pngfix = function () {
        var els = document.getElementsByTagName('*');
        var ip = /\.png/i;
        var i = els.length;
        while (i-- > 0) {
          var el = els[i];
          var es = el.style;
          if (el.src && el.src.match(ip) && !es.filter) {
            es.height = el.height;
            es.width = el.width;
            es.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + el.src + "',sizingMethod='crop')";
            el.src = clear;
          } else {
            var elb = el.currentStyle.backgroundImage;
            if (elb.match(ip)) {
              var path = elb.split('"');
              var rep = (el.currentStyle.backgroundRepeat == 'no-repeat') ? 'crop' : 'scale';
              es.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + path[1] + "',sizingMethod='" + rep + "')";
              es.height = el.clientHeight + 'px';
              es.backgroundImage = 'none';
              var elkids = el.getElementsByTagName('*');
              if (elkids) {
                var j = elkids.length;
                if (el.currentStyle.position != "absolute") es.position = 'static';
                while (j-- > 0) if (!elkids[j].style.position) elkids[j].style.position = "relative";
              }
            }
          }
        }
      }
    window.attachEvent('onload', pngfix);
  }
})(window.jQuery)//缓存常用变量，提升代码执行速度
