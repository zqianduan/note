/**
 * 光标基本方法整理
 * Author: xiejiancong.com
 * Date: 2013-01-09
 */
// 在光标位置插入文字
function insertText(obj, str){
  obj.focus();
  if(document.selection){
    // sel 是返回的对象，其中text值为选择的文本
    var sel = document.selection.createRange();
    //for(var key in sel)alert(key + ':' + sel[key]);
    // 把选中的文本用插入的值替换掉
    sel.text = str;
  }else if(typeof obj.selectionStart == 'number' && typeof obj.selectionEnd == 'number'){
    var startPos = obj.selectionStart
      , endPos = obj.selectionEnd
      , cursorPos = startPos
      , tmpStr = obj.value;

    obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
    cursorPos += str.length;
    obj.selectionStart = obj.selectionEnd = cursorPos;
  }else{
    obj.value += str;
  }
}

function moveEnd(obj){
  obj.focus();
  var len = obj.value.length;
  if (document.selection) {
    var sel = obj.createTextRange();
    sel.moveStart('character',len);
    sel.collapse();
    sel.select();
  }else if(typeof obj.selectionStart == 'number' && typeof obj.selectionEnd == 'number'){
    obj.selectionStart = obj.selectionEnd = len;
  }
}

// 获取光标位置
function getCursortPosition(ctrl){
  var CaretPos = 0;    
  if(document.selection){// IE Support
    ctrl.focus ();
    var Sel = document.selection.createRange ();
    Sel.moveStart('character', -ctrl.value.length);
    CaretPos = Sel.text.length - 1;
  }else if(ctrl.selectionStart || ctrl.selectionStart == '0'){// Firefox support
    CaretPos = ctrl.selectionStart;
  }

  return (CaretPos);
}

// 设置光标位置
function setCaretPosition(ctrl, pos){
  if(ctrl.setSelectionRange){
    ctrl.focus();
    ctrl.setSelectionRange(pos,pos);
  }else if(ctrl.createTextRange){
    var range = ctrl.createTextRange();
    range.collapse(true);
    range.moveEnd('character', pos);
    range.moveStart('character', pos);
    range.select();
  }

  ctrl.focus();
}

// 获取光标位置以及选中的文字
function getCursorPosition(id){
  var textarea = document.getElementById(id);
  var rangeData = { text: "", start: 0, end: 0 };
  textarea.focus();
  if(textarea.setSelectionRange){ // W3C
    rangeData.start = textarea.selectionStart;
    rangeData.end = textarea.selectionEnd;
    rangeData.text = (rangeData.start != rangeData.end) ? textarea.value.substring(rangeData.start, rangeData.end) : "";
  }else if(document.selection){ // IE
    var i
      , oS = document.selection.createRange()
      , oR = document.body.createTextRange();

    oR.moveToElementText(textarea);
    rangeData.text = oS.text;
    rangeData.bookmark = oS.getBookmark();
    for(i = 0; oR.compareEndPoints('StartToStart', oS) < 0 && oS.moveStart("character", -1) !== 0; i++){
      if(textarea.value.charAt(i) == '\n'){
        i++;
      }
    }
    rangeData.start = i;
    rangeData.end = rangeData.text.length + rangeData.start;
  }
  return rangeData;
}

