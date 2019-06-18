
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

            let days = Math.floor(stamp / 86400);
            if (days < 30) {
                switch (days) {
                    case 1:
                        return '昨天';
                    case 2:
                        return '前天';
                    default:
                        return days + '天前';
                }
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

        'keys': function() {
		    let obj = this;

		    if(Object.keys) {
		        return Object.keys(obj);
            }

		    let keys = [];
		    for(let k in obj) {
		        keys.push(k);
            }
		    return keys;
        },

        'each': function(fn) {
            let obj = this;
            for(let key in obj) {
                if((fn && fn.call(obj, key, obj[key])) === true) {
                    return;
                }
            }
        },

        'findByKey': function (key) {
            let result = false;

            this.each(function (k, v) {
                if (k === key) {
                    result = v;
                    return true;
                }
            });

            return result;
        }
    });

	this.extend(Function.prototype, {
	    'interval': function (ts, completeFn) {
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

    this.pageScripts = {};
    this.hashScriptsInPage = {};
    this.hashPreRender = null;

    kJS.uri = function(url) {
        let a =  document.createElement('a');
        a.href = url || document.location;

        let protocol 	= a.protocol.replace(':','');
        let hostName 	= a.hostname;
        let port 		= parseInt(a.port || 80);
        let queryString = (a.search || '').substr(1);
        let hash		= (a.hash || '').replace('#','');
        let path 		= (a.pathname || '').replace(/^([^\/])/,'/$1');

        return {
            protocol	: protocol,
            host		: hostName,
            port		: port,
            path 		: path,
            hash		: hash,
            queryString : queryString,
            /***
             * 如果 key 为空，返回 querystring 的 key-value 数组
             * 如果 key 不为空，返回 key 对应的值
             * @param key
             * @returns {*}
             */
            params		: function(key) {
                let result = {},
                    segs = queryString.split('&');

                for (let i = 0;i < segs.length; i++) {
                    if (!segs[i]) { continue; }
                    let keyValuePair = segs[i].split('=');
                    result[keyValuePair[0]] = keyValuePair[1];
                }

                if(key) {
                    return result[key];
                }
                return result;
            },
            /***
             * 跳转到 newUrl
             * @param newUrl
             * @param backwards bool， 是否可以后退
             */
            redirect	: function(newUrl, backwards) {
                if(backwards) {
                    document.location.href = newUrl;
                }
                else {
                    document.location.replace(newUrl);
                }
            }
        };
    }

    kJS.log = function(msg, label) {
        console.log((new Date()).format() + ' [' + (label || 'Log') + ']: ', msg);
    }

    kJS.RegexHashRouter = (function () {
        let win = this;

        let popstateChanged = function(event) {
            let hash = document.location.hash.substr(1);

            // 在 Hash 执行之前
            win.hashPreRender && win.hashPreRender.call(this);

            for (let hash_key in win.hashScriptsInPage) {
                let result = (new RegExp(hash_key)).exec(hash);
                if (result !== null) {
                    // callback 的 this 指向 正则匹配的结果
                    let callback = win.hashScriptsInPage[hash_key];
                    callback && callback.call(result, hash, result.groups);
                    break;
                }
            }
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

                win.hashScriptsInPage[hash] = callback;
            },
            preRender: function(callback) {
                win.hashPreRender = callback;
            },
            /***
             * 执行 hash 分发操作
             * @param defaultHash
             * @param callback
             */
            dispatch: function (defaultHash, callback) {
                // 配置默认跳转
                if(!document.location.hash) {
                    document.location.hash = defaultHash;
                }
                else {
                    popstateChanged();
                }

                // 执行默认的回调，并以 hash 作为参数
                callback && callback.call(this, document.location.hash.substr(1));

                if (window.addEventListener) {
                    window.addEventListener('popstate', popstateChanged, false);
                } else {
                    window.attachEvent('onpopstate', popstateChanged);
                }
            }
        }
    })();

    kJS.PageJs = (function () {
        let win = this;

        return {
            /***
             * 根据 location.path 加载对应的 javascript
             * @param path  path 是 location.path
             * @param callback
             */
            ready: function (path, callback) {
                win.pageScripts[path] = callback;
            },
            /***
             * 根据当前的 location.path 执行对应的 javascript
             */
            run: function () {
                let path = kJS.uri().path;
                let callback = win.pageScripts[path];
                callback && callback.call(this);
            }
        }
    })();

    kJS.util = (function () {
        let win = this;

        return {

        }
    })();

    return kJS;
});
