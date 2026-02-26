/*
*http://www.xiejiancong.com/
*/
$(function($){
  //右键菜单
  $("#spig").mousedown(function (evt) {
    if(evt.which==3){
      showMessage("秘密通道:<br /><a href=\"http://www.xiejiancong.com/feed/\" title=\"订阅\">订阅</a>    <a href=\"http://www.xiejiancong.com\" title=\"首页\">首页</a>    <a href=\"http://www.xiejiancong.com/search\" title=\"搜索\">搜索</a>    <a href=\"http://www.xiejiancong.com/admin/\" title=\"管理\">管理</a>    <a href=\"http://www.baidu.com/\" title=\"\">百度</a>",10000);
    }
  });
  $("#spig").bind("contextmenu", function(e) {
    return false;
  });

  //鼠标在消息上时
  $("#message").hover(function(evt){
    $(evt).currentTatget.fadeTo("100",1)
  });

  //鼠标hover随机消息
  $(".pig").mouseover(function () {
    $(".pig").fadeTo("300", 0.3);
    msgs = ["我隐身了，你看不到我", "我会隐身哦！嘿嘿！", "别动手动脚的，把手拿开！", "把手拿开我才出来！"];
    var i = Math.floor(Math.random() * msgs.length);
    showMessage(msgs[i]);
  });
  $(".pig").mouseout(function () {
    $(".pig").fadeTo("300", 1)
  });

  //开始
  if (isindex) { //如果是主页
    var now = (new Date()).getHours();
    if (now > 0 && now <= 6) {
      showMessage(vistor + ' 你是夜猫子呀？还不睡觉，明天起的来么你？', 6000);
    }else if (now > 6 && now <= 11) {
      showMessage(vistor + ' 早上好，早起的鸟儿有虫吃噢！早起的虫儿被鸟吃，你是鸟儿还是虫儿？嘻嘻！', 6000);
    }else if (now > 11 && now <= 14) {
      showMessage(vistor + ' 中午了，吃饭了么？不要饿着了，饿死了谁来挺我呀！', 6000);
    }else if (now > 14 && now <= 18) {
      showMessage(vistor + ' 中午的时光真难熬！还好有你在！', 6000);
    }else {
      showMessage(vistor + ' 快来逗我玩吧！', 6000);
    }
  }else{
    showMessage('欢迎' + vistor + '来到￥前端那些事儿￥阅读《' + title + '》', 6000);
  }
  $(".spig").animate({
      top: $(".spig").offset().top + 300,
      left: document.body.offsetWidth - 200
  },{
    queue: false,
    duration: 1000
  });

  //鼠标在内页元素上的状态
  $('.title a').click(function () {//标题被点击时
    showMessage('正在用吃奶的劲加载《<span style="font-style:italic;">' + $(this).text() + '</span>》请稍候');
    $(this).text('看灰机，灰过来，灰过去，呀~灰走了...');
  });
  $('.title a,.one li a').mouseover(function () {
    showMessage('要看看《<span style="font-style:italic;">' + $(this).text() + '</span>》这篇文章么？');
  });
  $('.recentcomments li').mouseover(function () {
    showMessage('伟大的 <span style="font-style:italic;">' + $(this).children(".comment_author").text() + '</span>' + $(this).children(".comment_content").text());
  });
  // $('.menuheader').mouseover(function () {
  //   showMessage("可以折叠的哦！点下试试");
  // });
  // $('.ad').mouseover(function () {
  //   showMessage("Google的给力广告！有空点点！~");
  // });
  // $('.post-title').mouseover(function () {
  //     showMessage("显示隐藏文章内容！");
  // });
  $('.cat-item').mouseover(function () {
      showMessage('查看 <span style="font-style:italic;">' + $(this).text() + '</span> 下所有文章');
  });
  $('.link li a').mouseover(function () {
    showMessage('去 <span style="font-style:italic;">' + $(this).text() + '</span> 逛逛');
  });
  $('.addcomments').mouseover(function () {
    showMessage('<span style="font-style:italic;">' + vistor + '</span> 向评论栏出发吧！');
  });
  // $('#input_search').mouseover(function () {
  //   showMessage("Google 给力站内搜索，搜遍每一个角落！");
  // });
  // $('#birthday').mouseover(function () {
  //   showMessage('我已经' + dni + '天了！我还小，需要你多多照顾！');
  // });
  // $('#submit').mouseover(function () {
  //     showMessage('确认提交了么？');
  // });
  
  //随机显示消息
  window.setInterval(function () {
    msgs = ["播报明日天气<iframe name=\"xidie\" src=\"http://t.xidie.com/skin/2010-0601.html\"frameborder=\“0\” scrolling=\"no\" height=\"15px\"  width=\"130px\" allowtransparency=\"true\" ></iframe>", "陪我聊天吧！", "<a href=\"http://www.xiejiancong.com/feed/\" target=\"_blank\" rel=\"external\" tip=\"Feed\"><img border=\"0\" title=\"订阅前端那些事儿\" alt=\"Feed\" src=\"rss.png\"></a>", "好无聊哦，你都不陪我玩！", "…@……!………", "^%#&*!@*(&#)(!)(", "我可爱吧！嘻嘻!~^_^!~~","谁淫荡呀?~谁淫荡?，你淫荡呀!~~你淫荡！~~","从前有座山，山上有座庙，庙里有个老和尚给小和尚讲故事，讲：“从前有座……”"];
    var i = Math.floor(Math.random() * msgs.length);
    showMessage(msgs[i], 10000);
    }, 35000);

  //随机移动，显示消息
  window.setInterval(function () {
    msgs = ["播报明日天气<iframe name=\"xidie\" src=\"http://t.xidie.com/skin/2010-0601.html\"frameborder=\“0\” scrolling=\"no\" height=\"15px\"  width=\"130px\" allowtransparency=\"true\" ></iframe>", "快快订阅我的博客吧！<a href=\"http://www.xiejiancong.com/feed/\" target=\"_blank\" rel=\"external\" tip=\"Feed\"><img border=\"0\" title=\"订阅前端那些事儿\" alt=\"Feed\" src=\"rss.png\"></a>", "乾坤大挪移！", "我飘过来了！~", "我飘过去了", "德尔一个飘！~飘！~"];
    var i = Math.floor(Math.random() * msgs.length);
    s = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6,0.7,0.75,-0.1, -0.2, -0.3, -0.4, -0.5, -0.6,-0.7,-0.75];
    var i1 = Math.floor(Math.random() * s.length);
    var i2 = Math.floor(Math.random() * s.length);
    $(".spig").animate({
      left: document.body.offsetWidth/2*(1+s[i1]),
      top:  document.body.offsetheight/2*(1+s[i1])
    },{
      duration: 2000,
      complete: showMessage(msgs[i])
    });
  }, 45000);

  //评论相关
  $(".author").click(function () {
    showMessage("留下你的尊姓大名！");
    $(".spig").animate({
        top: a(".author").offset().top - 70,
        left: a(".author").offset().left - 170
    },{
      queue: false,
      duration: 1000
    });
  });
  $(".mail").click(function () {
    showMessage("留下你的邮箱，不然就是无头像人士了！");
    $(".spig").animate({
        top: $(".mail").offset().top - 70,
        left: $(".mail").offset().left - 170
    },{
      queue: false,
      duration: 1000
    });
  });
  $(".url").click(function () {
    showMessage("快快告诉我你的家在哪里，好让我去参观参观！");
    $(".spig").animate({
        top: $(".url").offset().top - 70,
        left: $(".url").offset().left - 170
    },{
      queue: false,
      duration: 1000
    });
  });
  $("#comment").click(function () {
    showMessage("认真填写哦！不然会被认作垃圾评论的！我的乖乖~");
    $(".spig").animate({
      top: $("#comment").offset().top - 70,
      left: $("#comment").offset().left - 170
    },{
      queue: false,
      duration: 1000
    });
  });

  //滚动条随动
  var spig_top = 50;
    var f = $(".spig").offset().top;
    $("#shang,#xia").click(function () {
      gds = ["等等我呀！", "跑不动啦！累死我了!", "站住，不要跑！@_@"];
      var gd = Math.floor(Math.random() * gds.length);
      showMessage(gds[gd], 5000);
    });
    $("#comt").click(function () {
      gds = ["快去凑热闹哦", "围观去咯", "看看评论去！"];
      var gd = Math.floor(Math.random() * gds.length);
      showMessage(gds[gd], 5000);
    });
    $(window).scroll(function () {
      $(".spig").animate({
        top: $(window).scrollTop() + f +300
      },{
        queue: false,
        duration: 1000
      });
    });

    //鼠标点击
    var stat_click = 0;
    $(".pig").click(function () {
      if (!ismove) {
        stat_click++;
        if (stat_click > 10) {
          msgs = ["你有完没完呀？", "你已经摸我" + stat_click + "次了", "非礼呀！救命！OH，My ladygaga"];
          var i = Math.floor(Math.random() * msgs.length);
          //showMessage(msgs[i]);
        } else {
          msgs = ["筋斗云！~我飞！", "我跑呀跑呀跑！~~", "别摸我，大男人，有什么好摸的！", "惹不起你，我还躲不起你么？", "不要摸我了，我会告诉老婆来打你的！", "干嘛动我呀！小心我咬你！"];
          var i = Math.floor(Math.random() * msgs.length);
          //showMessage(msgs[i]);
        }
        s = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6,0.7,0.75,-0.1, -0.2, -0.3, -0.4, -0.5, -0.6,-0.7,-0.75];
        var i1 = Math.floor(Math.random() * s.length);
        var i2 = Math.floor(Math.random() * s.length);
        $(".spig").animate({
          left: document.body.offsetWidth/2*(1+s[i1]),
          top:  document.body.offsetheight/2*(1+s[i1])
        },{
          duration: 500,
          complete: showMessage(msgs[i])
        });
      } else {
        ismove = false;
      }
    });
});

//显示消息函数 
function showMessage(a, b) {
  if (b == null) b = 10000;
  $("#message").hide().stop();
  $("#message").html(a);
  $("#message").fadeIn();
  $("#message").fadeTo("1", 1);
  $("#message").fadeOut(b);
};

//拖动
var _move = false;
var ismove = false; //移动标记
var _x, _y; //鼠标离控件左上角的相对位置
$(document).ready(function () {
  $("#spig").mousedown(function (e) {
    _move = true;
    _x = e.pageX - parseInt($("#spig").css("left"));
    _y = e.pageY - parseInt($("#spig").css("top"));
 });
  $(document).mousemove(function (e) {
    if (_move) {
      var x = e.pageX - _x; 
      var y = e.pageY - _y;
      $("#spig").css({
        top: y,
        left: x
      }); //控件新位置
      ismove = true;
    }
  }).mouseup(function () {
    _move = false;
  });
});