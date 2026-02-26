/**
 * 简单事件队列管理(可处理延时)
 */
var Q = {
    
    a: [], // 保存队列信息

    q: function(d){
      if(!/function|number/.test(typeof d)) return;

      Q.a.push(d);
      return Q;
    },

    d: function(){
      var s = Q.a.shift();

      if(!s) return;

      if(typeof s === 'function'){
        s();
        Q.d();
        return;
      }

      setTimeout(function(){
        Q.d();  
      }, s);
    }
  };

/**
 * 短小强悍的 Javascript 异步调用库
 */
var queue = function(funcs, scope){
  (function next(){
    if(funcs.length > 0){
      funcs.shift().apply(scope || {}, [next].concat(Array.prototype.slice.call(arguments, 0)));
    }
  })();
};

/**
  Example: 

  var obj = { value: null };   
  queue([
    function(callback){
      var me = this;
      setTimeout(function(){
        me.value = 10;
        callback(20);
      });
    },
    function(callback, add){
      console.log(this.value + add);
      callback();
    },
    function(){
      console.log(obj.value);
    }
  ], obj);

 */