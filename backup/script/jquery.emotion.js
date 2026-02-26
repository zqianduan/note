/**
 *  Emotion plugin v1.0
 *  Author: xiejiancong.com
 *  Date: 2012-09-12
 * 
 * 参数设置
 *  facePath:       // 表情图片文件夹路径
 *  faceWrap:       // 控制表情弹层ID
 *  targetArea:     // 目标文本框 selector( jQuery选择器 )
 *  decodeAera:     // 表情字符转换成表情图片的区域
 *  offset:         // 表情弹层的相对位置
 *  tpl:            // 
 *  faceType: 
 *
 *
 * eg: 
 *  1、$([selector]).emotion( options )
 *  2、用 data 来控制，在需要调用表情的元素上加上 data-xy="emotion"
 *
 */

!function($){

  "use strict";

  var xy = xy || {}

  xy.Emotion = function( element, options ){
    this.element = $(element); //.on("click.emotion.data-api", $.proxy(this.init, this))
    this.isSmilesShow = false;
    this.options = $.extend({}, $.fn.emotion.defaults, options);
    this.init();
  }

  xy.Emotion.prototype = {

    constructor: xy.Emotion,

    // 初始化插件时执行init
    init: function(){

      var me = this
        , $element = this.element
        , decodeArea = this.options.decodeArea

      $element.on("click.emotion.data-api", function(e){

        me.isSmilesShow ? me.toggleFace("#xyEmotion") : me.show();
        me.setPosition( me.options.offset );
        e.stopPropagation();
      })

      $("html, body, document").on("click.emotion.data-api", function(e){
        me.isSmilesShow && $("#xyEmotion").hide();
      })

      // hacky: 是否应该抽象 ？
      $("input[type='button']").on("click", function(){
        $("#content1").val().length && $("#result").html( $("#content1").val() );
        $("#content1").val("");
        me.textToFace( decodeArea );
      })

      this.textToFace( decodeArea )

    },

    //获取表情文字
    getFaceText: function( type, id ){
      var faceType = this.options.faceType, faceText;
      $.each(faceType, function( i, ele ){
        faceText = type == ele.type && "[" + ele.data[id] + "]";
      })
      return faceText;
    },

    //表情弹层
    show: function(){

      var me = this
        , $element = $(me.element)
        , $tpl = $(me.options.tpl)
        , pos = me.options.offset
        , facePath = me.options.facePath;

      $.each(me.options.faceType, function(i, ele){
        var $eachFace = $("<ul />", { "id": ele.type });

        $tpl.append($("<span />", {
          "text": ele.name,
          "click": function(){
            me.changeFace( ele.type );
          }
        }));

        (i == 0) ? $eachFace.css("display", "block") : $eachFace.css("display", "none");

        $.each(ele.data, function(j, data){
          var $li = $("<li />")
            , $img = $("<img />", {
              "src": facePath + ele.imgPath + (j+1) + ele.imgSuffix,
              "alt": data,
              "title": data,
              "height": "22px",
              "width": "22px",
              "click": function(e){
                me.addText( ele.type, j );
                me.toggleFace( $tpl );
                e.stopPropagation();
              }
            })
          $li.append($img);
          $eachFace.append($li);
        })

        $tpl.append($eachFace);
      });

      $tpl.appendTo( document.body );

      me.isSmilesShow = true;

    },

    //隐藏表情层
    toggleFace: function( ele ){
      $(ele).toggle();
    },

    //设置表情弹层位置
    setPosition: function( pos ){

      var me = this
        , currentPos = me.element.offset()
        , top = currentPos.top + pos.top + this.element.outerHeight()
        , left = currentPos.left + pos.left;

      $("#xyEmotion").css({position: "absolute", top: top, left: left});
 
    },

    //切换表情类型
    changeFace: function(){
      console.log("changeFace")
    },

    //向文本框插入表情
    addText: function(type, id){
      var $targetArea = $( this.options.targetArea )
        , text = this.getFaceText(type, id)
        , textLength = $targetArea.val.length
        , selection = this.getSelected( $targetArea );

      text = $targetArea.val().substring(0, selection.start) + text;

      $targetArea.val( text );
      this.setCursor($targetArea, selection.start + text.length);
    },

    //将表情代码替换为文字
    faceToText: function( str ){
      return str.replace(/[[^\]^]*/g, "");
    },

    //获取光标在文本框中的位置
    getSelected: function( textArea ){
      var textArea = textArea.get(0), s, e, range, stored_range;
      if ( $.browser.msie ){
        var selection = document.selection;
        textArea.focus();
        range = selection.createRange();
        stored_range = range.duplicate();
        stored_range.moveToElementText(textArea);
        stored_range.setEndPoint('EndToEnd', range);
        s = stored_range.text.length - range.text.length;
        e = s + range.text.length;
        textArea.blur();
      } else {
        s = textArea.selectionStart;
        e = textArea.selectionEnd;
      }
      return {
        start : s,
        end : e
      }
    },

    //设置文本框焦点位置
    setCursor: function( textArea, end ){
      var textArea = textArea.get(0);

      end = end == null ? textArea.val().length : end;

      textArea.focus();

      if (textArea.createTextRange){ //for IE
        var range = textArea.createTextRange();
        range.move("character", end);
        range.select();
      }else{
        textArea.setSelectionRange(end, end);
      }
    },

    //表情文字与表情路径的键值对
    faceMap: function(){
      var faceMap = {}
        , facePath = this.options.facePath;
      $.each(this.options.faceType, function( i, face ){
        $.each(face.data, function( j, text ){
          faceMap[text] = facePath + face.imgPath + ( j + 1 ) + face.imgSuffix;
        })
      })
      return faceMap;
    },

    //表情字符替换成表情图片
    textToFace: function( decodeArea ){
      var me = this
        , $faceContainers = $(decodeArea)
        , faceMap = me.faceMap();

      if( !$faceContainers.length) return 

      $faceContainers.each(function(i, ele){
        var $ele = $(ele);

        $ele.html($ele.html().replace(/\[([\u4e00-\u9fa5\s\w]*)\]/g, function(text){
          var faceText = me.faceToText(text);
          return !faceMap[faceText] ? text : "<img src='" + faceMap[faceText] + "' title='" + faceText + "' alt='" + faceText + "' />" 
        }))
      })
    }

  }

  $.fn.emotion = function( option ){
    var $this = $(this)
        , data = $this.data('emotion')
        , options = typeof option == 'object' && option;

    if (!data) $this.data('emotion', (data = new xy.Emotion(this, options)));
    if (typeof option == 'string') data[option]()
    else if (options.decodeFace) data.decodeFace()
  }

  $.fn.emotion.Constructor = xy.Emotion

  $.fn.emotion.defaults = {
    facePath: "../emotion/smiles/", //表情图片路径
    faceWrap: "xyEmotion",               // 表情弹层ID
    targetArea: "#content1",             // 目标文本框 selector
    decodeArea: "#result",               // 需要将表情字符转换成表情图片的区域 selector
    offset: { "left": 0, "top": 0 },     // 表情弹层相对于触发元素的位置
    showEvent: "click",                  // ** 暂未做扩展 **
    delay: 0,                            // ** 暂未做扩展 **
    tpl: "<div id='xyEmotion'></div>",   // 弹层wrapper
    faceType: [{
      "type": "default",
      "name": "默认",
      "imgPath": "default/",      
      "imgSuffix": ".gif",
      "data": [ "呵呵", "嘻嘻", "哈哈", "可爱", "可怜", "挖鼻屎", "吃惊", "害羞", "挤眼", "闭嘴", "鄙视", "爱你", "泪", "偷笑", "亲亲", "生病", "太开心", "懒得理你", "右哼哼", "左哼哼", "嘘", "衰", "委屈", "吐", "打哈欠", "抱抱", "怒", "疑问", "馋嘴", "拜拜", "思考", "汗", "困", "睡觉", "钱", "失望", "酷", "花心", "哼", "鼓掌", "晕", "悲伤", "抓狂", "黑线", "阴险", "怒骂", "OK", "耶", "good", "不要", "赞", "来", "弱", "伤心", "心", "给力", "威武", "囧", "礼物", "蛋糕" ]
    }]                                   // 表情数组
  }

  //emotion data-api
  $(window).on("load", function(e){
    $('[data-xy="emotion"]').each(function(){
      var $xy = $(this)
        , data = $xy.data()

      $xy.emotion( data )
    })
  })

}(window.jQuery);
