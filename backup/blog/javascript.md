# 1. JavaScript

## 1.0 javascript 异步编程原理

Javascript 的执行环境是单线程的，所谓的单线程，就是指一次只能完成一件任务，如果有多个任务，就必须排队，前面一个任务完成，再执行后面一个任务，以此类推。

这种模式的好处是实现起来比较简单，执行环境相对单纯。坏处是只要有一个任务耗时很长，后面的任务都必须排队等着，会拖延整个程序的执行。常见的浏览器无响应（假死），往往就是因为一段 Js 代码长时间运行（比如死循环），导致整个页面卡在这个地方，其它任务无法执行。

为了解决这个问题，Javascript 语言将任务的执行模式分成两种：同步（Synchronous）和异步（Asynchronous）。

* “同步模式”如上文所描述的，后一个任务等待前一个任务结束，然后再执行，程序的执行顺序与任务的排列顺序是一致的、同步的；
* “异步模式”则完全不同，每一个任务有一个或多个回调函数，前一个任务结束后不是执行后一个任务，而是执行回调函数，后一个任务则是不等前一个任务结束就执行，所以程序的执行顺序与任务的排列顺序是不一致的、异步的。

“异步模式”非常重要。在浏览器端，耗时很长的操作都应该异步执行，避免浏览器失去响应，最好的例子就是 Ajax 操作。在服务器端，“异步模式”甚至是唯一的模式，因为执行环境是单线程的，如果允许同步执行所有 http 请求，服务器性能会急剧下降，很快就会失去响应。

### setTimeout 神器

弊端1：setTimeout 和 setInterval 运行的最短周期是 5ms 左右，[HTML规范](http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout)

    var d = new Date(), count = 0, timer;
    timer = setTimeout(function(){
      if( new Date() - d > 1000){
        clearTimeout(timer);
        console.log(count);
      }
      count++;
    }, 0);

setTimeout 是存在一定时间间隔的，不是设定 n 毫秒执行，它就是 n 毫秒执行，可能会有一点时间延迟（2ms 左右）

弊端2：while 循环阻塞 setTimeout 执行

    var d = new Date();
    setTimeout(function(){
      console.log('show me after 1s, but you konw: ' + ( new Date() -d  ));
    }, 1000);
    while(true) if( new Date() - d > 2000 ) break;

上面代码，我们期望 console 在 1s 后打出结果，可事实却是在 2000ms+ 之后运行的，这就是 Javascript 单线程给我们带来的烦恼，while 循环阻塞了 setTimeout 的执行。

弊端3：try...catch... 捕捉不到它的错误

    try{
      setTimeout(function(){
        throw new Error('我不希望这个错误出现');
      }, 1000);
    }
    catch(e){
      console.log(e.message);
    }

setTimeout 是异步编程不可缺少的角色，但它本身存在诸多问题，这就要求我们用更恰当的方式去规避。

什么样的函数是异步的？
异步的概念和非阻塞是息息相关的，我们通过 ajax 请求的时候一般是通过异步的方式：

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/', true);  // 第三个参数设置为 true， 也就是异步加载
    xhr.send();
    xhr.onreadystatechange = function(){
      console.log(xhr.status);
    }

### 常见异步模型

1. 回调函数

    陷入回调地狱，解耦程度特别低。

2. 事件监听（on / off / trigger）

    JS 和浏览器提供的原生方法基本都是基于事件触发机制的，耦合度很低，不过事件不能得到流程控制。

3. 发布/订阅模式（Pub / Sub）

    把事件全部交给控制器管理，可以完全掌握事件被订阅的次数，以及订阅者的信息，管理起来特别方便。
    这种方法的性质与“事件监听”类似，但是明显优于后者。因为我们可以通过查看“消息中心”，了解存在多少信号、每个信号有多少订阅者，从而监控程序的运行。

4. Promise 对象

    Promise 对象是 CommonJS 工作组提出的一种规范，目的是为异步编程提供统一的接口。简单说，它的思想是，每一个异步任务返回一个 Promise 对象，该对象有一个 then 方法，允许指定回调函数。
    promise 模式在任何时候都处于一下 3 中状态之一：未完成(unfulfilled)、已完成(resolved)、和拒绝(rejected)。以 CommonJS     Promise/A 标准为例，promise 对象上的 then 方法负责添加针对已完成和拒绝状态下的处理函数。then 方法会返回另一个 promise 对象，以便于形成 promise 管道，这种返回 promise 对象的方式能够支持开发人员把异步操作串联起来，如 `then(resolvedHandler, rejectedHandler);` 。`resolvedHandler` 回调函数在 promise 对象进入完成状态时会触发，并传递结果；`rejectedHandler` 函数会在拒绝状态下调用。


        var Promise = function(thens){
          this.thens = thens || [];
        }
        Promise.prototype = {
          resolve: function(){
            /* move from unfulfilled to resolved */
            var t = this.thens.shift(), n;
            t && ( n ＝ t.apply(null, arguments), n instanceof Promise && ( n.thens = this.thens ) )
          },
          reject: function(){
            /* move from unfulfilled to rejected */
          },
          then: function(n){
            return this.thens.push(n), this;
          }
        }


## 1.1 Javascript OO 

### 简单栗子

理解三个关键字：

1. function, JS 世界里 Class 的定义用 `function`, function 里面的内容就是构造函数的内容
2. this, 代表调用这个函数的对象
3. prototype, 用它来定义成员函数，比较规范和保险

        // 定义 Circle 类，拥有成员变量 r，常量 PI 和计算面积的成员函数 area()
        function Circle(radius){
        this.r = radius;
        }
        
        Circle.PI = 1.1415926;
        Circle.prototype.area = function(){
        return Circle.PI * this.r * this.r;
        }
        
        // 使用 Circle 类
        var c = new Circle(1.0);
        console.log(c);

另外成员函数也可以写成这样：

    function compute_area(){
      return Circle.PI * this.r * this.r;
    }

    Circle.prototype.area = compute_area;

### 创建对象

（1）工厂模式

    function createPerson(name, age, job){
      var o = new Object();
      o.name = name;
      o.age = age;
      o.job = job;
      o.sayName = function(){
        console.log(this.name);
      }

      return o;
    }

    var person1 = createPerson('jimco', 24, 'Front-end Engineer');
    var person2 = crestePerson('Lucy', 25, 'Dcotor');

（2）构造函数模式

    function Person(name, age, job){
      this.name = name;
      this.age = age;
      this.job = job;
      this.sayName = function(){
        console.log(this.name);
      }
    }
    
    var person1 = new Person('jimco', 24, 'Front-end Engineer');
    var person2 = new Person('Lucy', 25, 'Dcotor');

创建 Person 的新实例，必须使用 `new` 操作符，以这种方式调用构造函数实际上会经历以下 4 个步骤：

1. 创建一个新对象
2. 将构造函数的作用域赋给新对象（因此 this 就指向这个新对象）
1. 执行构造函数中的代码（为这个对象添加属性） 
4. 返回新对象

（3）原型模式

    function Person(){}

    Person.prototype.name = 'jimco';
    Person.prototype.age = '24';
    Person.prototype.job = 'Front-end Engineer';
    Person.prototype.sayName = function(){
      console.log(this.name);
    };

    var person1 = new Person();
    var person2 = new Person();
    console.log(person1.sayName == person2.sayName); // true

更简单的原型语法：

    function Person(){}

    Person.prototype = {
      constructor: Person,
      name: 'jimco',
      age: 24,
      job: 'Front-end Engineer',
      sayName: function(){
        console.log(this.name);
      }
    }

（4）组合使用构造函数模式和原型模式

    function Person(name, age, job){
      this.name = name;
      this.age = age;
      thia.job = job;
      this.friends = ['Shelby', 'Court'];
    }

    Person.prototype = {
      constructor: Person,
      sayName: function(){
        console.log(this.name);
      }
    }

    var person1 = new Person('jimco', 24, 'Front-end Engineer');
    var person2 = new Person('Lucy', 25, 'Dcotor');

    person1.friends.push('Van');

    console.log(person1.friends);
    console.log(person2.friends);
    console.log(person1.friends === person2.friends); // false
    console.log(person1.sayName === person2.sayName); // true




### 继承

基本思想：利用原型让一个引用类型继承另一个引用类型的属性和方法。

每个构造函数都有一个原型对象，原型对象都包含一个指向构造函数的指针(constructor)，而实例都包含一个指向原型对象的内部指针。那么，假如我们让原型对象等于另一个类型的实例，显然，此时的原型对象将包含一个指向另一个原型的指针，相应地，另一个原型中也包含着一个指向另一个构造函数的指针。假如另一个原型又是另一个类型的实例，如此层层递进，就构成了实例与原型的链条。这就是原型链的基本概念。

原型链基本模式：

    function SuperType(){
      this.property = true;
    }

    SuperType.prototype.getSuperVal = function(){
      return this.property;
    }

    function SubType = {
      this.subproperty = false;
    }

    SubType.prototype = new SuperType();
    SubType.prototype.constructor = SubType; // 若不重写则指向 SuperType

    SubType.prototype.getSubVal = function(){
      return this.subproperty;
    }

    var instance = new SubType();
    console.log(instance.getSuperVal()); // true

原型链的问题：包含引用类型值的属性会被所有实例共享。
    
    function SuperType(){
      this.colors = ['red', 'green', 'blue'];
    }

    function SubType(){}

    SubType.prototype = new SuperType();

    var instance1 = new SubType();
    instance1.colors.push('black');
    console.log(instance1.colors); // ['red', 'green', 'blue', 'black']

    var instance2 = new SubType();
    console.log(instance2.colors); // ['red', 'green', 'blue', 'black']

借用构造函数：

    function SuperType(){
      this.colors = ['red', 'green', 'blue'];
      this.getColors = function(){
        console.log(this.colors);
      }
    }

    function SubType(){
      // 继承了 SuperType
      SuperType.call(this);
    }

    var instance1 = new SubType();
    instance1.colors.push('black');
    console.log(instance1.colors); // ['red', 'green', 'blue', 'black']

    var instance2 = new SubType();
    console.log(instance2.colors); // ['red', 'green', 'blue']

缺陷：方法都在构造函数中定义，复用无从谈起。而且在超类型的原型中定义的方法，对子类型而言也是不可见的

组合继承：

    function SuperType(name){
      this.name = name;
      this.colors = ['red', 'green', 'blue'];
    }

    SuperType.prototype.sayName = function(){
      console.log(this.name);
    }

    function SubType(name, age){
      SuperType.call(this, name); // 继承属性
      this.age = age;
    }

    SubType.prototype = new SuperType(); // 继承方法

    SubType.prototype.sayAge = function(){
      console.log(this.age);
    }

    var instance1 = new SubType('jimco', 24);
    instance1.colors.push('black');
    console.log(instance1.colors); // ['red', 'green', 'blue', 'black']
    instance1.sayName();           // 'Jimco'
    instance1.sayAge();            // 24

    var instance2 = new SubType('Lucy', 25);
    console.log(instance2.colors); // ['red', 'green', 'blue']
    instance2.sayName();           // 'Lucy'
    instance2.sayAge();            // 25

原型式继承：

    function object(o){
      function F(){};
      F.prototype = o;
      return new F();
    }

    var person = {
      name: 'jimco',
      friends: ['Shelby', 'Court', 'Van']
    }

    var person1 = object(person);
    person1.name = 'Greg';
    person1.friends.push('Bob');

    var person2 = object(person);
    person2.name = 'Linda';
    person2.friends.push('Barbie');

    console.log(person2.friends); // ['Shelby', 'Court', 'Van', 'Bob', 'Barbie']

object() 方法与 ECMAScript 5 新增的 object.create() 方法类似

在没有必要兴师动众地创建构造函数的，而只想让一个对象与另一个对象保持类似的情况下，原型式继承完全是可以胜任的。不过，包含引用类型值的属性始终都会共享相应的值，就像使用原型模式一样

寄生式继承：

    function createAnother(original){
      var clone = object(original); // 通过调用函数创建一个新对象
      clone.sayHi = function(){     // 以某种方式来增强这个对象
        console.log('hi');
      }

      return clone; // 返回这个对象
    }

    var person = {
      name: 'jimco',
      friend: ['Shelby', 'Court', 'Van']
    }
    
    var person1 = createAnother(person);
    person1.sayHi(); // 'hi'

使用寄生式继承来为对象添加函数，会由于不能做到函数复用而降低效率，这一点与构造函数模式类似。

寄生组合式继承： (引用类型最理想的继承范式)

    function object(o){
      function F(){}
      F.prototype = o;
      return new F();
    }

    function inheritPrototype(subType, superType){
      var prototype = object(superType.prototype);
      prototype.constructor = subType;
      subType.prototype = prototype;
    }

    function SuperType(name){
      this.name = name;
      this.colors = ['red', 'green', 'blue'];
    }

    SuperType.prototype.sayName = function(){
      console.log(this.name);
    }

    function SubType(name, age){
      SuperType.call(this, name);
      this.age = age;
    }

    inheritPrototype(SubType, SuperType);

    SubType.prototype.sayAge = function(){
      console.log(this.age);
    }

这个例子的高效率体现在它只调用了一次 SuperType 构造函数，并且避免了在 SuperType.prototype 上面创建不必要的、多余的属性。与此同时，原型链还能保持不变；因此还能够正常使用 instanceof 和 isPrototypeOf()。


## 1.2 Javascript 跨域总结

### 什么情况会跨域

1. 主域不同
2. 主域相同，子域不同
1. 域名相同，协议不同 (http / https)
4. 域名相同，端口不同

### Ajax 跨域解决办法

(1) document.domain + iframe

对于主域相同而子域不同的例子，可以通过设置 document.domain 的办法来解决。具体的做法是可以在 http://www.a.com/a.html 和 http://script.a.com/b.html 两个文件中分别加上 `document.domain = 'a.com';` 然后通过 a.html 文件中创建一个 iframe，去控制 iframe 的 contentDocument。当然这种办法只能解决主域相同而二级域名不同的情况。

(2) 动态创建 script (jsonp)

        var loadJsonp = (function(){
            var seq = new Date() * 1;
            return function (url, params, callback){
              var funName = 'XYJsonp' + seq++
                , head = document.getElementsByTagName('head')[0]
                , script = document.createElement('script');

              for(var key in params){
                url += (/\?/.test( url ) ? '&' : '?') + key + '=' + encodeURIComponent(params[key]);
              }

              url += '&callback=' + funName;

              window[funName] = function(data){
                window[funName] = undefined;
                try{
                  delete window[funName];
                }catch(e){}

                if(head){
                  head.removeChild(script);
                }
                callback(data);
              };

              script.charset = "UTF-8";
              script.src = url;
              head.appendChild(script);
            };
          }());

(3) 利用 iframe 和 location.hash

这个办法比较绕，但是可以解决完全跨域情况下的脚步置换问题。原理是利用 location.hash 来进行传值。在 url: http://a.com#helloword 中的 `#helloworld` 就是 location.hash，改变 hash 并不会导致页面刷新，所以可以利用 hash 值来进行数据传递，当然数据容量是有限的。假设域名 a.com 下的文件 cs1.html 要和 cnblogs.com 域名下的 cs2.html 传递信息，cs1.html 首先创建自动创建一个隐藏的 iframe，iframe 的 src 指向 cnblogs.com 域名下的 cs2.html 页面，这时的 hash 值可以做参数传递用。cs2.html 响应请求后再将通过修改 cs1.html 的 hash 值来传递数据（由于两个页面不在同一个域下 IE、Chrome 不允许修改 parent.location.hash 的值，所以要借助于 a.com 域名下的一个代理 iframe，Firefox可以修改）。同时在 cs1.html 上加一个定时器，隔一段时间来判断 location.hash 的值有没有变化，一点有变化则获取获取 hash 值。

(4) window.name 实现跨域数据传输

`name` 在浏览器环境中是一个全局 window 对象属性，当在 iframe 中加载新页面时，`name` 的属性值依旧保持不变，`name` 属性仅对相同域名的 iframe 可访问。
总结起来即：iframe 的 src 属性由外域转向本地域，跨域数据即由 iframe 的 window.name 从外域传递到本地域。这个就巧妙地绕过了浏览器的跨域访问限制，但同时它又是安全操作。

(5) 利用 HTML5 postMessage

`postMessage` 是 HTML5 新增 API 之一，下一代浏览器支持这个功能 Chrome 2.0+, Internet Explorer 8.0+, Firefox 1.0+, Opera 9.6+, 和 Safari 4.0+ 。
参考资料：[Window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage)

(6) 利用 Flash


## 1.3 Javascript 事件机制

事件触发有 3 个阶段

1. document 往事件触发地点，捕获前进，遇到相同注册事件立即触发
2. 到达事件位置，触发事件（**如果该处既注册了冒泡事件，也注册了捕获事件，按照注册顺序执行**）
1. 事件触发地点往 document 方向，冒泡前进，遇到相同注册事件立即触发


几个注意点：

* `event.target` 和 `event.currentTarget` 的区别：
真正的事件 dispatch 者是 `event.target`，监听事件(addEventListener/attachEvent)的对象是 `event.currentTarget`。

* `event.stopPropagation()` 阻止了事件的冒泡，还阻止了事件的继续捕获

* `event.stopImmediatePropagation()` 不仅阻止事件的传播，还阻止了该元素上绑定的其它函数的执行

* `setCapture` 和 `releaseCapture`, 这两个是 IE 下的事件绑定函数，对指定对象设置/释放鼠标捕获，只要我们在某个元素上 setCapture 了，那么你在任何地方的鼠标操作（mouseXXX之类的动作）都会在这个元素上触发（前提是你在这个元素上绑定了事件），releaseCapture 或者本窗口失去聚焦才会释放这个绑定


## 1.4 前端模块化开发的价值

主要解决：命名冲突、文件依赖。
其他：模块版本管理、提高可维护性、前端性能优化、跨环境共享模块

### 14.1 模块化加载的实现原理

1. 数据模块的加载：Ajax (存在跨域问题)、创建 script 标签

2. 解析模块的层次依赖关系：一般采用正则匹配

1. 添加事件机制，优化管理代码


Seajs，模块的加载采用的是创建文本节点，让文档去加载模块，实时查看状态为 interactive 的 script 标签，如果处于交互状态就拿到它的代码，接着删除节点。当节点数目为 0 的时候，加载工作完成。
在 Seajs 中，所有 Javascript 模块都遵循 CMD 模块定义规范，该规范明确了模块的基本书写格式和基本交互规则。


## 1.5 Javascript 中的内存管理

无论哪种语言，内存的生命周期差不多总是相同的：

1. 分配你需要的内存
2. 使用它（读、写）
1. 当不再需要已分配的内存时释放它

js 中，大部分内存管理问题出现在释放内存阶段l，基本问题在于无法确定一些内存是否“不再被需要”。高阶语言的的解释器包含一个称为“垃圾收集器”的软件，它的工作是追踪内存的分配使用，以便在于不再需要某个已分配的内存时发现，并自动释放它。

垃圾回收算法：

(1) 引用计数式

引发内存泄漏的主要方式：循环引用、内部函数引用（闭包）、页面交叉泄漏、貌似泄漏
    
    function f(){
      var o = {};
      var o2 = {};
      o.a = o2;
      o2.a = o;
      return 'azerty';
    }
    f();

(2) 标记 - 扫描式

这个算法将定义“一个对象不再被需要”，缩小为“一个对象不能被到达”。算法假设一组称为 roots 的对象（在 js 中，roots 是全局对象）。垃圾收集器会定期地从 root 开始查找所有被 root 引用的对象，然后是所有被这些对象引用的对象，以此类推。由于是从 root 开始，因此垃圾收集器将找到所有可以到达的对象，并收集所有不可到达的对象。

参考资料：

[Javascript中的内存管理](https://developer.mozilla.org/zh-CN/docs/JavaScript/Javascript%E4%B8%AD%E7%9A%84%E5%86%85%E5%AD%98%E7%AE%A1%E7%90%86)

[理解并解决IE的内存泄漏方式](http://birdshome.cnblogs.com/archive/2006/05/28/IE_MemoryLeak.html)


## 1.6 WebSocket 协议

### Web 的交互过程

Web 应用典型的信息交互过程通常是：客户端通过浏览器发出一个请求，服务端接收请求后进行处理并返回结果给客户端，然后客户端浏览器将信息呈现出来。

这种机制对于信息交互不是特别频繁的应用尚能相安无事，但是对于那些实时要求比较高的应用来说（比如在线游戏），当客户端浏览器准备呈现获取到的信息的时候，这些信息在服务器端可能已经过时，所以，保持客户端和服务器端的信息同步是实时 Web 应用的关键要素。
在 WebSocket 规范出来之前，开发人员想实现这种应用，不得不采用一些折中的方案，其中最常用的就是轮询（Polling）和 Comet（轮询的改进版本，又可细分为长轮询机制与流技术）技术。这几种方案基本都是在用 Ajax 来模拟实时的效果，服务器与客户端编程都比较复杂，而且效率不高。

HTML5 WebSocket 设计出来的目的就是要取代轮询和 Comet 技术，是客户端浏览器具备像 C/S 架构下桌面系统的实时通讯能力。浏览器向服务器发出建立 WebSocket 连接的请求，连接建立以后，客户端和服务器端就可以通过 TCP 连接直接交换数据。因为 WebSocket 连接本质上就是一个 TCP 连接，所以在数据传输的稳定性和数据传输量的大小方面，和轮询以及 Comet 技术比较，具有很大的性能优势。

### WebSocket 协议

WebSocket 协议本质上是一个基于 TCP 协议。为了建立一个 WebSocket 连接，客户端浏览器首先要向服务器发起一个 HTTP 请求，这个请求和通常的 HTTP 请求不同，包含了一些附加头信息，其中附加头信息 ”Upgrade: WebSocket” 表明这是一个申请协议升级的 HTTP 请求(详细的 WebSocket 消息的内容这里就不详细说了，基本和 HTTP 的差不多，而且都是由 WebSocket 对象自动发送和接收的，对用户透明)，服务器端解析这些附加的头信息然后产生应答信息返回给客户端，客户端和服务器端的 WebSocket 连接就建立起来了，双方就可以通过这个连接通道自由的传递信息，并且这个连接会持续存在直到客户端或者服务器端的某一方主动的关闭连接。

WebSocket API 最伟大之处在于服务器和客户端可以在给定的时间范围内的任意时刻，相互推送信息。WebSocket 并不限于以 Ajax (或 XmlHttpRequest )方式通信，因为 Ajax 技术需要客户端发起请求，而 WebSocket 服务器和客户端可以彼此相互推送信息；XmlHttpRequest 通信受到域的限制，而 WebSocket 允许跨域通信。 

需要注意的问题是，除了安全和性能以外，服务端只管往 socket 里面写数据就可以了，WebSocket 的通信数据全部是以 ”\x00″ 开头以 ”\xFF” 结尾的，无论是服务端发出的数据还是客户端发送的数据都遵从这个格式，唯一不同的是客户端的 WebSocket 对象能够自动将头尾去除，获得主体数据，这就省却了在客户端处理原始数据的必要，而且 WebSocket 通信的消息总是 UTF-8 格式的。 

[参考资料](http://www.cnblogs.com/dxy1982/archive/2012/01/19/2325419.html)


## 1.7 Web Worker 多线程

在 HTML5 之前，浏览器中的 Javascript 的运行都是以单线程的方式工作的，虽然有多种方式实现了对多线程的模拟（例如：Javascript 中的 setInterval 、setTimeout 方法等），但是在本质上程序的运行仍然是由 Javascript 引擎以单线程调度的方式进行的。在HTML5 中引入的工作线程使得浏览器端的 Javascirpt 引擎可以并发地执行 Javascript 代码，从而实现了对浏览器端多线程编程的良好支持。

[参考资料](http://www.cnblogs.com/dxy1982/archive/2012/08/06/2359202.html)


## 1.8 雅虎14条前端性能优化原则

1. 尽可能的减少 HTTP 的请求数 [content]
2. 使用 CDN（Content Delivery Network） [server]
1. 添加 Expires 头(或者 Cache-control ) [server]
4. Gzip 组件 [server]
5. 将 CSS 样式放在页面的上方 [css]
6. 将脚本移动到底部（包括内联的） [javascript]
7. 避免使用 CSS 中的 Expressions [css]
8. 将 JavaScript 和 CSS 独立成外部文件 [javascript] [css]
9. 减少 DNS 查询 [content]
10. 压缩 JavaScript 和 CSS (包括内联的) [javascript] [css]
11. 避免重定向 [server]
12. 移除重复的脚本 [javascript]
11. 配置实体标签（ETags） [css]
14. 使 AJAX 缓存 


## 1.9 常用 Javascript 设计模式

(1) 单例模式

    var singleton = function(fn){
        var result;
        return function(){
          return result || (result = fn.apply(this, arguments));
        }
      }

    var cresteMask = singleton(function(){
        return document.body.appendChild(document.createElement('div')); 
      });

(2) 简单工厂模式

简单工厂模式是由一个方法来决定到底要创建哪个类的实例，而这些实例通常都拥有相同的接口，这种模式主要用在所实例化的类型在编译期并不能确定，而是在执行期决定的情况。

(3) 观察者模式

    var eventTarget = {
        on: function(e, fn){
          if(e.indexOf(',') > -1){
            var es = e.split(',');
            for(var i = 0, len = es.length; i < len; i++){
              this.on(es[i], fn);
            }
          }
          else{
            var ev = (this.evts = this.evts || {})[e];
            ev = ev || (this.evts[e] = []);
            ev.push(fn);
          }
          return this;
        },

        fire: function(){
          this.evts = this.evts || {};
          var args = Array.prototypt.slice.call(arguments, 0)
            , ev = args.shift()
            , scope = this;
          
          if(typeof ev !== 'string'){
            scope = ev;
            ev = args.shift();
          }

          var fn = this.evts[ev];
          if(fn instanceof Array){
            for(var i = 0, p; p = fn[i++];){
              this.eventTag = ev;
              p.apply(scope, args);
            }
          }
          return this; 
        },

        off: function(e, fn){
          this.evts = this.evts || {};
          var ev = this.evts[e];
          if(ev){
            if(!!fn){
              for(var i = 0, p; p = ev[i++]; ){
                if(fn = p){
                  ev.splice(i - 1, 1);
                  i--;
                }
              }
            }
            else{
              this.evts[e] = null;
            }
          }
          return this;
        }
      }

(4) 适配器模式

适配器模式的作用，就像一个转接口，比如你现在正在用一个自定义的js库，里面有个根据 id 获取节点的方法 $id()， 有天你觉得 jquery 里的$实现得更酷，但你又不想让你的工程师去学习新的库和语法，那一个适配器就能让你完成这件事情。

    $id = function(id){
      return jQuery('#' + id)[0];
    }

(5) 代理模式

代理模式的定义是把对一个对象的访问，交给另一个代理对象来操作    

(6) 桥接模式

(7) 外观模式

(8) 访问者模式

(9) 策略模式

(10) 模版方法模式

(11) 中介者模式

中介者对象可以让各个对象之间可以不需要显式地相互引用，从而使其松耦合，而且可以独立地改变他们之间的交互。

切回到程序世界里的 MVC，无论是 j2ee 中 struts 的 Action，还是 js 中 Backbone.js 和 spine.js 里的 Controler 都起到了一个中介者的作用。

拿 Backbone 举例， 一个 model 里的数据并不确定最后被哪些 view 使用， view 需要的数据也可以来自任意一个 model ，所有的绑定关系都在 controler 里决定，中介者把复杂的多对多关系，变成了 2 个相对简单的 1 对多关系。

    var model1 = Model.create()
      , model2 = Model.create()
      , view1 = View.create()
      , view2 = View.create();

    var controler1 = Controler.create(model1, view1, function(){
        view1.el.find('div').bind('click', function(e){
          this.innerHTML = model1.find('data');
        });
      });

    var controler2 = Controler.create(model2, view2, function(){
        view2.el.find('div').bind('click', function(e){
          this.innerHTML = model2.find('data');
        });
      });

(12) 迭代器模式

(13) 组合模式

(14) 备忘录模式

备忘录模式在 js 中常用于数据缓存，比如一个分页控件，从服务端获得某一页数据后可以存入缓存。以后再返回这一页的时候，可以直接使用缓存里的数据而无需再次请求服务器。

伪代码：

    var Page = function(){
        var page = 1
          , cache = {}
          , data;

        return function(page){
          if(cache[page]){
            data = cache[page];
            render(data);
          }
          else{
            $.post('comment.xxx.com/xxx', function(data){
              cache[page] = data;
              render(data);  
            });
          }
        }
      }

(15) 职责链模式

(16) 享元模式

(17) 状态模式

状态模式主要可以用于这种场景：

1. 一个对象的行为取决于它的状态

2. 一个操作中含有庞大的条件分支语句

        var stateManager = function(){
          var currState = 'wait';
          var states = {
              jump: function(state){},
              wait: function(state){},
              attack: function(state){},
              crouch: function(state){},
              defense: function(state){
                if(currState === 'jump'){
                  return false; // 不成功，跳跃的时候不能防御
                }
                // dosomething
                currState = 'defense'; // 切换状态
              }
            };

          var changeState = function(state){
            states[state] && states[state]();
          }

          return {
            changeState: changeState
          }
        }

        var stateManager = stateManager();
        stateManager.changeState('defense');

(18) 沙箱模式

    function SandBox(){
      var args = Array.prototype.slice.call(arguments)
        , callback = args.pop()
        , modules = (args[0] && typeof argus[0] === 'string') ? args : args[0];

      if(!(this instanceof SandBox)){
        return new SandBox(modules, callback);
      }

      if(!modules || modules === '*'){
        modules = [];
        for(i in SandBox.modules){
          if(SandBox.modules.hasOwnProperty(i)){
            modules.push(i);
          }
        }
      }

      for(var i = 0, len = modules.length; i < len; i++){
        SandBox.modules[modules[i]](this);
      }
      callback(this);
    }

    SandBox.prototype = {
      name: 'My Application',
      versino: 0.0.1,
      getName: function(){
        return this.name;
      }
    }

    SandBox.modules = {};
    
    SandBox.modules.dom = function(box){
      
    }
      
    SandBox.modules.ajas = function(box){

    }


## 1.10 前端 MV* 框架的意义

早期前端都是比较简单，基本以页面为工作单元，内容以浏览型为主，也偶尔有简单的表单操作，这个时期每个界面上只有很少的 JavaScript 逻辑，基本不太需要框架。随着 Ajax 的出现，Web2.0 的兴起，人们可以在页面上可以做比较复杂的事情了，然后前端框架才真正出现了，以 jQuery 为代表，针对界面上常见的 DOM 操作，远程请求，数据处理等作了封装，也有专注于处理数据的 Underscore，严格来说，这些都不能算框架，而是算库。

库和框架是有一些区别的：库是一种工具，我提供了，你可以不用，即使你用了，也没影响你自己的代码结构。框架则是面向一个领域，提供一套解决方案，如果你用我，就得按照我的方式办事。按照这个定义，jQuery 和 Underscore 都只能算是库，ExtJS 和 dojo 算框架。

jQuery 的思维方式是：以 DOM 操作为中心
MV* 框架的思维方式是：以模型为中心，DOM 操作只是附加

## 1.11 Javascript 的类型转换

基本上，所有 js 数据类型都拥有 valueOf 和 toString 这两个方法。它们解决 javascript 值运算与显示的问题

    var obj = {
        i: 10,
        valueOf: function(){ return this.i + 30; },
        toString: function(){ return this.valueOf() + 10 }
      };

    console.log(obj > 20); // true
    console.log(+obj);     // 40
    console.log(obj);      // 50

之所以有这样的结果，是因为它们偷偷调用了 valueOf 或 toString 方法。如何区分什么情况下是调用了什么方法，我们可以通过另一个方法测试一下：

    var obj = {
        i: 10,
        valueOf: function(){
          console.log('valueOf');
          return this.i;
        },
        toString: function(){
          console.log('toString');
          return this.i;
        }
      };

    console.log(obj);          // toString Object{...}
    console.log(+obj);         // valueOf 10
    console.log('' + obj);     // valueOf 10
    console.log(String(obj));  // toString 10
    console.log(Number(obj));  // valueOf 10
    console.log(obj == '10');  // valueOf true
    console.log(obj === '10'); // false

看打印出来的结果，转换为字符串时调用 toString 方法，转换为数值时调用 valueOf 方法，但其中有两个很不和谐。一个是 `console.log('' + obj);`，字符串拼接应该是调用 toString 方法。另一个是 `console.log(obj === '10');`，我们暂时可以理解为 `===` 操作符不进行隐式转换，因此步调用它们。为了追究真相，我们需要更严谨的实验：

    var obj = {
        i: 10,
        toString: function(){
          console.log('toString');
          return this.i;
        }
      };

    console.log(obj);         // toString {...}
    console.log(+obj);        // toString 10 
    console.log('' + obj);    // toString 10
    console.log(String(obj)); // toString 10 
    console.log(Number(obj)); // toString 10
    console.log(obj == '10'); // toString true


    var obj = {
        i: 10,
        valueOf: function(){
          console.log('valueOf');
          return this.i;
        }
      };

    console.log(obj);         // [object Object]
    console.log(+obj);        // valueOf 10 
    console.log('' + obj);    // valueOf 10
    console.log(String(obj)); // [object Object]
    console.log(Number(obj)); // valueOf 10
    console.log(obj == '10'); // valueOf true

发现上面两段代码的不同了吗？valueOf 没有像 toString 那样规整，对于哪个 `[object Object]` 估计是从 Object 那里继承过来的，我们可以重写再看看：

    Object.prototype.toString = null;

    var obj = {
        i: 10,
        valueOf: function(){
          console.log('valueOf');
          return this.i;
        }
      };

    console.log(obj);         // valueOf 10
    console.log(+obj);        // valueOf 10
    console.log('' + obj);    // valueOf 10
    console.log(String(obj)); // valueOf 10
    console.log(Number(obj)); // valueOf 10
    console.log(obj == '10'); // valueOf true

结论：如果只重写了 toString，对象转换会无视 valueOf 的存在来进行转值。但是，如果只重写了 valueOf，在转换为字符串的时候会优先考虑 valueOf 方法。在不能调用 toString 的情况下，只能让 valueOf 上阵了。对于那个奇怪的字符串拼接问题，可能是出于操作符上，翻开 ECMA262-5 发现都有一个 getValue 操作，那么谜底应该是揭开了，重写会加大它们调用的优先级，而在有操作符的情况下，valueOf 的优先级比 toString 高。


## 1.11 使用 Javascript File API 实现文件上传

Demo:
    
    <!-- html -->
    <form method="post" name="demoForm" id="demoForm" action="javascript:uploadAndSubmit();" enctype="multipart/form-data">
      <p>Upload File: <input type="file" name="file"></p>
      <p><input type="submit" value="Submit"></p>
    </form>

    <div>Progressing (in Bytes): <span id="bytesRead"></span> / <span id="bytesTotal"></span></div>

    /* javascript */
    function uploadAndSubmit(){
      var form = document.getElementById('demoForm');

      if(form['file'].files.length > 0){
        var file = form['file'].files[0]
          , reader = new FileReader()
          , readEl = document.getElementById('bytesRead')
          , totalEl = document.getElementById('bytesTotal');

        // 在开始读取时触发
        reader.onloadstart = function(){
          console.log('onloadstart');
          totalEl.textContent = file.size;
        }

        // 在读取进行中触发
        reader.onprogress = function(p){
          console.log('onprogress');
          readEl.textContent = p.loaded;
        }

        // 在读取成功结束后触发
        reader.onload = function(){
          console.log('load complete');
        }
        
        // 在读取结束后，无论成功或者失败都会触发
        reader.onloadend = function(){
          if(reader.error){
            console.log(reader.error);
          }
          else{
            readEl.textContent = file.size;
            var xhr = new XMLHttpRequest();
            xhr.open(/* method */ 'POST', /* target url */ "upload.jsp?fileName=" + file.name /*, async, default to true */);
            xhr.overrideMimeType("application/octet-stream"); 
            xhr.sendAsBinary(reader.result);
            xhr.onreadystatechange = function() { 
              if(xhr.readyState == 4){ 
                if(xhr.status == 200){ 
                 console.log('upload complete'); 
                 console.log('response: ' + xhr.responseText);
                } 
              } 
            }

          }
        }

        reader.readAsBinaryString(file);
      }
      else{
        alert('Please choose a file...');
      }
    }


    // 上传，带进度条
    function uploadFile(file, progressbar) {
      var xhr = new XMLHttpRequest()
        , upload = xhr.upload
        , p = document.createElement('p');

      p.textContent = '0%';
      progressbar.appendChild(p);
      upload.progressbar = progressbar;

      // 设置上传文件相关的事件处理函数
      upload.addEventListener('progress', uploadProgress, false);
      upload.addEventListener('load', uploadSucceed, false);
      upload.addEventListener('error', uploadError, false);
      
      // 上传文件
      xhr.open('POST', 'upload.jsp?fileName=' + file.name);
      xhr.overrideMimeType('application/octet-stream');
      xhr.sendAsBinary(file.getAsBinary());
    }

    function uploadProgress(event) {
      if (event.lengthComputable) {
        // 将进度换算成百分比
        var percentage = Math.round((event.loaded * 100) / event.total);
        console.log('percentage:' + percentage);
        if (percentage < 100) {
          event.target.progressbar.firstChild.style.width = (percentage * 2) + 'px';
          event.target.progressbar.firstChild.textContent = percentage + '%';
        }
      }
    }

    function uploadSucceed(event) {
      event.target.progressbar.firstChild.style.width = '200px';
      event.target.progressbar.firstChild.textContent = '100%';
    }

    function uploadError(error) {
      alert("error: " + error);
    }


## 1.12 seajs 配置详解

* base [String] : Seajs 基础路径配置(默认为 path/to/sea.js 的 path/to 路径)

    Sea.js 在解析顶级标识时，会相对 base 路径来解析。详情请参阅 模块标识

    注意：一般请不要配置 base 路径，把 sea.js 放在合适的路径往往更简单一致。

* alias [Object] : 别名配置，当模块标识很长时可以用 alias 来简化

        seajs.config({
          alias: {
            'jquery': 'jquery/jquery/1.10.1/jquery',  
            'app/biz': 'http://path/to/app/biz.js',
          }
        });

        define(function(require, exports, module){
          var $ = require('jquery')
            , biz = require('app/biz');
        });

    使用 alias 可以让文件的真实路径与调用标识分开，有利于统一维护。

* paths [Object] : 路径配置

        // 当目录比较深，或需要跨目录调用模块时，可以使用 paths 来简化书写
        seajs.config({
            paths: {
                'gallery': 'https://a.alipayobjects.com/gallery',
                'app': 'path/to/app'
            }
        });

        define(function(require, exports, module) {

            var underscore = require('gallery/underscore'); // 加载的是 https://a.alipayobjects.com/gallery/underscore.js
            
            var biz = require('app/biz'); // 加载的是 path/to/app/biz.js
            

        });

* vars [Object] : 变量配置

        // 有些场景下，模块路径在运行时才能确定，这时可以使用 vars 变量来配置
        seajs.config({
            vars: {
              'locale': 'zh-cn'
            }
        });

        define(function(require, exports, module) {

            var lang = require('./demo/{locale}.js'); // 加载的是 path/to/demo/zh-cn.js

        });

* map [Array] : 映射配置
        
        // 该配置可对模块路径进行映射修改，可用于路径转换、在线调试等
        seajs.config({
            map: [
                [ '.js', '-debug.js' ]
            ]
        });

        define(function(require, exports, module) {

            var a = require('./a'); // 加载的是 path/to/a-debug.js

        });

* preload [Array] : 预加载项

        // 使用 preload 配置项，可以在普通模块加载前，提前加载并初始化好指定模块
        seajs.config({
            preload: [
                Function.prototype.bind ? '' : 'es5-safe',
                this.JSON ? '' : 'json' 
            ]
        });

* debug [Boolean] : 调试模式

    值为 true 时，加载器不会删除动态插入的 script 标签。插件也可以根据 debug 配置，来决策 log 等信息的输出。

* charset [String | Function] : 文件编码

    获取模块文件时，`<script>` 或 `<link>` 标签的 charset 属性。 默认是 utf-8

    charset 还可以是一个函数：

        seajs.config({
            charset: function(url) {

                // xxx 目录下的文件用 gbk 编码加载
                if (url.indexOf('http://example.com/js/xxx') === 0) {
                   return 'gbk';
                }

                // 其他文件用 utf-8 编码
                return 'utf-8';

            }
        });


## 1.13 Javascript 四则符和比较符

    var a = '10';
    var b = 1;
    console.log(a + b); // '101'
    console.log(a - b); // 9
    console.log(a > b); // true
    console.log(a < b); // false

可以看到当a的类型变成字符串的时候，`a + b`的结果已经不一样了，是一个字符串的 "101"，这就是加号(+)的一个二义性，务必记住：当加号两边含有字符串（String）的时候，它们不会进行数学运算的加法，而会执行字符串连接。

字符串在执行减法运算的时候，会先把自己转换成一个数字，然后再做运算，也就是说字符串 "10" 在做减法之前，会直接变成数字 10，然后和后面的 1 相减，得出的结果自然就是数字 9.

这个不只是减法，实际上乘 (*)，除以 (/)，求余 (%) 都是这样的步骤，先把字符串转换成数字，再做运算。

需要注意的是，这里的字符串转成数字，并不是执行 `parseInt` 或者 `parseFloat` 等函数，而是使用了内部转换，规则看一下例子就明白了：

    "123"     ==> 123
    "  123"   ==> 123
    "  123  " ==> 123
    "a12"     ==> NaN
    "1 2"     ==> NaN
    "1,2"     ==> NaN
    "1b2"     ==> NaN
    "12c"     ==> NaN
    "1.234"   ==> 1.234
    "  1.234" ==> 1.234
    " .234"   ==> 0.234

除了字符串，其他基本类型，比如undefined，null，boolean,这些是如何运算的呢？

其实很简单，只要记住下面即可：

    undefined ==> NaN
    null ==> 0
    true ==> 1
    false ==> 0

知道了这些，我们下面来看看高级点的东西，比如 array

    var a = [10, 11];
    var b = 1;
    console.log(a + b); // "10,111"
    console.log(a - b); // NaN
    console.log(a > b); // false
    console.log(a < b); // false

上面把 a 换成一个数组，这个时候再对它进行运算，大家会看到结果已经完全变了，为什么会出现这个结果呢？

（注意，以下说的基本类型指的是 undefined, null, true, false, Number, String等）

事实上，由于数组不是一个基本类型，所以 JavaScript 对它执行四则或者比较的时候，会预先执行一个叫 ToPrimitive 的步骤，就是先把数组或者对象转成一个基本类型。

转换的步骤是这样的，第一步是执行 对象的 valueOf 函数，如果返回值是一个基本类型，那么就直接用这个返回值来运算

如果 valueOf 函数得到的结果并不是基本类型，那么就会继续执行 toString() 函数，如果它的返回值是一个基本类型，那么就用这个返回值来运算。

如果上面两个都没有满足，会抛出一个 `Cannot convert object to primitive value` 的类型错误

上面的道理明白了以后，那么再回过头来看看那个数组的运算。 这里的 a 定义是一个值为 `[10, 11]` 的数组，我们首先看看它的 valueOf 的值，实际上，`[10,11].valueOf()` 的返回值依旧是一个数组，而不是上面所说的基本类型，所以再查看一下它的 toString() 的值，结果是 `"10,11"` ,这是一个字符串，符号上面所说的基本类型，所以这个 返回值是可以用来做运算的。

所以上面的 a 在做运算的时候，都可以看成是一个字符串 "10,11" 来做运算，这样结果就不言而喻

由于有字符串参与，所以加号是连字符，`a + b` 的返回值是字符串 `"10,111"`，减法的时候，字符串先预转成数字，我们前面的规则告诉我们 `"10,11"`这个字符串，预转数字的时候是 NaN，对 NaN 执行任何四则运算结果都是NaN。 比较的时候同减法，由于 a 这个时候相当于 NaN，而 NaN 和任何数字（包括它自己）都不相等，对它做任何大小比较也都会返回 false。

object 实际上在执行运算的时候和 array 相同，遵行同样的法则，先查看 valueOf，不符合条件再查看 toString，得到的基本类型再做运算。

    var a = { a: 1, b: 2, c: 3 };
    var b = 1;
    console.log(a + b); // "[object Object]1"
    console.log(a - b); // NaN
    console.log(a > b); // false
    console.log(a < b); // false

上面的结果应该不用说都明白了吧，下面我们来看个稍微复杂的例子

    
    var a = { a: 1, b: 2, c: 3, valueOf: function(){ return 10 } };
    var b = 1;
    console.log(a + b); // 11
    console.log(a - b); // 9
    console.log(a > b); // true
    console.log(a < b); // false

这个结果和第一个例子的结果完全一致，其原因在于我们重写了 valueOf 函数，它返回了一个基本类型数字 10，这个返回值 10 由于是基本类型，所以可以用来做比较，那么下面对它做运算的时候，实际上都是用 10 这个数字来运算的。

我们下面同时重写一下 a 的 toString 方法，让它返回一个字符串。

    var a = { a: 1, b: 2, c: 3, valueOf: function(){ return 10 }, toString: function(){ return 'abc' } };
    var b = 1;
    console.log(a + b);  // 11
    console.log(a - b);  // 9
    console.log(a > b);  // true
    console.log(a < b);  // false

可以看到结果没有任何影响，其原因是 valueOf 返回了基本类型，后面的 toString 对于四则和比较运算已经没了意义。

如果把 valueOf 去掉或者让 valueOf 返回一个非基本类型的话，就能看到另一番结果了。

    var a = { a: 1, b: 2, c: 3, valueOf: function(){ return [] }, toString: function(){ return true } };
    var b = 1;
    console.log(a + b);  // 2
    console.log(a - b);  // 0
    console.log(a > b);  // false
    console.log(a < b);  // false
    console.log(a == b); // true

上面这里的运算，a 就相当于一个数字 1。

我们上面说到的加号可以作为连字符，还有一种操作，比如[1,2,3].join(”)也可以把数组格式化成一个字符串，这个时候如果数组里有一个非基本类型的值，比如[1,{a:2},3]这样的数组，那么它执行join的时候是怎么样的呢？

实际上还是需要执行 ToPrimitive 这个步骤，只不过这个时候是要把 DefaultValue 指定为 String，所以它转换成字符串是这么 一个顺序：先查看 toString() ，如果返回基本类型，那么就用这个返回值，如果不是，则查看 valueOf() ，如果返回基本类型，那么就用它，否 则报 typeerror 的错误。

和上面讲的四则的 ToPrimitive 顺序是反着的，大家要注意一下。

总结一下：

1. 数组和对象做四则或比较运算，会先查看其 valueOf 的返回值。

2. 返回值不是基本类型（undefined，null，true，false，Number，String）的时候，查看其 toString() 的值。

3. toString 的返回值不是基本类型则报错，是则使用返回的值来运算。

4. 字符串或者其它非数字的基本类型执行预算的时候会预转为数字，规则在上面写了。

5. 如果含有一个字符串，那么加号（+）的意义不再是四则加，而是连字符。

6. NaN 是个特殊的数字，很多的时候字符串会变成它来进行运算，这个时候得到的结果是无意义的。

7. 大小比较和减法类似，如果 a-b 是个大于 0 的数字，那么 a 就大于 b，反之亦然。


## 1.14 前端代码异常监控

    window.onerror = function(msg,url,line,col,error){
        //没有URL不上报！上报也不知道错误
        if (msg != "Script error." && !url){
            return true;
        }
        //采用异步的方式
        //我遇到过在window.onunload进行ajax的堵塞上报
        //由于客户端强制关闭webview导致这次堵塞上报有Network Error
        //我猜测这里window.onerror的执行流在关闭前是必然执行的
        //而离开文章之后的上报对于业务来说是可丢失的
        //所以我把这里的执行流放到异步事件去执行
        //脚本的异常数降低了10倍
        setTimeout(function(){
            var data = {};
            //不一定所有浏览器都支持col参数
            col = col || (window.event && window.event.errorCharacter) || 0;
     
            data.url = url;
            data.line = line;
            data.col = col;
            if (!!error && !!error.stack){
                //如果浏览器有堆栈信息
                //直接使用
                data.msg = error.stack.toString();
            }else if (!!arguments.callee){
                //尝试通过callee拿堆栈信息
                var ext = [];
                var f = arguments.callee.caller, c = 3;
                //这里只拿三层堆栈信息
                while (f && (--c>0)) {
                   ext.push(f.toString());
                   if (f  === f.caller) {
                        break;//如果有环
                   }
                   f = f.caller;
                }
                ext = ext.join(",");
                data.msg = error.stack.toString();
            }
            //把data上报到后台！
        },0);
     
        return true;
    };
    
## 1.15 运算符优先级问题

    function Foo() {
        getName = function () { alert (1); };
        return this;
    }
    Foo.getName = function () { alert (2); };
    Foo.prototype.getName = function () { alert (3); };
    var getName = function () { alert (4); };
    function getName() { alert (5); }
    
    
    // 请写出以下输出结果：
    Foo.getName(); // 2: 访问Foo函数上存储的静态属性
    getName(); // 4: 变量声明提升、函数表达式
    Foo().getName(); // 1: 变量作用域问题、this指向问题
    getName(); // 1: 相当于 window.getName(), 变量已经被Foo函数执行时修改
    new Foo.getName(); // 2: 运算符优先级问题，点（.）的优先级高于new操作
    new Foo().getName(); // 3: 实际执行为 (new Foo()).getName()
    new new Foo().getName(); // 3: 实际执行为 new ( (new Foo()).getName )()
    
参考链接：[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)

