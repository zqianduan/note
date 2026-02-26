/**
 * iframe 跨域通信兼容性解决方案
 * IE8+ 使用 postMessage API。IE6/7 ，利用 navigator 对象在父窗口和 iframe 之间是共享的。
 */
window.Message = (function(){
  var prefix = '[PROJECT_NAME]'
    , supportPostMessage = 'postMessage' in window;

  // Target 类， 消息对象
  function Target(target, name){
    var errMsg = '';

    if(arguments.length < 2){
      errMsg = 'target error - target and name are both required';
    }
    else if(typeof target != 'object'){
      errMsg = 'target error - target itself must be window object';
    }
    else if(typeof name != 'string'){
      errMsg = 'target error - target name must be string type';
    }

    if(errMsg) throw new Error(errMsg);

    this.target = target;
    this.name = name;
  }

  if(supportPostMessage){ // IE8+ 及现代浏览器
    Target.prototype.send = function(msg){
      this.target.postMessage(prefix + msg, '*');
    }
  }
  else{ // 兼容 IE6/7
    Target.prototype.send = function(msg){
      var targetFunc = window.navigator[prefix + this.name];

      if(typeof targetFunc == 'function'){
        targetFunc(prefix + msg, window);
      }
      else{
        throw new Error('target callback function is not defined');
      }
    }
  }

  // 信使类
  function Messager(name){
    this.targets = {};
    this.name = name;
    this.listenFunc = [];
    this.initListen();
  }

  Messager.prototype.addTarget = function(target, name){
    var targetObj = new Target(target, name);
    this.targets[name] = targetObj;
  }

  Messager.prototype.initListen = function(){
    var me = this
      , generalCallback = function(msg){
          if(typeof msg == 'object' && msg.data){
            msg = msg.data;
          }

          msg = msg.slice(prefix.length);
          for(var i = 0; i < me.listenFunc.length; i++){
            me.listenFunc[i](msg);
          }
        };

    if(supportPostMessage){
      if('addEventListener' in document){
        window.addEventListener('message', generalCallback, false);
      }
      else if('attachEvent' in document){
        window.attachEvent('onmessage', generalCallback);
      }
    }
    else{
      window.navigator[prefix + this.name] = generalCallback;
    }
  }

  Messager.prototype.listen = function(callback){
    this.listenFunc.push(callback);
  }

  Messager.prototype.clear = function(){
    this.listenFunc = [];
  }

  Messager.prototype.send = function(msg){
    var targets = this.targets
      , target;

    for(target in targets){
      if(targets.hasOwnProperty(target)){
        targets[target].send(msg);
      }
    }
  }

  return Messager;

})();