
/***
 * kJs-Core 1.0.0 is a js extension method collection
 * ---------------------------------------
 * Copyright 2017 Jerrey Chen
 * Created at 2017.07.25
 * Last modified at 2017.08.11
 * ---------------------------------------
 * Released under the MIT license
 */
;(function (root, factory) {
    //检测上下文环境是否为AMD或CMD
    let hasDefine = typeof define === 'function';

    //检查上下文环境是否为Node
    let hasExports = typeof module !== 'undefined' && module.exports;

    if(hasDefine) {
        //AMD环境或CMD环境
        define(factory);
    } else if(hasExports) {
        //定义为普通Node模块
        module.exports = factory();
    } else {
        //将模块的执行结果挂在window变量中，在浏览器中this指向window对象
        root.kJS = factory();
    }

})(this, function () {
    let kJS = {
        version: 'v1.0.0'
    };
    
    this.isObject = function(value) {
        return Object.prototype.toString.call(value) === "[object Object]";
    }
    this.isFunction = function(value) {
        return Object.prototype.toString.call(value) === "[object Function]";
    }
    this.isRegExp = function(value) {
        return Object.prototype.toString.call(value) === "[object RegExp]";
    }
    this.isDate = function(value) {
        return (Object.prototype.toString.call(value) === "[object Date]") && !(isNaN(value.getTime()));
    }
    this.isNumber = function(value) {
        return Object.prototype.toString.call(value) === "[object Number]";
    }
    this.isString = function(value) {
        return Object.prototype.toString.call(value) === "[object String]";
    }
    this.isArray = function(value) {
        return Object.prototype.toString.call(value) === "[object Array]";
    }
    this.isDefined = function(value) {
        return !("undefined" == typeof value);
    }

    this.extend = function(o, cfg) {
        for(let key in cfg) {
            if(!o[key]) {
                if(Object.defineProperty) {
                    Object.defineProperty(o, key, {
                        value: cfg[key],
                        enumerable: false
                    });
                } else {
                    o[key] = cfg[key];
                }
            }
        }
    }

    /***
     * 给原生 String 添加属性
     */
    this.extend(String.prototype, {
        'trim': function() {
            return this.replace(/(^\s*)|(\s*$)/g, "");
        },
        'reverse': function () {
            return this.split("").reverse().join("");
        },
        'leftPad':  function(ch, length) {
            let str = this;
            if(length && str.length < length) {
                str = ch.repeat(length - str.length) + str;
            }
            return str;
        },
        'rightPad': function(ch, length) {
            let str = this;
            if(length && str.length < length) {
                str = str + ch.repeat(length - str.length);
            }
            return str;
        },

        /***
         * 给 string 格式化输出
         * string.format(arg1, arg2,...);
		 * strubg.format(obj);
		 */
        'format': function() {
            if (arguments.length == 0) {
                return this;
            }

            let result = this;
            if (arguments.length == 1 && isObject(arguments[0])) {
                let obj = arguments[0];
                for (let key in obj) {
                    if(obj[key]){
                        result = result.replace(new RegExp("\\{" + key + "\\}", "g"), obj[key]);
                    }
                }
            }
            else {
                for (let i = 0; i < arguments.length; i++) {
                    result = result.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
                }
            }

            return result;
        },
		
		'isEmpty': function() {
			return this.replace(/(\s*$)/g,"") =="";
		},
		'isZip': function() {
			let partten =/^\d{6}$/;
			return partten.test(this);
		},
		'isPhone': function() {
			let partten =/^\d[0-9\-]+\d$/;
			return partten.test(this);
		},
		'isMobile': function() {
			let partten =/^\d[\d]{9,15}\d$/;
			return partten.test(this);
		}
    });

    /***
     * 给原生 Number 添加属性
     */
    this.extend(Number.prototype, {
		'isInt': function() {
			return (this + '').indexOf('.') < 0;
		},
		'isFloat': function() {
			return (this + '').indexOf('.') > 0;
		},
        'add': function(num) {
		    return this + num;
        },
        'minus': function(num) {
		    return this - num;
        },
        'multiple': function (num) {
            return this * num;
        },
        'divide': function(num) {
		    return this / num;
        },
        'pow': function(num) {
		    return Math.pow(this, num);
        },
        'between': function(min, max, withBoundary) {
            if(withBoundary) {
                return this >= min && this <= max;
            }
            return this > min && this < max;
        },
		'fixed': function(n) {
		    n = n > 0 ? n : 2;
			let times = Math.pow(10, n);
			let des = parseInt(this * times + 0.5, 10) / times;
			let result = des + '';
			/* 整形数 */
			if(result.indexOf('.') < 0) {
			    return result + '.' + '0'.repeat(n);
            }
			/* 浮点数 小数点位数不够 */
            let ln = result.substr(result.indexOf('.')+1).length;
			if(ln < n) {
			    return result + '0'.rightPad('0', n - ln);
            }
			return result;
		},

        /* 百分比显示，默认带 2 位小数，n=0 时候无小数*/
        'toPercent': function (n) {
		    if(n === 0) {
               return Math.round((this * 100))+ '%';
            }
            return (this * 100).fixed(n) + '%';
        },

        'toPermille': function (n) {
            if(n === 0) {
                return Math.round((this * 1000))+ '‰';
            }
            return (this * 1000).fixed(n) + '‰';
        },

        /* 千分显示，三位 以逗号分隔*/
		'toThousands': function() {
		    let num = parseInt(this);
		    /* 如果是浮点数，小数点后面的数字不需要格式化 */
		    let fnum = '';
		    if(this.isFloat()) {
		        fnum = this.toString().substr(this.toString().indexOf('.'));
            }
		    let numStr = num.toString(),
                result = '';
				 
		    while (numStr.length > 3) {
		        result = ',' + numStr.slice(-3) + result;
                numStr = numStr.slice(0, numStr.length - 3);
		    }

		    if (numStr) {
		        result = numStr + result;
		    }
		    return result + fnum;
		},

        'beautify': function (isEN) {
            isEN = isEN || false;
            let n = parseInt(this);

            if (isEN) {
                if (n < 1000) {
                    return n;
                }
                if (n < 1000000) {
                    return (n / 1000).toFixed(2) + 'K';
                }
                if (n < 10000000) {
                    return (n / 1000000).toFixed(2) + 'M';
                }
                if (n < 1000000000) {
                    return (n / 1000000000).toFixed(2) + 'B';
                }
            }

            if (n < 10000) return n;

            if (n < 100000000) {
                return (n / 10000).toFixed(2) + '万';
            }

            return (n / 100000000).toFixed(2) + '亿';
        }
    });

    /***
     * 给原生 Date 添加属性
     */
    this.extend(Date.prototype, {
        'addSeconds': function(secs) {
            secs = parseInt(secs) || 0;
            return new Date(this.getTime() + secs * 1000);
        },
        'addMinutes': function(mins) {
            mins = parseInt(mins) || 0;
            return this.addSeconds(mins * 60);
        },
        'addHours': function(hours) {
            hours = parseInt(hours) || 0;
            return this.addMinutes(hours * 60);
        },
        'addDays': function(days) {
            days = parseInt(days) || 0;
            return this.addHours(days * 24);
        },
        'addMonths': function(mons) {
            mons = parseInt(mons) || 0;
            return this.addDays(mons * 30);
        },
        'addYears': function(years) {
            years = parseInt(years) || 0;
            return this.addMonths(years * 12);
        },
        'sub': function(date) {
            if(isDate(date)) {
                return (this.getTime() - date.getTime()) / 1000;
            }
            throw ('Not date object!');
        },
        'isLeapYear': function() {
            return ((this.getFullYear() % 4 == 0)
                && ((this.getFullYear() % 100 != 0) || (this.getFullYear() % 400 == 0)));
        },

        'beautify': function () {
            let ts = Math.round(this.getTime() / 1000); // 日期的时间戳（秒）
            let dts = Math.round((new Date()).getTime() / 1000); // 当前时间戳（秒）

            let stamp = dts - ts;
            if (stamp < 0) {
                return this.format('Y年M月D日 H:I');
            } // 当期日前之后，显示格式化

            if (stamp < 60) {
                return '刚刚';
            }

            let mins = Math.floor(stamp / 60);
            if (mins < 60) {
                return mins + '分钟前';
            }

            let hrs = Math.floor(stamp / 3600);
            if (hrs < 24) {
                return hrs + '小时前';
            }
            if (hrs < 48) { 
                return '昨天';
            }
            if( hrs < 72) { 
                return '前天';
            }

            let days = Math.floor(stamp / 86400);
            if(days < 30) { 
                return days + '天前';
            }
            if(days < 60) { 
                return '一个月前';
            }

            return this.format('Y年M月D日 H:I');
        },

        // strFormat: Y, M/m/N/n, D/d, H/h/O/o, I/i, S/s, W/w/Z/z (年，月，日，时，分，秒，星期)
        'format': function(strFormat) {
            strFormat = strFormat || 'Y-M-D H:I:S';

            let weekDays = ['一', '二', '三', '四', '五', '六', '日'];
            let weekDaysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            let months = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
            let monthsEn = ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'];

            let sp = function(n, p) {
                return p ? (('' + n).leftPad('0', 2)) : n;
            }

            let result;
            let rgx = /\b(Y|y|M|m|P|p|D|d|H|h|I|i|S|s|W|w|N|n|O|o|T|t|Z|z)\b/;
            while(result = rgx.exec(strFormat)) {
                let ptn = result[0];
                switch(ptn) {
                    case 'Y': case 'y':
                        strFormat = strFormat.replace(ptn, this.getFullYear());
                        break;
                    case 'M': case 'm':
                        strFormat = strFormat.replace(ptn, sp(this.getMonth() + 1, ptn == 'M'));
                        break;
                    case 'P': case 'p':
                        strFormat = strFormat.replace(ptn, months[this.getMonth()]);
                        break;
                    case 'N': case 'n':
                        let mon = (ptn == 'N') ? monthsEn[this.getMonth()] : monthsEn[this.getMonth()].substr(0, 3) + '.';
                        strFormat = strFormat.replace(ptn, mon);
                        break;
                    case 'D': case 'd':
                        strFormat = strFormat.replace(ptn, sp(this.getDate(), ptn == 'D'));
                        break;
                    case 'H': case 'h':
                        strFormat = strFormat.replace(ptn, sp(this.getHours(), ptn == 'H'));
                        break;
                    case 'O': case 'o':
                        strFormat = strFormat.replace(ptn, sp(this.getHours() % 12, ptn == 'O'));
                        break;
                    case 'I': case 'i':
                        strFormat = strFormat.replace(ptn, sp(this.getMinutes(), ptn == 'I'));
                        break;
                    case 'S': case 's':
                        strFormat = strFormat.replace(ptn, sp(this.getSeconds(), ptn == 'S'));
                        break;
                    case 'Z': case 'z':
                        strFormat = strFormat.replace(ptn, weekDays[this.getDay() - 1]);
                        break;
                    case 'W': case 'w':
                        let idx = this.getDay() - 1;
                        let weekday_en = (ptn == 'W') ? weekDaysEn[idx] : weekDaysEn[idx].substr(0, (idx == 1 || idx == 3) ? 4 : 3);
                        strFormat = strFormat.replace(ptn, weekday_en);
                        break;
                    case 'T': case 't':
                        let sfx = this.getHours() > 12 ? 'pm' : 'am';
                        let suffix = (ptn == 'T') ? sfx.toUpperCase() : sfx.toLowerCase();
                        strFormat = strFormat.replace(ptn, suffix);
                        break;
                }
            }
            return strFormat;
        }
    });

    /***
     * 给原生 Array 添加属性
     */
    this.extend(Array.prototype, {
        'isEmpty': function () {
            return this.length === 0;
        },

        'contains': function (item) {
            return this.indexOf(item) >= 0;
        },

        'clear': function () {
            if(this.length>0) {
                this.splice(0, this.length);
            }
        },

        'removeAt': function (index) {
            if(index >= 0) {
                return this.splice(index, 1);
            }
            return false;
        },

        'remove': function (item) {
            let index = this.indexOf(item);
            return this.removeAt(index);
        },

        'insert': function (item, index) {
            this.splice(index || 0, 0, item);
        }
    });


    /***
     * 给原生 Boolean 添加属性
     */
    this.extend(Boolean.prototype, {
       'decide': function (yFn, nFn) {
           if (this.valueOf()) {
               return isFunction(yFn) ? yFn.call() : yFn;
           }

           return isFunction(nFn) ? nFn.call() : nFn;
       }
    });

    /***
     * 给原生 Object 添加属性
     */
	this.extend(Object.prototype, {
		'isPlain': function() {
			let proto = this;
			
			while (Object.getPrototypeOf(proto) !== null) {
				proto = Object.getPrototypeOf(proto)
			}

			return Object.getPrototypeOf(this) === proto;
		},

        'isNullOrEmpty': function () {
            let obj = this;

            if (obj === null || obj === undefined || typeof (obj) === 'undefined') {
                return true;
            }

            if (typeof obj === 'string') {
                return obj.trim() === '';
            }

            if (typeof obj === 'object') {
                return obj.keys().length === 0;
            }
        },

        'findByKey': function (key) {
            let obj = this;
            
            for(let k in obj) {
                if(key === k) {
                    return obj[key]; 
                }
            }

            return false;
        },

        'forEach': function(callback) {
            let obj = this;

            for(let k in obj) {
                callback && callback.call(obj, obj[k], k);
            }
        }
    });

	this.extend(Function.prototype, {
	    'repeat': function (ts, completeFn) {
	        let self = this;
	        let cnt = 0;
	        let itl = setInterval(function() {
                self.call(self);
	            cnt++;

                if(completeFn && completeFn.call(self, cnt) === true) {
                    clearInterval(itl);
                }
            }, ts);
        },

        'delay': function (ts) {
	        let self = this;
	        setTimeout(function () {
                self.call(self);
            }, ts)
        }
    });

    /*******************************************************************/
    /********* 区域分隔：以上是针对原生对象的扩展，以下是 kJS 的功能组件 ********/
    /*******************************************************************/

    /**
     * @module url 地址解析
     * @param {String} [url=null] url地址，如果不提供，默认为当前地址 
     */
    kJS.uri = function(url) {
        url = url || document.location.href;
 
        // 创建临时元素 
        let a =  document.createElement('a');
        // 将 url 赋值给 a 元素的 href 属性
        a.href = url;

        return {
            base        : url.substr(0, url.indexOf('?')),
            hash		: (a.hash || '').substr(1),
            host		: a.hostname,
            path 		: (a.pathname || '').replace(/^([^\/])/,'/$1'),
            port		: parseInt(a.port || 80),
            protocol	: a.protocol.replace(':',''),
            queryString : (a.search || '').substr(1),
            url         : url,

            /***
             * 如果 key 为空，返回 querystring 的 key-value 数组；
             * 如果 key 不为空，val 为空，返回 key 对应的值；
             * 如果 key 不为空，val 不为空，则修改 key 对应的值
             * @param {String} [key=null]
             * @param {String} [val=null] 
             * @returns {*} 返回单个key的值（String)，或者所有的 QueryString 参数 (Object)
             */
            params		: function(key, val) { 
                let result = {},
                    segs = this.queryString.split('&');

                for (let i = 0;i < segs.length; i++) {
                    if (!segs[i]) { continue; }
                    let keyValuePair = segs[i].split('=');
                    result[keyValuePair[0]] = keyValuePair[1];
                }

                if(!key) { return result; }

                if(!val) { return result[key]; }

                result[key] = val; 

                // QueryString 对象属性改变，同时更新 url 和 QueryString
                this.queryString = kJS.util.buildQuery(result);
                this.url = this.protocol + '://' + this.base
                            + (this.port === 80 ? '' : this.port)
                            + (this.queryString ? ('?' + this.queryString) : '')
                            + (this.hash ? ('#' + this.hash) : '');

                return result;
            },

            /**
             * 刷新当前 uri 地址
             */
            reload      : function() {
                kJS.util.reload(this.base + '?' + this.queryString);
            }
        }
    }
    
    kJS.log = function(msg, label) {
        console.log((new Date()).format() + ' [' + (label || 'Log') + ']: ', msg);
    }

    kJS.HashRouter = (function () {
        let instance = null;
        let hashScriptsInPage = null;
        let preRenderList = null;

        function popstateChanged() {
            let hash = kJS.uri().hash;

            for (let hash_key in hashScriptsInPage) {
                let result = (new RegExp(hash_key)).exec(hash);
                if (result !== null) {
                    // callback 的 this 指向 正则匹配的结果
                    let pre_render = preRenderList[hash_key];
                    pre_render && pre_render.call(result, hash, result.groups);

                    let callback = hashScriptsInPage[hash_key];
                    callback && callback.call(result, hash, result.groups);

                    break;
                }
            }
        }

        function createInstance() {
            hashScriptsInPage = {};
            preRenderList = {};
            currentHash = null;
            
            return {
                _addHash: function(hash, callback) {
                    currentHash = hash;
                    hashScriptsInPage[hash] = callback;
                },

                beforeRender: function(callback) {
                    if(isFunction(callback)) {
                        preRenderList[currentHash] = callback;
                    }
                }
            };
        }
 
        return {
            /***
             * 注册 hash 和对应的 callback
             * @param hash      正则表达式（不判断结果是否一致）
             * @param callback
             */
            register: function (hash, callback) {

                if (typeof hash !== 'string'
                    || hash.indexOf('^') !== 0 || hash.indexOf('$') !== hash.length - 1) {
                    throw ('Hash 格式错误，必须为 ^ 开头，$ 结尾的正则表达式字符串。');
                    return;
                }

                if (!instance) {  //  惰性创建实例
                    instance = createInstance();
                }
                
                instance._addHash(hash, callback);

                return instance;
            },

            dispatch: function(defaultHash, callback) {
                let hash = kJS.uri().hash;
                // 配置默认跳转
                if(!hash) {
                    document.location.hash = defaultHash;
                }
                else {
                    popstateChanged();
                }

                // 执行默认的回调，并以 hash 作为参数
                callback && callback.call(this, hash);

                if (window.addEventListener) {
                    window.addEventListener('popstate', popstateChanged, false);
                } else {
                    window.attachEvent('onpopstate', popstateChanged);
                }
            }
        }
    })();

    /** 
     * 向页面注册js
     * 允许页面地址含有正则表达式
     */
    kJS.PageJS = (function () {
        let instance = null;
        let pageScripts = null;

        function createInstance() {
            pageScripts = {};

            return {
                _addPageJS: function (path, callback) {
                    pageScripts[path] = callback;
                }
            }
        }

        return {
            /***
             * 根据 location.path 加载对应的 javascript
             * @param path  path 是 location.path
             * @param callback
             */
            register: function (path, callback) {
                if(!instance) {
                    instance = createInstance();
                }

                instance._addPageJS(path, callback);

                return instance;
            },
            /***
             * 根据当前的 location.path 执行对应的 javascript
             */
            run: function () {
                let path = kJS.uri().path; // 获取当前页面地址
                let result = null;
                
                let callback = pageScripts[path];
                
                // 如果直接匹配的页面地址不存在，进行正则表达式查找
                if(!callback) {
                    for(let key in pageScripts) {
                        result = new RegExp(key).exec(path);
                        if( result !== null ) {
                            path = key;
                            break;
                        } 
                    }

                    callback = pageScripts[path];
                }
                // 调用 callback
                callback && callback.call(result, path, (result ? result.groups : null));
            }
        }
    })();

    kJS.util = (function () {
        let win = this;

        return {
            /**
             * 获取对象类型
             * @param {*} value 
             */
            getType: function(value) {
                let ret = Object.prototype.toString.call(value).match(/\[\w+\s(\w+)\]/);
                if(ret) {
                    return ret[1];
                }
                return '';
            },

            exec: function(func_string) {
                if(isString(func_string)) {
                    return new Function(func_string)();
                }

                return func_string;
            },

            callFunc: function() {
                // 没有内容，或者第一个参数不是 String
                if(arguments.length == 0 || !isString(arguments[0])) {
                    return;
                }
                
                // 第一个参数是函数名称
                let funcName = arguments[0]; 

                // 只有函数名，不带参数
                if(/^[a-zA-Z0-9_]+$/.test(funcName)) {
                    // 从第二个参数开始为需要执行函数的参数值
                    let args = [];
                    for(let i = 1; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }

                    let func_args = []
                    if(args.length > 0) {
                        for(let i = 0; i < args.length; i++){ func_args.push('arg' + i); }
                    }

                    // 函数体
                    let func_body = 'return ' + funcName + '(' + func_args.join(',') + ');';

                    let fn = new Function(func_args, func_body);
                    return fn.apply(window, args);
                }

                // 函数的格式 函数名() 或者 函数名(参数1,...)，带参数
                if(/^[a-zA-Z0-9_]+\(.*?\)$/.test(funcName)) {
                    return new Function('return ' + funcName)();
                }
            },

            /**
             * 组合 QueryString 
             * @param {Object} qObj QueryString 对象
             * @return {String} 返回组合后的 QueryString
             */
            buildQuery: function(qObj) {
                let q = [];
                for(k in qObj) {
                    q.push(k + '=' + qObj[k]);
                }
                return q.join('&');
            },

            /**
             * 重新加载
             * @param {*} [qObj=null] 
             */
            reload: function(qObj) {
                let uri = kJS.uri();

                if(!qObj || !isString(qObj) && !isObject(qObj)) {
                    window.location.replace(uri.url);
                    return;
                }

                if(isString(qObj)) {
                    window.location.replace(qObj);
                    return;
                }

                let p = Object.assign(uri.params(), qObj || {});
                window.location.replace(uri.base + '?' + this.buildQuery(p)); 
            },

            goBack: function() {
                window.location.go(-1);
            },

            reloadBack: function() {
                window.location.replace(document.referrer);
            }
        }
    })();

    kJS.Autorun = (function() {
        let pendingCssList = [];
        let pendingJsList = [];
    
        function loadCss(cssFile) { 
            let link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssFile;
            document.head.appendChild(link);
        }
    
        function loadJs(jsFile) {
            return new Promise((resolve, reject) => {
                let script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = jsFile;
                document.body.appendChild(script);

                script.addEventListener('load', ev => { // when the js execute done
                    resolve();
                });
            });
        } 
    
        return {
            run: function(currentFileName, callback) {
                
                let jsElementList = document.getElementsByTagName('script');
                let src = '';
                
                for(let i = 0; i < jsElementList.length; i++) {
                    let jsElem = jsElementList[i];
                    if(jsElem.src && jsElem.src.indexOf(currentFileName) > 0) {
                        src = jsElem.src;
                        break;
                    }
                }

                if(!src) {
                    return;
                }

                let uri = kJS.uri(src);

                callback && callback.call({
                    registerCss: function(cssFile) {
                        pendingCssList.push(cssFile);
                    },
                    registerJs: function(jsFile, checkCallback) {
                        pendingJsList[jsFile] = checkCallback;
                    },
                    jsReady: function(jsReadyCallback) {
                        let jsList = [];

                        pendingCssList.forEach(css => {
                            loadCss(css);
                        });

                        for(let js in pendingJsList) {
                            let fn = pendingJsList[js];

                            if(fn && fn.call()) { 
                                continue;
                            }
                            jsList.push(loadJs(js));
                        }

                        Promise.all(jsList).then(function() {
                            jsReadyCallback && jsReadyCallback.call();
                        });
                    }
                }, uri);
            }
        }

    })();

    return kJS;
});
