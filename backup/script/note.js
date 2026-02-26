window.console || (console = { log: function(){}, dir: function(){}, error: function(){} });

/**
 * 观察者模式
 * eg: 猫叫、老鼠跑、主人醒
 */
(function(window, undefined){

  var air = function(){

    var events = {
      SubjectEvent: [] //订阅者的注册事件，当有情况时触发这些事件
    }

    this.addSubjectEvent = function(e){
      events.SubjectEvent.push(e);
      console.log('观察者接收了一个注册事件，待处理事件数：' + events.SubjectEvent.length);
    }

    this.sendSound = function(info){
      console.log('观察者开始传递声音，待处理事件数：' + events.SubjectEvent.length);
      Notify(info);
    }

    var Notify = function(info){
      for(var i = 0; i < events.SubjectEvent.length; i++){
        var sound = '';
        if(typeof info.Sound != 'undefined'){
          sound = info.Sound;
        }
        console.log('观察者发出了一个通知：——' + sound);
        events.SubjectEvent[i](info);
      }
    }
  }

  var cat = function(name){
    var name = name;
    this.sendSound;
    this.cry = function(){
      console.log(name + '开始喵喵叫~');
      if(this.sendSound != 'undefined'){
        console.log('声音传递出去了~');
        this.sendSound({Sound: '喵喵叫~', Volume: 3});
      }
    }

    console.log('我是' + name + '，有人摸俺俺就叫~');
  }

  var mouse = function(name){
    var _self = this 
      , name = name;

    this.sendSound;
    this.run = function(info){
      console.log(name + '听到了声音。');
      if(typeof info.Sound != 'undefined'){
        if(info.Sound == '自己跑'){
          console.log('听到自己跑的声音')
        }else{
          console.log(name + '开始狂飙！');
          if(typeof _self.sendSound != 'undefined'){
            console.log(name + '狂飙发出了声音。');
            _self.sendSound({Sound: '自己跑', Volume: 7});
          }
        }
      }
    }
    console.log('我是' + name + '，出来找吃的~');
  }

  var person = function(name){
    var name = name
      , isWake = false;

    this.sendSound;

    this.hearSound = function(info){
      if(isWake){
        console.log(name + '已经醒了');
      }else{
        if(typeof info.Volume != 'undefined'){
          if(info.Volume <= 5){
            console.log('声音小，' + name + '继续睡觉~');
          }else{
            console.log('声音大，' + name + '被吵醒！');
            isWake = true;
          }
        }
      }
    }
    console.log('我是' + name + '，俺睡着了~');
  }

  var myAir = new air();
  var tom = new cat('小喵汤姆');
  var jerry = new mouse('小老鼠杰瑞');
  var longtao = new mouse('可怜的龙套');
  var master = new person('小主');

  window.onload = function(){
    tom.sendSound = myAir.sendSound;
    jerry.sendSound = myAir.sendSound;
    longtao.sendSound = myAir.sendSound;

    myAir.addSubjectEvent(jerry.run);
    myAir.addSubjectEvent(master.hearSound);
  }

  window.tom = tom;

})(window);

/**
 * 职责链模式
 */
Function.prototype.before = function(func){
  var __self = this;
  return function(){
    if(fun.apply(this, arguments) === false){
      return false;
    }
    return __self.apply(this, arguments);
  }
};

Function.prototype.after = function(func){
  var  __self = this;
  return function(){
    var ret = __self.apply(this, arguments);
    
    if(ret) return ret;
    return func.apply(this, arguments);
  }
};


/**   
 * 对Date的扩展，将 Date 转化为指定格式的String   
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符   
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
 * eg:   
 * (new Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04   
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04   
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04   
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18   
 */
Date.prototype.pattern = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份     
    "d+": this.getDate(), //日     
    "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时     
    "H+": this.getHours(), //小时     
    "m+": this.getMinutes(), //分     
    "s+": this.getSeconds(), //秒     
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度     
    "S": this.getMilliseconds() //毫秒     
  };
  var week = {
    "0": "\u65e5",
    "1": "\u4e00",
    "2": "\u4e8c",
    "3": "\u4e09",
    "4": "\u56db",
    "5": "\u4e94",
    "6": "\u516d"
  };
  if(/(y+)/.test(fmt)){
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  if(/(E+)/.test(fmt)){
    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
  }
  for(var k in o){
    if(new RegExp("(" + k + ")").test(fmt)){
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
};


/**
 * 观察者模式
 */
var observer = {
  subscribers: {},

  on: function(event, callback, context){
    this.subscribers[event] = this.subscribers[event] || [];
    this.subscribers[event].push({
      callback: callback,
      context: context
    });
  },

  off: function(event, callback, context){
    var idx, subs, sub;
    if((subs = subscribers[event])){
      idx = subs.length - 1;
      while(idx >= 0){
        sub = subs[event][idx];
        if(sub.callback === callback && (!context || sub.context === context)){
          subs[event].splice(idx, 1);
          break;
        }
        idx--;
      }
    }
  },

  emit: function(event){
    var idx = 0
      , args = Array.prototype.slice.call(arguments, 1)
      , subs, sub;

    if((subs = this.subscribers[event])){
      while(idx < subs.length){
        sub = subs[idx];
        sub.callback.apply(sub.context || this, args);
        idx++;
      }
    }
  }
};


/**
 * 创建命名空间
 */
var XY = (function(window, XY, undefined){

  XY.createNamespace = function(){
    var args = arguments
      , space = null
      , arr, i, j, l;

    for(i = 0, args.length; i < l; i++){
      arr = ('' + args[i]).split('.');
      space = XY;
      for(j = 'XY' === arr[0] ? 1 : 0; j < arr.length; j++){
        XY[arr[j]] = XY[arr[j]] || {};
        space = space[arr[j]];
      }
    }
    return space;
  };

  return XY;
})(window, window.XY || {});


/**
 * 观察者模式2
 */
var pubsub = (function(window, pubsub, undefined){

  var topics = {}
    , subUid = -1;

  // 发布
  pubsub.publish = function(topic, args){
    if(!topics[topic]) return false;

    setTimeout(function(){
      var subscribers = topics[topic]
        , len = subscribers ? subscribers.length : 0;

      while(len--){
        // debugger;
        subscribers[len].func(topic, args);
      }
    }, 0);
  };

  // 订阅
  pubsub.subscribe = function(topic, func){
    if(!topics[topic]) topics[topic] = [];

    var token = (++subUid).toString();
    topics[topic].push({
      token: token,
      func: func
    });
    return token;
  };

  // 退订
  pubsub.unsubscribe = function(token){
    for(var m in topics){
      if(topics[m]){
        for(var i = 0, j = topics[m].length; i < j; i++){
          if(topics[m][i].token === token){
            topics[m].splice(i, 1);
            return token;
          }
        }
      }
    }
    return false;
  };

  return pubsub;

})(window, window.pubsub || {});


/**
 * 频率控制 返回函数连续调用时, fn执行频率限定为每多少时间执行一次
 * @param  {Function} fn        需要调用的函数
 * @param  {Number}   delay     延迟时间，单位毫秒
 * @param  {Bool}     immediate 给immediate参数传递false, 绑定的函数先执行，而不是delay后执行
 * @return {Function}           实际调用函数
 */
var throttle = function(fn, delay, immediate, debounce){
  var curr = +new Date()
    , last_call = 0
    , last_exec = 0
    , timer = null
    , diff, context, args
    , exec = function(){
      last_exec = curr;
      fn.apply(this, args);
    };

  return function(){
    curr = +new Date();
    context = this;
    args = arguments;
    diff = curr - (debounce ? last_call : last_exec) - delay;
    clearTimeout(timer);

    if(debounce){
      if(immediate){
        timer = setTimeout(exec, delay);
      }else{
        exec();
      }
    }else{
      if(diff >= 0){
        exec();
      }else if(immediate){
        timer = setTimeout(exec, -diff);
      }
    }
    last_call = curr;
  }
}

/**
 * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于delay, fn才会执行
 * @param  {Function} fn        要调用的函数
 * @param  {Number}   delay     空闲时间
 * @param  {Bool}     immediate 给immediate参数传递false, 绑定的函数先执行，而不是delay后执行
 * @return {Function}           实际调用函数
 */
var debounce = function(fn, delay, immediate){
  return throttle(fn, delay, immediate, true);
}



