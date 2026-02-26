/**
 * Promise
 */
(function(exports){

  function Promise(){
    var me = this;
    this.pending = [];

    this.resolve = function(result){
      me.complete('resolve', result);
    }

    this.reject = function(result){
      me.complete('reject', result);
    }
  };

  Promise.prototype = {
    then: function(success, failure){
      this.pending.push({ resolve: success, reject: failure });
      return this;
    },

    complete: function(type, result){
      while(this.pending[0]){
        this.pending.shift()[type](result);
      }
    }
  };

  exports.Promise = Promise;

})(this);