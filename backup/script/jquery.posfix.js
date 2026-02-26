/* 
 * 滚动条随动提示插件
 * 调用方法：
 * 1、在 html 标签中增加 data-fix="posfix" 属性，位置可用 data-offset-top、data-offset-left 控制
 * 2、直接 js 调用 $([selector]).posfix([option])
 */
!(function($){

  "use strict"

  //namespace
  var xy = xy || {};

  //Posfix class definition
  xy.Posfix = function(element, options){
    this.$element = $(element);
    this.$window = $(window).on("scroll.posfix.data-api resize.posfix.data-api", $.proxy(this.fixPosition, this));
    this.options = $.extend({}, $.fn.posfix.defaults, options);
    this.fixPosition();
  }

  xy.Posfix.prototype.fixPosition = function(evt){
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
      , scrollTop = this.$window.scrollTop()
      , position = this.$element.offset()
      , offsetLeft = this.options.offsetLeft
      , offsetTop = this.options.offsetTop
      , pageWidth = this.options.pageWidth || $(document).width()
      , resizeLeft = ( this.$window.width() - pageWidth )/2 + offsetLeft
      , posfix;

    this.$element.css({position: "fixed", top: offsetTop, left: offsetLeft});

    if( !evt ) return;

    posfix = ( evt.type == "resize" ) ? {position: "fixed", top: offsetTop, left: resizeLeft} : ( scrollTop < offsetTop ) ? {position: "absolute", top: offsetTop, left: offsetLeft} : window.XMLHttpRequest ? {position: "fixed", top: 0, left: offsetLeft} : {position: "absolute", top: scrollTop, left: offsetLeft};

    this.$element.css( posfix );

  }

  //posfix plugin definition
  $.fn.posfix = function(option){
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('posfix')
        , options = typeof option == 'object' && option;

      if (!data) $this.data('posfix', (data = new xy.Posfix(this, options)));
      if (typeof option == 'string') data[option]();
    })
  }

  $.fn.posfix.Constructor = xy.Posfix

  $.fn.posfix.defaults = {
    offsetTop: 0,
    offsetLeft: 0,
    pageWidth: 0,
    destroy: false
  }

  //posfix data-api
  $(window).on("load", function(){
    $("[data-xy='posfix']").each(function(){
      var $xy = $(this)
        , data = $xy.data();

      $xy.posfix(data);
    });
  });

})(window.jQuery);
