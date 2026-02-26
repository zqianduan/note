/**
 *  goTop plugin v1.0 回到顶部插件，平滑返回顶部
 *  Author: xiejiancong.com
 *  2012-09-15
 *   
 *  参数设置
 *  startline:         出现返回顶部按钮离顶部的距离
 *  scrollto:          滚动到距离顶部的距离，或者某个id元素的位置
 *  scrollduration:    平滑滚动时间
 *  fadeduration:      淡入淡出时间 eg:[ 500, 100 ] [0]淡入、[1]淡出
 *  controlHTML:       html代码 例如：<a href="javascript:;"><b>回到顶部↑</b></a> 也可以是图片
 *  className:         样式名称
 *  titleName:         回到顶部的title属性
 *  offsetx:           回到顶部 right 偏移位置
 *  offsety:           回到顶部 bottom 偏移位置
 *  anchorkeyword:     锚点链接
 * eg:
 *  $.goTop({
 *    scrollduration: 1000 
 *  });
 */
!function($){

  $.xy = $.xy || {};

  $.xy.goTop = function(options){
    options = $.extend({
      pageWidth: 800,
      startline : 100,              // 出现返回顶部按钮离顶部的距离
      scrollto : 0,                 // 滚动到距离顶部的距离，或者某个id元素的位置
      scrollduration : 500,         // 平滑滚动时间
      fadeduration : [ 500, 100 ],  // 淡入淡出时间 ，[0]淡入、[1]淡出
      controlHTML : '<a href="javascript:;"><b>回到顶部</b></a>', // HTML代码
      className: 'totop',           // 样式名称下面DIV的样式
      titleName: '回到顶部',          // 回到顶部的title属性
      offsetx : 0,                  // 回到顶部 right 偏移位置
      offsety : 25,                 // 回到顶部 bottom 偏移位置
      anchorkeyword : '#top'        // 锚点链接
    }, options);
    
    var state = {
      isvisible : false,
      shouldvisible : false
    };
    
    var current = this;
    
    var $body,$control,$cssfixedsupport;
    
    var init = function(){
      var iebrws = document.all;
      $cssfixedsupport = !iebrws || iebrws
          && document.compatMode == "CSS1Compat"
          && window.XMLHttpRequest
      $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');
      $control = $('<div class="'+options.className+'" id="topcontrol">' + options.controlHTML + '</div>').css({
        position : $cssfixedsupport ? 'fixed': 'absolute',
        display : 'none',
        left: ($(window).scrollLeft() + $(window).width() - options.pageWidth)/2 + options.pageWidth + options.offsetx,
        bottom: options.offsety,
        cursor : 'pointer'
      }).attr({
        title : options.titleName
      }).click(function(){
        scrollup();
        return false;
      }).appendTo('body');
      if (document.all && !window.XMLHttpRequest && $control.text() != ''){
        $control.css({
          width : $control.width()
        });
      }
      $('a[href="' + options.anchorkeyword + '"]').click(function() {
        scrollup();
        return false;
      });
      $(window).bind('scroll resize', function(e) {
        e.type === 'resize' && keepfixed();
        togglecontrol();
      });
      
      return current;
    };
    
    var scrollup = function() {
      if (!$cssfixedsupport){
        $control.css({
          opacity : 0
        });
      }
      var dest = isNaN(options.scrollto) ? parseInt(options.scrollto): options.scrollto;
      if(typeof dest == "string"){
        dest = $('#' + dest).length >= 1 ? $('#' + dest).offset().top : 0;
      }
      $body.animate({
        scrollTop : dest
      }, options.scrollduration);
    };

    var keepfixed = function() {
      var $window = $(window)
        , controlx = ($window.scrollLeft() + $window.width() - options.pageWidth)/2 + options.pageWidth + options.offsetx
        , controly = $window.scrollTop() + $window.height() - $control.height() - options.offsety;

      ($window.width() > options.pageWidth + 2*$control.width()) ? $control.css({left: controlx + 'px'}) : $control.css({left: $window.width()-$control.width()});

      !$cssfixedsupport && $control.css({top: $controly + 'px'})
    };

    var togglecontrol = function(){
      var scrolltop = $(window).scrollTop();
      !$cssfixedsupport && keepfixed();
      state.shouldvisible = (scrolltop >= options.startline) ? true : false;
      if (state.shouldvisible && !state.isvisible) {
        $control.stop().fadeIn(options.fadeduration[0]);
        state.isvisible = true;
      } else if (state.shouldvisible == false && state.isvisible) {
        $control.stop().fadeOut(options.fadeduration[1]);
        state.isvisible = false;
      }
    };
    
    return init();
  };

}(window.jQuery);
