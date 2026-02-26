/*
 * jQuery 插件两种写法
 *
*/

(function($){
  $.fn.plugin = function(settings){
    //默认参数
    var defaultSettings = {
 
    }
       
    /* 合并默认参数和用户自定义参数 */
    settings = $.extend(defaultSettings,settings);

    return this.each(function(){
      //代码
    });
       
  }

})(window.jQuery);


(function($){
  
  var Plugin = function( element, option ){
    //this.init( element, options)
  }

  Plugin.prototype = {
    Constructor: Plugin,
    //插件方法
  }

  $.fn.plugin = function( option ){

  }

  $.fn.plugin.Constructor = Plugin;

  $.fn.plugin.defaults = {
    //插件默认参数
  }


})(window.jQuery);


