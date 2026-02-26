# 前端笔记

# 1. 基础数据结构与算法

## 简单排序算法的 js 实现

    Array.prototype.swap = function(i, j){
      var temp = this[i];
      this[i] = this[j];
      this[j] = temp;
    }

    /**
     * 快速排序
     * 基本思路：取数组中间索引的记录为基准元素，遍历把所有比基准元素小的记录放在前一部分，
     * 把所有比基准元素大的记录放在后一部分，递归遍历
     */
    function quickSort(arr){
      if(arr.length <= 1) return arr;

      var pivotIndex = Math.floor(arr.length/2)
        , pivot = arr.splice(pivotIndex, 1)[0]
        , left = []
        , right = [];

      for(var i = 0; i < arr.length; i++){
        if(arr[i] < pivot){
          left.push(arr[i]);
        }else{
          right.push(arr[i]);
        }
      }
      return quickSort(left).concat([pivot], quickSort(right));
    }

    /**
     * 插入排序
     * 基本思路：从无序区的第一个元素开始和它前面的有序区的元素进行比较，如果比前面的元素小，
     * 那么前面的元素向后移动，否则就将此元素插入到相应的位置 
     */
    function insertSort(arr){
      var len = arr.length
        , i = 1
        , j, key;

      for(; i < len; i++){
        j = i;
        key = arr[j];  
        while(--j > -1){ 
          if(arr[j] > key){  
            arr[j + 1] = arr[j];  
          }else{
            break;  
          }  
        }  
        arr[j + 1] = key;  
      }  
      return arr;  
    }

    /**
     * 冒泡排序
     * 基本思路：通过在无序区的相邻元素的比较和替换，使较小的元素浮到最上面
     */
    function bubbleSort(arr){
      var len = arr.length
        , i, j;

      for(i = len - 1; i >= 1; i--){  
        for(j = 0; j <= i - 1; j++){  
          if(arr[j] > arr[j + 1]){  
            d = arr[j + 1];
            arr[j + 1] = arr[j];
            arr[j] = d;
          }
        }
      }
      return arr;  
    }

    /**
     * 冒泡排序（改进版）
     * 基本思路：如果在某次的排序中没有出现交换的情况，那么说明无序的元素现在已经是有序的了，就可以直接返回
     */
    function bubbleSort(arr){
      var len = arr.length
        , i, j, exchange;

      for(i = len - 1; i >= 1; i--){
        exchange = 0;
        for(j = 0; j <= i - 1; j++){  
          if(arr[j] > arr[j + 1]){  
            d = arr[j + 1];
            arr[j + 1] = arr[j];
            arr[j] = d;
            exchange = 1;
          }
        }
        if(!exchange) return arr;
      }
      return arr;  
    }

    /**
     * 选择排序
     * 基本思路：在无序区中选出最小的元素，然后将它们和无序区的第一个元素交换位置
     */
    function selectSort(arr){
      var len = arr.length
        , i, j, k, temp;

      for(i = 0; i < len; i++){
        k = i;
        for(j = i + 1; j < len; j++){
          if(arr[k] > arr[j]) k = j;
        }

        if(k !== i){
          temp = arr[k];
          arr[k] = arr[i];
          arr[i] = temp;
        }
      }

      return arr;
    }

    /* 堆排序 */
    function heapSort(arr){
      for(var i = 1; i < arr.length; ++i){
        for (var j = i, k = (j - 1) >> 1; k >= 0; j = k, k = (k - 1) >> 1){
          if(arr[k] >= arr[j]) break;
          arr.swap(j, k);
        }
      }
      for(var i = arr.length - 1; i > 0; --i){
        arr.swap(0, i);
        for(var j = 0, k = (j + 1) << 1; k <= i; j = k, k = (k + 1) << 1){
          if(k == i || arr[k] < arr[k - 1]) --k;
          if(arr[k] <= arr[j]) break;
          arr.swap(j, k);
        }
      }
      return arr;
    }

    /**
     * 希尔排序
     * 基本思路：我们在第 i 次时取 gap = n/(2的i次方)，
     * 然后将数组分为 gap 组(从下标0开始，每相邻的gap个元素为一组)，接下来我们对每一组进行直接插入排序。
     */
    function ShellSort(arr){
      var len = arr.length
        , gap = parseInt(len/2)
        , i, j, temp;

      while(gap > 0){
        for(i = gap; i < len; i++){
          temp = arr[i];
          j = i - gap;

          while(j >= 0 && temp < arr[j]){
            arr[j + gap] = arr[j];
            j = j - gap;
          }

          arr[j + gap] = temp;
        }
        gap = parseInt(gap/2);
      }
      return arr;
    }

    /**
     * 归并排序
     * 基本思路：
     * (1)归并：
     *
     * (2)排序：
     * 
     */
    function merge(arr, low, mid, high){

    }

    function mergePass(arr, length, n){

    }

    function mergeSort(arr){}

