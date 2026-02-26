/**
 * fun.base 
 * 2012-09-21
 */

// 在一定范围内产生随机整数
function rand( minDit , maxDit ) {
  return Math.floor(Math.random() * (maxDit - minDit + 1)) + minDit;
};

// 获取屏幕可视范围的尺寸。
function getViewSize(){
  var de = document.documentElement;
  var db = document.body;
  var viewW = de.clientWidth == 0 ?  db.clientWidth : de.clientWidth;
  var viewH = de.clientHeight == 0 ?  db.clientHeight : de.clientHeight;
  return Array(viewW ,viewH);
};

