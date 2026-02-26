/**
 * jQuery Tab plugin
 * Author: jimco@color7.net
 */
!function($){

  "use strict";

  var xy = xy || {};

  xy.Tab = function( element, options ){
    this.options = $.extend({}, $.fn.tab.defaults, options);
    this.$element = $(element);
    this.tabBox = this.$element.children('div.tab_box').children('div');
    this.menu = this.$element.children('ul.tab_menu');
    this.items = this.menu.find('li');
    this.init();
  }

  xy.Tab.prototype = {

    constructor: xy.Tab,

    init: function(){

      var me = this
        , $elem = this.$element
        , options = this.options;

      me.items.bind( options.event, function(){
        me.delay( $elem, options.timeout );
        if( options.callback ){
          options.callback( $elem );
        }
      });
      
      if( options.auto ){
        me.start();
        $elem.hover(function(){
          clearInterval( me.timer );
          me.timer = undefined;
        },function(){
          me.start();
        });
      }
      
      return this;

    },

    tabHandle: function(elem){
      console.log("123123")
      elem.siblings( 'li' )
        .removeClass( 'current' )
        .end()
        .addClass( 'current' );
        
      this.tabBox.siblings( 'div' )
        .addClass( 'hide' )
        .end()
        .eq( elem.index() )
        .removeClass( 'hide' );
    },

    delay: function(){
      var me = this
        , time = this.options.timeout;
      time ? setTimeout( function(){ me.tabHandle(me.items) }, time) : me.tabHandle(me.items)
    },

    start: function(){
      var me = this 
        , auto = this.options.auto
      if( !auto ) return;
      me.timer = setInterval( me.autoRun, auto )
    },

    autoRun: function(){
      var current = this.menu.find( 'li.current' )
        , firstItem = items.eq(0)
        , len = items.length
        , index = current.index() + 1
        , item = index === len ? firstItem : current.next( 'li' )
        , i = index === len ? 0 : index;
      
      current.removeClass( 'current' );
      item.addClass( 'current' );
      
      tabBox.siblings( 'div' )
        .addClass( 'hide' )
        .end()
        .eq(i)
        .removeClass( 'hide' );
    }

  }

  $.fn.tab = function(option){
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tab')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tab', (data = new xy.Tab(this, options)))
      if (typeof option == 'string') data[option]()
    })

  }

  $.fn.tab.Constructor = xy.Tab

  $.fn.tab.defaults = {
    event: "mouseover",
    timeout: 0,
    auto: 0,
    callback: null
  }

  $(function () {
    $('body').on('click.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
      e.preventDefault()
      $(this).tab('show')
    })
  })

}(jQuery)
