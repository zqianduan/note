/**
 * flying plugin v1.0
 * 2012-09-21 
 *
 */
;(function($){
  // 飞行动画，先慢后快
  $.extend(jQuery.easing, {
    starFly: function (x, t, b, c, d) {
      return c*(t/=d)*t*t*t + b;
    }
  });
  
  $.fn.flyingLetter = function( option ){
    var $obj = $(this);
    var opts = $.extend({},$.fn.flyingLetter.defaults,option);    
    var viewSize ,maxWidth ,maxHeight;      
    checkSize();
    
    $(window).on("resize scroll", function(){
      checkSize();
    })

    fly() ;
    setInterval(function(){
      fly();
    }, opts.makeLetterInterval );
    
    return $obj ;
    
    function checkSize(){
      viewSize = getViewSize();
      maxWidth = viewSize[0];
      maxHeight = viewSize[1];
    };  
    
    function fly(){
      var html = '', xPos, rotate = 0, rotateStyle= '' ;
      for(var i=0; i < opts.makeLetterNum; i++){
        xPos = [ - opts.letterMaxSize[1], maxWidth - opts.letterMaxSize[1] - 20  ];
        rotate = rand(0, 359);
        rotateStyle = '-moz-transform:rotate('+rotate+'deg);-webkit-transform:rotate('+rotate+'deg);-o-transform:rotate('+rotate+'deg);transform:rotate('+rotate+'deg);';
        html += '<b class="flyingLetter-leter" status="start" xpos="'+ xPos.join(',') +'" style="left:'+ (maxWidth * 0.5) +'px;top:'+ (maxHeight * 0.35) +'px;'+rotateStyle+';position: fixed; _position:absolute; width:1px; height:1px; font-size:0; line-height:120%;color:#FFF; z-index:0;-webkit-text-size-adjust:none;">'+ randoms( 1, opts.letters ) +'</b>';
      }
      $obj.append(html).find('b[status=start]').each(function(){
        html = null ;
        var $this = $(this);
        xPos = $this.attr('xpos').split(',');
        $this.attr('status','run').css({ color : '#'+ randoms(6 , '0123456789ABCDEF' ),opacity: rand(opts.bright[0] * 10 , opts.bright[1] * 10 ) * 0.1 }).animate({
          top: rand( - Math.max( 200 , maxHeight * 0.2 ) , maxHeight - 10 ) ,
          left: xPos[rand(0,1)] ,
          fontSize: rand(opts.letterMaxSize[0] / 4 , opts.letterMaxSize[1] ) +'px'
        }, rand( opts.LetterFlyTime * 0.5, opts.LetterFlyTime * 4 ), 'starFly', function(){
          $this.remove();
        });
      });
    }
    
    function randoms( length , chars ) {
      length = length || 1 ;
      chars = chars || '0123456789abcdefghijklmnopqrstuvwxyz' ;
      var hash = '';
      var maxNum = chars.length;
      var num = 0;
      for( i = 0; i < length; i++ ) {
        num = rand( 0 , maxNum - 1 );
        hash += chars.slice( num , num + 1 );
      }
      return hash;
    }
  };

  $.fn.flyingLetter.defaults = {
    letters: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+{}|:";<>,?/♠♣♥￥§♦◊◦♣▣●❤●►◄▧▨♨◐◑☼♦♧♡♂♀♠♥❤☜☞☺☻▣▤▥▦▩◘★☆→あ￡Ю〓§♤▶✲❈➹{}※卐Ψ∪∩∈∏のぁ≮≯∮∝∞∧∨∑≤≥≈＜＞⊙●★☆■♀『』◆▲∑βγδεζηθικλμνξπρστυφψωЁБГДЕЗИ前端开发的那些事儿', //随机字母
    letterMaxSize: Array( 100 , 100 ), // letter最大尺寸，宽高
    bright: Array( 0.4 , 1 ) ,         // letter 亮度范围 
    LetterFlyTime: 12000 ,             // letter飞行的时间,单位 ms 。（决定letter飞行速度的快慢）
    makeLetterInterval: 2000 ,         // 制造letter时间间隔,单位 ms
    makeLetterNum: 2                   // 每次产生多少个letter
  };
})(window.jQuery);
