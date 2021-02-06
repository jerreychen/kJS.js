/**
 * jQuery extenstions by KUAKEE Inc.
 * ---------------------------------------
 * Copyright 2017 Jerrey Chen
 * Created at 2017.07.31
 * Last modified at 2021.01.10
 * ---------------------------------------
 * Released under the MIT license
 */

(function($) {
  
  /***
   * 给 ajax 添加默认配置
   */
  $.ajaxSetup({
    cache: false,
    type: 'POST',
    dataType: 'json',
    context: $(document)
  });

  let lib = (function() {
    
    function getCssLinks() {
      let arr = [];
      $('link').each(function(i, elem) { 
        let href = $(elem).attr('href');
        if(href) {
          arr.push(href);
        }
      });
      return arr;
    }

    function getScripts() {
      let arr = [];
      $('script').each(function(i, elem) { 
        let src = $(elem).attr('src');
        if(src) {
          arr.push(src);
        }
      });
      return arr;
    }

    return {
      isCss: function() {
        if(arguments.length == 0) {
          return true;
        }

        let cssLinks = getCssLinks();

        $.each(arguments, function(i, elem) {
          let exists = cssLinks.filter((css,i) => {
            return css.indexOf(elem) >= 0;
          }).length > 0;

          if(!exists) {
            throw '脚本终止：样式库“' + elem + '”未正确引用！'
          }
        });
      },

      isScript: function() {
        if(arguments.length == 0) {
          return true;
        }

        let scriptLinks = getScripts();

        $.each(arguments, function(i, elem) {
          let exists = scriptLinks.filter((s,i) => {
            return s.indexOf(elem) >= 0;
          }).length > 0;

          if(!exists) {
            throw '脚本终止：脚本库“' + elem + '”未正确引用！'
          }
        });
      }
    }
  })();

  lib.isCss('bootstrap', 'font-awesome');
  lib.isScript('bootstrap');

  /***
   * 给 jQuery 添加扩展
   */
  $.extend({
    isString: function (value) {
      return jQuery.type(value) === 'string';
    },
    isRegex: function (value) {
      return jQuery.type(value) === "regexp";
    },
    isDate: function (value) {
      return jQuery.type(value) === "date";
    },
    isBoolean: function (value) {
      return jQuery.type(value) === 'boolean';
    },
    isNumber: function (value) {
      return jQuery.type(value) === 'number';
    },
    isNullOrUndefined: function (value) {
      return jQuery.type(value) === "undefined" || jQuery.type(value) === "null";
    },

    reverse: function(objArray) {
      let result = [];
      $.each(objArray, function(i, obj) {
        result.splice(0, 0, obj);
      });
      return $(result);
    },

    /**
     * @param {*} option
     * String (html content)
     * or
     * Object {
     *  bgColor: String('#000000'),
     *  closable: Boolean,
     *  content: String,
     *  opacity: FLOAT(0.5) < 1,
     *  beforeShow: Function,
     *  onShow: Function,
     *  beforeClose: Function,
     *  onClose: Function,
     * }
     */
    mask: function(option) {
      let offset = ($.isString(option)) ? { 'content': option } : option;
      
      let config = $.extend({
        bgColor: '#000000',     // 背景颜色
        closable: false,        // 是否可以被关闭，true：点击任何位置关闭
        content: '',            // mask 上的内容
        opacity: 0.35,          // 透明度，默认 0.5
        beforeShow: $.noop,     // 显示之前触发
        onShow: $.noop,         // 显示后触发
        beforeClose: $.noop,    // 关闭之前触发，
        onClose: $.noop         // 关闭后触发
      }, offset);
      
      let loadingControl = (function() {
        return {
          /**
           * 
           * @param {String} type primary/secondary/success/danger/warning/info/light/dark
           */
          create: function(type) {
            let $container = $('<div />').addClass('spinner-border').addClass('text-' + (type || 'primary')).attr('role', 'status');
            $container.html('<span class="sr-only">Loading...</span>');
            return $container;
          }
        }
      })();

      /* 随机数字用来标记遮罩 */
      let rdn = Math.floor(Math.random() * 1000000);
      /* 生成遮罩的底层容器 */
      let $containerLayer = $('<div id="kkui-mask-layer' + rdn + '"/>').appendTo(document.body);
      /* 生成遮罩背景容器 */
      let $maskLayer = $('<div />').css({
        'background-color'		: config.bgColor,
        'filter'				: 'alpha(opacity=' + (config.opacity * 100) + ')',
        '-moz-opacity'			: config.opacity,
        'opacity'				: config.opacity,
        'cursor'				: 'wait',
        'height'				: '100%',
        'position'				: 'fixed',
        'top'					: 0,
        'width'					: '100%',
        'z-index'				: 99999
      });
      // 生成遮罩层的内容容器
      let $contentLayer = $('<div />').css({
        'cursor'				: 'normal',
        'margin'				: '0 auto',
        'min-width'			: '1em',
        'min-height'		: '1em',
        'position'			: 'fixed',
        'z-index'				: 99999
      });
      // 注册 unmask 事件，执行关闭
      $containerLayer.bind('unmask', function() {
        config.beforeClose && config.beforeClose.call($contentLayer);
        $containerLayer.hide().remove();
        config.onClose && config.onClose.call($contentLayer);
      });
      
      $containerLayer.append($maskLayer, $contentLayer);
      // 公开 unmask 事件
      $.extend($containerLayer, {
        'unmask': function() {
          $containerLayer.triggerHandler('unmask');
        },
        'close': function () {
          $containerLayer.triggerHandler('unmask');
        }
      });

      config.beforeShow && config.beforeShow.call($contentLayer);
      $contentLayer.html(config.content || loadingControl.create('light').outerHtml());
      config.onShow && config.onShow.call($contentLayer);
      
      /* 当窗口resize时候，触发resize事件更改遮罩的面积 */
      $contentLayer.css({
        'top' 				: ($(window).outerHeight() - $contentLayer.outerHeight()) / 2,
        'left'				: ($(window).outerWidth() - $contentLayer.outerWidth()) / 2
      });
      $(window).on('resize', function() {
        $contentLayer.css({
          'top' 				: ($(window).outerHeight() - $contentLayer.outerHeight()) / 2,
          'left'				: ($(window).outerWidth() - $contentLayer.outerWidth()) / 2
        });
      });
      
      if(config.closable) {
        $maskLayer.on('click', function () {
          $containerLayer.triggerHandler('unmask');
        });
      }
      
      return $containerLayer;
    },
    
    dialog: function(option) {
      let config = $.extend({
        title: '对话框',
        content: '',
        width: '480px',
        height: '270px',
        buttons: [],    // array of button
        // button: { text:  '', cssClass: '', onClick: function() {} }
        onShow: $.noop,
        onClose: $.noop
      }, option || {});
      
      let btnEvents = {};
      
      let $dialogContainer = $('<div />').css({
        'height'                    : config.height,
        'width'                     : config.width,
      }).addClass('kkui-dialog-container bg-white border rounded');
      
      let $dialogTitleContainer = $('<div />')
        .addClass('kkui-dialog-container__title d-flex border-bottom rounded-top')
        .appendTo($dialogContainer);
      
      $('<div />').addClass('p-2 mr-auto font-weight-bold').html(config.title || '未定义').appendTo($dialogTitleContainer);
      $('<div />').addClass('px-2 py-1')
        .html('<button type="button" class="close" title="关闭" aria-label="Close">\n' +
          '  <span aria-hidden="true">&times;</span>\n' +
          '</button>')
        .appendTo($dialogTitleContainer);

      let $dialogContentContainer = $('<div />').addClass('kkui-dialog-container__content d-flex flex-column rounded-bottom').appendTo($dialogContainer);
      $('<div />').addClass('p-2').html(config.content).appendTo($dialogContentContainer);
      
      /* 如果有 button，将 button 添加入 */
      if(config.buttons.length > 0) {
        let $dialogButtons = $('<div />')
          .addClass('d-flex mt-auto pb-4 px-5')
          .addClass(config.buttons.length == 1 ? 'justify-content-end' : 'justify-content-between')
          .appendTo($dialogContentContainer);
        
        $.each(config.buttons, function (i, btn) {
          let btnIdentifier = 'kkui-dialog-btn-' + i;
          $('<a href="javascript:void(0);" role="button"/>')
            .addClass('kkui-dialog-btn btn btn-sm px-4').addClass(btn.cssClass)
            .attr('id', btnIdentifier)
            .text(btn.text)
            .appendTo($dialogButtons);
          
          btnEvents[btnIdentifier] = btn.onClick;
        });
      }
      
      let $msk = this.mask({
        content: $dialogContainer.outerHtml(),
        onShow: function () {
          this.find('button.close').on('click', function() {
            $msk.unmask();
          });
          
          let containerHeight = this.find('.kkui-dialog-container').outerHeight();
          let titleHeight = this.find('.kkui-dialog-container__title').outerHeight();
          this.find('.kkui-dialog-container__content').css('height', (containerHeight - titleHeight) + 'px');
          
          this.find('.kkui-dialog-btn').each(function(i, btn) {
            let $btn = $(btn);
            $btn.unbind('click').on('click', function(e) {
              let callback = btnEvents[$btn.attr('id')];
              callback && callback.call($msk);
              e.preventDefault();
            })
          });
          
          config.onShow && config.onShow.call(this.find('kkui-dialog-content'));
        },
        onClose: config.onClose
      });
    },
    
    alert: function(msg, option) {
      let config = $.extend({
        title: '',
        buttonText: '确定',
        onClose: jQuery.noop
      }, option || {});
      
      $.dialog({
        title: '<span class="fa fa-exclamation font-weight-bold">&nbsp; ' + (config.title || '提示信息') + '</span>',
        content: msg,
        width: '380px',
        height: '180px',
        buttons: [
          { text: config.buttonText, cssClass: 'btn-primary', onClick: function () {
              this.close();
            }
          }
        ],
        onClose: config.onClose
      });
    },
    
    confirm: function(msg, yesCallback, noCallback, option) {
      let config = $.extend({
        title: '',
        cancelButtonText: '取消',
        okButtonText: '确定',
        onClose: jQuery.noop
      }, option || {});
      
      $.dialog({
        title: '<span class="fa fa-question font-weight-bold">&nbsp; ' + (config.title || '用户确认') + '</span>',
        content: msg,
        width: '380px',
        height: '180px',
        buttons: [
          { text: config.cancelButtonText, cssClass: 'btn-secondary', onClick: function () {
              noCallback && noCallback.call(this);
              this.close();
            }
          },
          { text: config.okButtonText, cssClass: 'btn-primary', onClick: function () {
              yesCallback && yesCallback.call(this);
              this.close();
            }
          }
        ],
        onClose: config.onClose
      });
    },

    getHtml: function(url) {
      if(!url) {
        throw 'url 地址未配置！';
      }

      return new Promise((resolve, reject) => {
        let $msk = null;
        $.get({
          url: url,
          type: 'GET',
          dataType: 'text',
          contentType: "application/text; charset=utf-8",
          beforeSend: function(xhr) {
            $msk = $.mask();
          },
          success: function(res) {
            resolve(res);
          },
          complete: function() {
            $msk.unmask();
          }
        });
      });
    }
  });
  
  /***
   * 给 jQuery 对象添加扩展
   */
  $.fn.extend({
    /***
     * 获取 jQuery 对象的 tagName
     * @returns {*}
     */
    tagName: function () {
      return this.prop('nodeName');
    },
    
    /***
     * 获取 jQuery 对象的 html 内容（含自身）
     * @returns {*}
     */
    outerHtml: function () {
      return this.prop('outerHTML');
    },
    
    setScreenHeight: function(offset) {
      let $me = this;
      
      $me.css({ 'overflow-y': 'auto' }).outerHeight($(window).outerHeight() - (offset || 0));
      /* 当窗口resize时候，触发resize事件更改高度 */
      $(window).on('resize', function() { 
        let screenHeight = $(window).outerHeight() - (offset || 0);
        $me.outerHeight(screenHeight);
      });

      return $me;
    },
    
    /***
     * 热键 Alt + （键值）
     * @param keyCode
     * @param callback
     */
    altHotKey: function (keyCode, callback) {
      this.keydown(function (e) {
        if (e.altKey && e.which == keyCode && callback) {
          callback.call(e);
        }
      });
    },
    
    /***
     * 热键 Ctrl + （键值）
     * @param keyCode
     * @param callback
     */
    ctrlHotKey: function (keyCode, callback) {
      this.keydown(function (e) {
        if (e.ctrlKey && e.which == keyCode && callback) {
          callback.call(e);
        }
      });
    },
    
    /***
     * 热键 Shift + （键值）
     * @param keyCode
     * @param callback
     */
    shiftHotKey: function (keyCode, callback) {
      this.keydown(function (e) {
        if (e.shiftKey && e.which == keyCode && callback) {
          callback.call(e);
        }
      });
    },

    dropdownMenu: function(option) {
      let config = $.extend({
        cssClass: '',
        items: []
      }, option || {});

      let dropdownMenuControl = (function() {
        let $dropdown = $('<dl />').addClass('dropdown-menu m-0').addClass(config.cssClass || '');
      
        return {
          create: function() {
            return $dropdown;
          },

          addItem: function($item) {
            $dropdown.append($item);
          }
        }
      })();

      let dropdownMenuItemControl = (function() {
        return {
          create: function(_cfg) {
            let $menuitem = $('<dd class="dropdown-menu__item text-center m-0 p-2" />').addClass(_cfg.cssClass || '').css('cursor', 'pointer');
            let $link = $('<a />').text(_cfg.title || '未定义');
            $menuitem.append($link);

            $menuitem.hover(function(){
              $(this).addClass('bg-light');
            }, function() {
              $(this).removeClass('bg-light');
            }).on('click', function(e) {
              _cfg.onClick && _cfg.onClick.call(e, $menuitem);
            });
            return $menuitem;
          }
        }
      })();

      if(this.find('.dropdown-menu').length > 0) {
        return;
      }

      let $dpd = dropdownMenuControl.create();
      this.css('cursor', 'pointer').append($dpd);

      config.items.forEach(function(_item_cfg) {
        dropdownMenuControl.addItem(dropdownMenuItemControl.create(_item_cfg));
      });

      this.hover(function() {
        $dpd.show();
        if($(this).outerWidth() < $dpd.outerWidth()) {
          $dpd.css('left', $(this).outerWidth() - $dpd.outerWidth());
        }
      }, function() {
        $dpd.hide();
      });
    },

    accordionCard: function(option) {
      
      this.css('border-left', '5px solid transparent');

      this.each(function(i, card) {
        if($(card).children().length <= 1) {
          $(card).css('cursor', 'pointer');
          return;
        }

        $(card).children().not(':first-child').hide();

        let $cardTitle = $($(card).children().eq(0));
        $icon = $('<em class="fa position-absolute fa-angle-down" />').appendTo($cardTitle);
        $icon.css({
          'left': $cardTitle.outerWidth() - $icon.outerWidth() * 2,
          'top': ($cardTitle.outerHeight() - $icon.outerHeight()) / 2
        });

        $cardTitle.css('cursor', 'pointer').on('click', function(e) {
          let $card = $(e.currentTarget).parent();
          let cnt = $card.data('cnt') || 0;
          
          $(e.currentTarget).siblings().slideToggle();
          $(e.currentTarget).find('em.fa').toggleClass('fa-angle-down fa-angle-up');

          $card.css('border-left-color', cnt % 2 == 0 ? '#17a2b8' : 'transparent').toggleClass('expanded');
          $card.data('cnt', cnt+1);

          $expandedCard = $card.siblings('.expanded');
          if($expandedCard.length > 0) {
            $expandedCard.data('cnt', $expandedCard.data('cnt') + 1);
            $expandedCard.css('border-left-color', 'transparent').toggleClass('expanded');
            $expandedCard.children().not(':first-child').slideToggle();
            $($expandedCard.children().eq(0)).find('em.fa').toggleClass('fa-angle-down fa-angle-up');
          }
        });
      });

    },

    setForm: function(option) {
      let config = $.extend({
        url: '',                // 提交数据的接口 url
        data: {},
        beforePost: $.noop,     // function(postData)
        complete: $.noop
      }, option || {});

      let $me = this;

      // 处理 form 的数据，修改 提交的数据可以使用 $.extend()
      let readyPost = config.beforePost.call($me, config.data);
      // beforePost 方法可以阻止 请求发生
      if(readyPost === false) {
        return false;
      }
      
      // url 未设置，只有 data，不执行ajax请求
      if(!config.url) {
        
        for(key in config.data) {
          $me.find(':input[name="'+key+'"]').val(config.data[key]);
        }

        config.complete && config.complete.call($me, config.data);

        return;
      }

      let $msk = null;
      $.ajax({
        url: config.url,
        data: config.data,
        beforeSend: function() {
          $msk = $.mask();
        }
      }).then(function(res) {

        for(key in res.data) {
          $me.find(':input[name="'+key+'"]').val(res.data[key]);
        }

        config.complete && config.complete.call($me, res.data);

        $msk.unmask();
      });
    },

    /***
     * 获取form的数据（form内的字段必须设置 name 属性的才可以被取到）
     * @param {Object} [validator=null] 数据验证器
     */
    getFormData: function(validator) {
      if(this.length !== 1) {
        throw '脚本执行错误，对象未找到或找到多个，无法识别！';
      }
      
      let dataArr;
      let nodeName = this.tagName();
      // serialize 方法必须是 form 元素才有用
      if (nodeName === 'FORM') {
        dataArr = this.serializeArray();
      } else {
        let $frm = $('<form />').addClass('dynamic-form');
        this.wrap($frm);
        dataArr = this.parent().serializeArray();
        this.unwrap();
      }
      // 解析 form 的数据结果
      let result = {};
      $.each(dataArr, function (i, item) {
        let key = item.name;
        let value = item.value;
        if (result[key]) {
          let arr = ($.isArray(result[key])) ? result[key] : [result[key]];
          arr.push(value);
          result[key] = arr;
        } else {
          result[key] = value;
        }
      });

      // 如果没有配置正确的 validator，直接返回数据
      if(!validator || !$.isPlainObject(validator)) {
        return result;
      }

      // 如果设置了 validator，先验证数据字段
      let $me = this;
      let isValidated = true; 
      $.each(validator, function (key, fn) {
        let $field = $me.find(':input[name="' + key + '"]');
        isValidated = isValidated && ($field.length > 0) && fn.call($field, result[key]);
        
        // 如果 isValidated 不是 true，结束遍历
        if (isValidated !== true) {
          $field.on('change', function () {
            let $current = $(this);
            let r = fn.call($field, $current.val());
            if (r !== true) {
              $current.removeClass('is-valid').addClass('is-invalid');
            } else {
              $current.removeClass('is-invalid').addClass('is-valid');
            }
          }).trigger('change').trigger('focus').trigger('hover');
          
          return false;
        } else {
          $field.off('change');
        }
      }); 

      if(!isValidated) { 
        return false; 
      }

      return result;
    },
    
    /***
     * Form 表达数据提交（*** 所有 form 字段必须设置 name 属性，否则取不到数据）
     * @param option 参数设置
     */
    postForm: function (option) {
      let config = $.extend({
        url: '',                // 提交数据的接口 url
        data: {},
        confirm: null,
        submitButtonID: '',     // 提交按钮的ID，'#'开头
        $submitButton: null,
        validator: null,
        beforePost: $.noop,     // function(postdata)
        onSuccess: $.noop       //
      }, option || {});
      
      let $me = this;
      
      if (!config.url) {
        throw '脚本执行错误，url地址未提供！';
      }
      
      if ($me.length !== 1) {
        throw '脚本执行错误，对象未找到或找到多个，无法识别！';
      }

      if (config.submitButtonID) {
        config.$submitButton = this.find(config.submitButtonID);
      }
      
      if (config.$submitButton.length !== 1) {
        throw '脚本执行错误，提交按钮未找到或找到多个，无法识别！';
      }
      
      function ajaxPostData(url, formData, on_success) {
        let $btn = this;
        let $msk = null;

        $.ajax({
          url: url,
          data: formData,
          beforeSend: function () {
            // 防止重复提交
            $btn.attr('aria-disabled', true);
            // 打开遮罩层
            $msk = $.mask();
          },
          success: function (result) {
            // 调用数据处理完成的回调方法
            on_success && on_success.call($btn, result);
          },
          error: function (xhr, err) {
            $.alert('服务器接口调用失败，错误信息：'
              + err
              + '，请检查网络链接，如需进一步信息，请联系开发者协助处理！');
          },
          complete: function () {
            $btn.removeAttr('aria-disabled');
            // 去掉遮罩层
            $msk.unmask();
          }
        });
      }

      // 触发 click 事件，unbind 防止冒泡
      config.$submitButton.unbind('click').on('click', function (e) {
        let formData = $me.getFormData(config.validator);
        
        // 验证 field 字段的结果不为 true
        if (formData === false) {
          return false;
        }

        // 加载默认data选项
        formData = $.extend(config.data, formData);
        // 处理 form 的数据，修改 提交的数据可以使用 $.extend()
        let readyPost = config.beforePost.call($me, formData);
        // beforePost 方法可以阻止 请求发生
        if(readyPost === false) {
          return false;
        }
        
        if(config.confirm) {
          $.confirm(config.confirm, function() {
            ajaxPostData.call($(e.target), config.url, formData, config.onSuccess);
          })
        }
        else {
          ajaxPostData.call($(e.target), config.url, formData, config.onSuccess);
        }
        e.preventDefault();
      });
    },

    /**
     * 文件自动上传功能
     * @param {*} config 文件上传的相关配置
     */
    autoUpload: function(option) {
      let $el = $(this);

      if($el.attr('type').toLowerCase() !== 'file') {
        throw '元素不是 file 类型，不支持文件上传功能！';
      }

      let config = $.extend({
        url: '',                // 文件上传的后端地址 url
        cssProgressbar: null,
        beforePost: $.noop,     // function(files)
        onProgress: $.noop,
        onSuccess: $.noop       //
      }, option || {});

      if(!config.url) {
        throw '文件上传的后端地址必须配置！';
      }

      let progressbar = (function() {
        let instance = null;
        let $me = null;

        function createInstance($elem, cssStyle) {
          $me = $('<div />').css($.extend({ 
            'align-items': 'center',
            'color': '#FFF',
            'display': 'flex',
            'justify-content': 'center',
            'height': '100%',
            'background': '#1E90FF',
            'opacity': 0.25,
            'position': 'absolute',
            'text-align': 'center',
            'top': 0,
            'z-index': 99
          }, cssStyle || {}));
          
          $elem.after($me);

          return {
            setValue: function(value) {
              $me.css('width', value + '%').text(value + '%');
              if(value == 100) {
                setTimeout(function() {
                  $me.remove(); 
                  $me = null;
                  instance = null;
                }, 1000);
              }
            }
          }
        }

        return {
          createTo: function($elem, cssStyle) {
            if(!instance) {
              instance = createInstance($elem, cssStyle);
            }

            return instance;
          }
        }
      })();

      $el.on('change', function(e) {
        let files = e.target.files;

        // 如果 beforepost 返回值是 false，终止文件上传
        if(config.beforePost && config.beforePost.call(this, files) === false) {
          return;
        }

        let formdata = new FormData();
        for(let i = 0; i < files.length; i++) {
          formdata.append('file_' + (i+1), files[i]);
        }
 
        $.ajax({
          url: config.url,
          type: 'POST', 
          data: formdata,
          processData: false,//必须
          contentType: false,//必须
          // 给xhr增加 progress事件监听
          xhr: function() {
            let me = $.ajaxSettings.xhr();
            if(!me.upload) {
              return me;
            }

            me.upload.addEventListener('progress',function(e){
              let percent = Math.floor(100 * e.loaded/e.total);     //已经上传的百分比

              let pgb = progressbar.createTo($el, config.cssProgressbar);
              pgb.setValue(percent);
              
              config.onProgress && config.onProgress.call($el, percent);
            }, false);

            return me;
          },
          success: function(res) {
            config.onSuccess && config.onSuccess.call($el, res);
          }
        })
      });
    },

    contextMenu: function(option) {
      let $me = this;

      let config = $.extend({
        cssClass: '',
        items: []
      }, option || {});

      let ctxMenu = (function() {
        let instance = null;
 
        let menuItemControl = (function() {
          /**
           * 创建 MenuItem
           * @param {*} menu_item
           * String (title) or Object: {
           *  title: String
           *  iconClass: String
           *  onClick: Function
           * }
           */
          return {
            create: function(menu_item) {
              let menu = menu_item;
              if($.isString(menu_item)) {
                menu = {
                  title: menu_item
                }
              }

              let $menuItem = $('<div />').addClass('kkui-context-menu__item d-flex align-items-center px-2 py-1')
                            .css({
                              'cursor': 'default'
                            });

              if(menu.title === '-') {
                $menuItem.removeClass('kkui-context-menu__item').addClass('kkui-context-menu__spliter')
                            .css('height', 0)
                            .append('<div class="border-bottom" style="height: 0; width: 100%" />');

                return $menuItem;
              }

              if(menu.faiconClass) {
                let $icon = $('<i />').addClass('mr-2 fa').addClass(menu.faiconClass || '');
                $menuItem.append($icon);
              }

              let $title = $('<span />').text(menu.title || '未定义');
              $menuItem.append($title).hover(function() {
                $(this).addClass('bg-primary text-white');
              }, function() {
                $(this).removeClass('bg-primary text-white');
              })
              
              if(menu.onClick) {
                $menuItem.on('click', function(e) {
                  menu.onClick.call($menuItem, instance.eArg); 
                  e.preventDefault();
                  instance.hide(); 
                });
              }

              return $menuItem;
            }
          }
        })();

        function createContextMenuInstance() {
          // 创建容器
          let $ctxMenu = $('<div />').addClass('kkui-context-menu bg-light border rounded p-2 shadow-sm')
                        .addClass(config.cssClass)
                        .css({
                          'position': 'absolute',
                          'min-width': '150px',
                          'z-index': 9999
                        });

          let ctxMenuItems = [];
          $.each(config.items, (i, element) => {
            let $ctxMenuItem = menuItemControl.create(element);
          
            if(!element.subItems || !$.isArray(element.subItems)) {
              ctxMenuItems.push($ctxMenuItem);
              return true; // continue $.each
            }
          
            let $ctxSubMenu = $('<div />').addClass('kkui-context-menu__sub-items bg-light border rounded p-2 shadow-sm text-dark')
                                .css({
                                  //'min-width': '150px',
                                  'overflow': 'hidden',
                                  'position': 'absolute', 
                                  'text-overflow': 'ellipsis',
                                  'white-space': 'nowrap'
                                }).hide();

            let subMenuItems = [];
            $.each(element.subItems, (i, elem) => {
              subMenuItems.push(menuItemControl.create(elem));
            });

            $ctxSubMenu.append(subMenuItems);

            $ctxMenuItem.append($('<i class="ml-auto fa fa-angle-right font-weight-bold" />'))
                        .append($ctxSubMenu)
                        .hover(function() {
                          let pos = instance.getPosition();
                          let pos_left = instance.getWidth() - 10;
                          let pos_top = $(this).position().top;
                          
                          if(pos.left + pos_left + $ctxSubMenu.outerWidth() > $(window).width()) {
                            pos_left = pos_left - $ctxSubMenu.outerWidth() - instance.getWidth() + 20;
                          }
                          
                          // 这里加了 scrollTop（当页面出现滚动条，应该将滚动条的偏移量计算在内）
                          if(pos.top + pos_top + $ctxSubMenu.outerHeight() > $(window).height() + $(window).scrollTop()) {
                            pos_top = $(window).height() + $(window).scrollTop() - pos.top - $ctxSubMenu.outerHeight();
                          }

                          $ctxSubMenu.addClass('opened').css({
                            'left': pos_left,
                            'top': pos_top
                          }).show();
                        }, function() {
                          $ctxSubMenu.removeClass('opened').hide();
                        }); 

            ctxMenuItems.push($ctxMenuItem);
          });

          $ctxMenu.append(ctxMenuItems).appendTo($(document.body));

          return {
            getPosition: function() {
              return $ctxMenu.position();
            },
            getWidth: function() {
              return $ctxMenu.outerWidth();
            },
            getHeight: function() {
              return $ctxMenu.outerHeight();
            },

            inArea: function(pageX, pageY) {
              let pos = this.getPosition();

              function betweenNumber(min, max) {
                if(!$.isNumber(this)) {
                  return false;
                }

                return this > min && this < max;
              }
              
              if(betweenNumber.call(pageX, pos.left, pos.left + this.getWidth())
                && betweenNumber.call(pageY, pos.top, pos.top + this.getHeight()) ) {
                  return true;
              }
                
              let $subMenu = $($ctxMenu.find('.kkui-context-menu__sub-items.opened'));
              if($subMenu.length > 0) { 
                let subMenuPos = $subMenu.position();
                if(betweenNumber.call(pageX, pos.left + subMenuPos.left, pos.left +subMenuPos.left + $subMenu.outerWidth())
                  && betweenNumber.call(pageY, pos.top + subMenuPos.top, pos.top +subMenuPos.top + $subMenu.outerHeight()) ) {
                    return true;
                }
              }

              return false;
            },

            show: function(posX, posY) {
              if($(window).width() < $ctxMenu.outerWidth() + posX) {
                posX = posX - $ctxMenu.outerWidth();
              }

              // 这里加了 scrollTop（当页面出现滚动条，应该将滚动条的偏移量计算在内）
              if($(window).height() + $(window).scrollTop() < $ctxMenu.outerHeight() + posY) {
                posY = $(window).height() + $(window).scrollTop() - $ctxMenu.outerHeight();
              }

              $ctxMenu.css({
                'top': posY || 0,
                'left': posX || 0
              }).show();
            },

            hide: function() {
              $ctxMenu.find('.kkui-context-menu__item').removeClass('bg-primary text-white');
              $ctxMenu.hide();
            }
          }
        }

        return {
          getInstance: function(e) {
            if(!instance) {
              instance = createContextMenuInstance();
            }

            instance.eArg = e;

            return instance;
          }
        }
      })();

      // 禁用默认菜单
      $me.on('contextmenu', function(e){ 
        ctxMenu.getInstance(e).show(e.pageX, e.pageY);

        e.preventDefault();
      }).on('click', function(e) {
        if(ctxMenu.getInstance().inArea(e.pageX, e.pageY)) {
          return false;
        }

        ctxMenu.getInstance().hide();
      });
  
    },

    checkboxList: function(option) {
      let config = $.extend({
        selectorID: '',       // 全选的控制元素 id，#开头
        unSelectorID: '',     // 不选的控制元素 id，#开头，当 selector 不是 checkbox 时候生效
        reverseSelectorID: '',// 反选的控制元素 id，#开头，当 selector 不是 checkbox 时候生效
        reverse: false,       // 反选，只有当 selector 是 checkbox 时候生效
        defaultValue: { 'off': 0, 'on': 1 }  // 默认值，如果 checkbox 没有设置 value，on：选中的值，off：未选的值
      }, option || {});

      let $me = this;
      if($me.attr('type').toLowerCase() !== 'checkbox') {
        throw '元素不是 checkbox 类型，不支持该功能！';
      }

      if(!config.selectorID) {
        throw '全选控制元素的id必须设置！';
      }
      let $selector = $(config.selectorID);
      if($selector.length == 0) {
        throw '没有找到全选控制元素！';
      }

      if($selector.tagName() === 'INPUT' && $selector.attr('type').toLowerCase() === 'checkbox') { 
        $selector.on('change', function(e) {
          if(!config.reverse) {
            $me.prop('checked', e.target.checked);
            return;
          }

          $me.each(function(i, item) {
            $(item).prop('checked', !$(item).prop('checked'));
          })
        });
      }
      else {
        $selector.on('click', function(e) {
          $me.prop('checked', true);
        });

        let $unSelector = $(config.unSelectorID);
        if(!$unSelector.attr('type') || $unSelector.attr('type').toLowerCase() !== 'checkbox') {

          $unSelector.on('click', function(e) {
            $me.prop('checked', false);
          });

        }

        let $reverseSelector = $(config.reverseSelectorID);
        if(!$reverseSelector.attr('type') || $reverseSelector.attr('type').toLowerCase() !== 'checkbox') {

          $reverseSelector.on('click', function(e) {
            $me.each(function(i, item) {
              $(item).prop('checked', !$(item).prop('checked'));
            })
          });

        }
      }

      return {
        getCheckedValue: function () {
          let result = [];

          $me.filter(':checked').each(function(i, item) {
            let value = $(item).val();
            result[$(item).attr('name') ?? i] = value == 'on' ? config.defaultValue[value] : value;
          });

          return result;
        },

        getValue: function() {
          let result = [];

          $me.each(function(i, item) {
            let value = $(item).prop('checked') ? $(item).val() : 'off';
            result[$(item).attr('name') ?? i] = $.inArray(value, ['off', 'on']) >= 0 ? config.defaultValue[value] : value;
          });

          return result;
        }
      }
    },

    /**
     * 
     * @param {Object} option
     * option: {
     *  cssClass: '',
     *  columns: [
     *    { title: String, cssClass: String, sortable: false, dataKey: String, render: String/Function },
     *    {...},
     *    ...
     *  ],
     *  pageSize: 0
     * }
     */
    /* 例子
let $table = $('#tpl').kTable({
    cssClass: 'table-sm',
    //cacheKey: 'tb_pageindex',
    pageSize: 10,
    pageNum: 5,
    columns: [
        { title: '列1', dataKey: 'name', render: function(e) {  } },
        { title: '列2', dataKey: 'field1', editable: true, edit: true, editor: '<input class="form-control" style="width:100px;"/>', 
            render: function(e) { return '习惯！'; }
        },
        { title: '列5', style: 'width: 200px;', align: 'center', dataKey: 'name', buttons: [{
            text: '保存', cssClass: 'btn-cmd_save btn-light', visible: false,
                onClick: function($row, datakey, dataValue, rowData) {
                    
                    console.log(rowData);
                    console.log(this.changedData('id'));
                }
            }, { 
            text: '编辑', cssClass: 'btn-danger', 
                onClick: function($row, datakey, dataValue, rowData) {
                    if(!$row.isEditMode()) {
                        this.setText('取消');
                        this.siblings.get('.btn-cmd_save').show();
                        $row.setEditMode(true);
                    }
                    else {
                        this.setText('编辑');
                        this.siblings.get('.btn-cmd_save').hide();
                        $row.setEditMode(false);
                    }
                    this.toggleClass('btn-light');
                }
            }]
        }
    ]
});

$table.loadData({
    url: '/',
    data: { key: 100 },
    dataLoaded: function(res) {
        
    }
});
    */
    kTable: function(properties) {
      let config = $.extend({
        caption: '',
        pageNum: 5,
        pageSize: 0, // pageSize 设置为0表示不分页
        pageIndex: 0,
        cacheKey: false  // 缓存 localStorage, false 不缓存
      }, properties || {});
      let self = this;

      let localDataSource = (function() {
        let _instance = null;

        function createInstance(datasource) {
          let _dataSource = null; 
          
          return {
            setDatasource: function(datasource) {
              _dataSource = datasource;
            },
            isLocalData: function() {
              return _dataSource['mode'] == 'local';
            },
            setFilter: function(filter) {  
              // 如果是本地数据源，执行filter方法过滤数据
              if(this.isLocalData()) {
                if(!$.isFunction(filter)) {
                  throw '本地数据的过滤，filter 只接受数据回调方法：function(row_data) {}';
                }
  
                let _datalist = _dataSource['list'] || [];
                _dataSource['list'] = _datalist.filter(filter);
                _dataSource['totalRecords'] = _dataSource['list'].length;
  
                return;
              }
  
              if(!$.isPlainObject(filter)) {
                throw '远程数据的过滤，filter 只接受数据查询对象！';
              }
   
              _dataSource['post_data'] = $.extend(_dataSource['post_data'] || {}, filter || {});
            },
            getPage: function(pIndex) {
              return new Promise((resolve, reject) => {
                
                if(_dataSource['mode'] == 'local') {
                  if(config.pageSize <= 0) {
                    resolve( _dataSource['list'] );
                    return;
                  }
  
                  let startIndex = config.pageSize * pIndex;
                  let endIndex = startIndex + config.pageSize;
                  resolve( _dataSource['list'].slice(startIndex, endIndex) );
                  return;
                }
  
                if(!_dataSource['url']) {
                  throw '远程接口地址未配置！';
                }
  
                let post_data =  _dataSource['post_data'];
                // 修改 pageIndex 为新页面的index
                post_data['pageIndex'] = pIndex;
  
                let $msk = null;
                $.ajax({
                  url: _dataSource['url'],
                  data: post_data,
                  beforeSend: function() {
                    $msk = $.mask();
                  },
                  success: function(res) {
                    _dataSource['data_loaded'].call(self, res);
                    _dataSource['list'] = res.data.list;
                    _dataSource['totalRecords'] = res.data.totalRecords;
                    resolve( res.data.list );
                  },
                  complete: function() {
                    $msk.unmask();
                  }
                });
              });
            },
  
            total: function() {
              if(!_dataSource) {
                return 0;
              }
  
              return _dataSource['totalRecords'];
            }
          }
        }
        
        return {
          create: function(datasource) {
            if(!_instance) {
              _instance = createInstance();
            }

            _instance.setDatasource(datasource);

            return _instance;
          },

          getInstance: function() {
            if(!_instance) {
              throw '数据源为空，必须先调用 .create() 方法设置数据源！';
            }
            return _instance;
          }
        }
      })();

      let pagerControl = (function() {
        let instance = null;

        let pagerItemControl = (function() {

          return {
            create: function(pageIndex, arialLabel, disabled) {
              let $pagerItem = $('<li />').addClass('page-item');
              let $pagerItemLink = $('<a href="javascript:void('+ ($.isNumber(pageIndex) ? pageIndex + 1 : 0) +');"/>').addClass('page-link');
              $pagerItem.append($pagerItemLink);
  
              switch(arialLabel) {
                case 'Previous': 
                case 'Next': 
                case 'First':
                case 'Last':
                  $pagerItem.addClass('control').attr('aria-data', arialLabel.toLowerCase());
                  $pagerItemLink.attr('aria-label', arialLabel).append('<span aria-hidden="true">'+pageIndex+'</span>');
                break;
  
                case 'Current':
                  $pagerItem.addClass('active').attr('aria-current', 'page');
                  $pagerItemLink.append((pageIndex + 1) + ' <span class="sr-only">(current)');
                break;
                  
                default: 
                  $pagerItemLink.append(pageIndex + 1);
                break;
              }
  
              if(disabled) {
                $pagerItem.addClass('disabled');
                $pagerItemLink.attr('aria-disabled', true);
              }
              
              $pagerItem.on('click', function(e) {
                if($(this).hasClass('disabled') || $(this).hasClass('active')) {
                  return;
                }
  
                let totalCount = instance.$pager.data('total-count');
                let currentIndex = instance.$pager.data('page-index');
  
                let newPageIndex = 0;
                if($(this).hasClass('control')) {
                  switch($(this).attr('aria-data')) {
                    case 'first': newPageIndex = 0; break;
                    case 'next': newPageIndex = currentIndex + 1; break;
                    case 'previous': newPageIndex = currentIndex - 1; break;
                    case 'last': newPageIndex = Math.ceil(totalCount / config.pageSize) - 1; break;
                  }
                }
                else {
                  newPageIndex = pageIndex;
                }
                
                tableControl.getInstance().buildPage(newPageIndex);
              });
  
              return $pagerItem;
            }
          }
        })();

        let pagerSelectControl = (function() {
          let $dropdown = null;

          return {
            create: function() {
              if(!$dropdown) {
                $dropdown = $('<select />').addClass('custom-select ml-1').css('width', 'auto');
                $dropdown.on('change', function(e) {
                  tableControl.getInstance().buildPage($(e.target).val(), instance.$pager.data('total-count'));
                });
              }

              return $dropdown;
            }
          }
        })();
  
        function createPagerControl() {
          let $pagerContainer = $('<div />').addClass('kkui-pager d-flex align-items-center justify-content-between');
          let $pagerInfo = $('<div />').addClass('kkui-pager__info text-secondary').text('* 没有数据，共有 0 条记录！');
          let $pagerNavContainer = $('<nav aria-label="Page navigation" />').addClass('d-flex align-items-center ');
          let $pagerNav = $('<ul />').addClass('pagination justify-content-center mb-0');
          let $dropdown = pagerSelectControl.create();
          
          return {
            currentPageIndex: (config.cacheKey && sessionStorage.getItem(config.cacheKey) ? JSON.parse(sessionStorage.getItem(config.cacheKey)).pageIndex : config.pageIndex) || 0,
            $pager: $.extend($pagerContainer, {
              build: function(pageIndex, totalCount) {
                pageIndex = Number(pageIndex);
                totalCount = Number(totalCount);

                if(config.pageSize <= 0 || totalCount == 0) {
                  $pagerNavContainer.removeClass('d-flex').hide();

                  if(totalCount == 0) {
                    $pagerInfo.text('* 没有数据，共有 0 条记录'); 
                  }
                  else {
                    $pagerInfo.text('* 当前页显示第 {0} - {1} 条记录，共有 {1} 条记录'.format(1, totalCount));
                  }

                  return;
                }
                $pagerNavContainer.addClass('d-flex');

                let pageList = [];
                let pageCount = Math.ceil(totalCount / config.pageSize);

                let startIndex = 0;
                let endIndex = Math.min(config.pageNum, pageCount);

                if(pageCount > config.pageNum) {
                  if(pageCount - pageIndex > Math.ceil(config.pageNum / 2)) {
                    endIndex = (pageIndex > Math.floor(config.pageNum / 2)) 
                                ? pageIndex + Math.ceil(config.pageNum / 2) : Math.min(config.pageNum, pageCount);
                  }
                  else {
                    endIndex = pageCount;
                  }
                }
                if(endIndex - startIndex > config.pageNum) {
                  startIndex = endIndex - config.pageNum;
                }
                
                // 缓存页码
                $pagerContainer.data('page-index', pageIndex);
                $pagerContainer.data('total-count', totalCount);

                pageList.push(pagerItemControl.create('第一页', 'First', pageIndex == 0));
                pageList.push(pagerItemControl.create('上一页', 'Previous', pageIndex == 0));

                for(let i = startIndex; i < endIndex; i++) { 
                  pageList.push(pagerItemControl.create(i, pageIndex == i ? 'Current': ''));
                }

                pageList.push(pagerItemControl.create('下一页', 'Next', pageIndex >= pageCount - 1));
                pageList.push(pagerItemControl.create('最后一页', 'Last', pageIndex == pageCount - 1));

                $pagerNav.empty().append(pageList);

                $dropdown.empty().show();
                for(let i = 0;i < pageCount; i++) {
                  $dropdown.append($('<option />').text('第' + (i + 1) +'页').val(i).attr('selected', i == pageIndex));
                }

                $pagerInfo.text('* 当前页显示第 {0} - {1} 条记录，共有 {2} 条记录，第 {3} / {4} 页'
                                .format(config.pageSize * pageIndex + 1, 
                                  (config.pageSize * pageIndex + 1 > totalCount) ? config.pageSize * (pageIndex + 1) : Math.min(config.pageSize * (pageIndex + 1), totalCount), 
                                    totalCount, 
                                    pageIndex + 1, 
                                    Math.ceil(totalCount / config.pageSize)));
              }
            }),
            renderTo: function($container) {
              $pagerContainer.append($pagerInfo);

              if(config.pageSize > 0) {
                $pagerContainer.append($pagerNavContainer);
                $pagerNavContainer.append($pagerNav, $dropdown.hide());
              }
    
              $container.append($pagerContainer);
            }
          }
        }

        return {
          getInstance: function() {
            if(!instance) {
              instance = createPagerControl();
            }

            return instance;
          }
        }
      })();

      let tableControl = (function() {
        let instance = null;
       
        let dataRowControl = (function() {
          let dataBtnElement = (function() {
            return {
              create: function(_cfg, _dataKey, _dataItem, $row) {
                let $btn = $('<button type="button" />')
                            .addClass('btn btn-sm mr-1')
                            .addClass(_cfg.cssClass || '')
                            .text(_cfg.text || '按钮');

                $btn.on('click', function(e) {
                  $.extend(e, {
                    siblings: {
                      get: function(idx) {
                        if($.isNumber(idx)) {
                          return $($(e.target).siblings().eq(idx));
                        }
                        if($.isString(idx)) {
                          return $($(e.target).siblings(idx)[0]);
                        }
                        return null;
                      }
                    },
                    ownerTable: {
                      $caption: instance.$caption,
                      $header: instance.$header,
                      $body: instance.$body,
                      $footer: instance.$footer,
                      reload: function() {
                        table.buildPage(config.pageIndex);
                      }
                    },
                    setText: function(text) {
                      $btn.text(text);
                    },
                    toggleClass: function(cssClass) {
                     $btn.toggleClass(_cfg.cssClass).toggleClass(cssClass);
                    },
                    /**
                     * 返回更改过的数据
                     * @param {*} [dataKeys=null] 字符串，字段名称，多个字段英文状态（,)分隔开
                     * @return {Object}
                     */
                    changedData: function(dataKeys) {
                      let _changed = {};
                      if(dataKeys && $.isString(dataKeys)) {
                        dataKeys.split(',').forEach(function(key) {
                          key = $.trim(key);
                          if(_dataItem[key]) {
                            _changed[key] = _dataItem[key];
                          }
                        })
                      }

                      $.each($row.children('td[aria-editable]'), function(i, elem) {
                        let $elem = $(elem);
                        let col_idx = $elem.index();
                        let col_cfg = config.columns[col_idx];

                        if($elem.data('original_value') != _dataItem[col_cfg.dataKey]) {
                          _changed[col_cfg.dataKey] = _dataItem[col_cfg.dataKey];
                        }
                      });

                      return _changed;
                    }
                  });
                  _cfg.onClick && _cfg.onClick.call(e, $row, _dataKey, _dataItem[_dataKey], _dataItem);
                });

                if(_cfg.visible === false) {
                  $btn.hide();
                }
                else {
                  $btn.show();
                }

                return $btn;
              }
            }
          })();

          let dataFieldElement = (function() {
            return {
              create: function(_col, _dataKey, _dataItem, $td, $row) {
                $td.data('original_value', _dataItem[_col.dataKey]);

                let $div = $('<div />').addClass('inner_td');

                if(_col.editable) {
                  $td.attr('aria-editable', _col.editable);
                  if(_col.edit) {
                    let $editor = $(_col.editor || '<input class="form-control" />');
                    $editor.val(_dataItem[_col.dataKey] || '').on('change', function(e) {
                      $td.data('original_value', $(e.target).val());
                      _dataItem[_col.dataKey] = $(e.target).val();
                    })
                    $div.append($editor);
                    return $div;
                  }
                }

                let innerText = _dataItem[_col.dataKey] || '';
                if(_col.render && $.isFunction(_col.render)) {
                  innerText = _col.render.call($td, $row, _dataItem[_col.dataKey], _dataItem) || innerText;
                }

                $div.text(innerText);
                return $div;
              }
            }
          })();

          return {
            create: function(_dataItem) {
              let $row = $('<tr />');
              let columns = [];
              config.columns.forEach((col) => {
                let $td = $('<td  />').addClass(col.cssClass || '');
                if(col.align) {
                  $td.css('text-align', col.align);
                }
                // 设置了 buttons 属性数组，则该列不展示元素的值
                if(col.buttons && $.isArray(col.buttons)) {
                  let btns = [];
                  col.buttons.forEach(function(btn_cfg) {
                    btns.push(dataBtnElement.create(btn_cfg, col.dataKey, _dataItem, $row));
                  });
                  $td.append(btns);
                }
                else {
                  $td.append(dataFieldElement.create(col, col.dataKey, _dataItem, $td, $row));
                }
                columns.push($td);
              });
              $row.append(columns);

              $.extend($row, {
                isEditMode: function() {
                  return $(this).data('edit_mode');
                },

                setEditMode: function(_editmode) {
                  let $_currentRow = $(this);

                  $_currentRow.data('edit_mode', _editmode);

                  $.each($_currentRow.children('td[aria-editable]'), function(i, elem) {
                    let $elem = $(elem);
                    let $container = $($elem.children('div.inner_td')[0]);
                    let col_idx = $elem.index();
                    let col_cfg = config.columns[col_idx];

                    if(col_cfg.edit) {
                      return true;
                    }

                    if(_editmode) {
                      // 缓存原始数据，撤销后数据回滚
                      $elem.data('original_value', _dataItem[col_cfg.dataKey]);
                      let $editor = $(col_cfg.editor || '<input class="form-control" />').on('change', function(e) {
                        _dataItem[col_cfg.dataKey] = $(e.target).val();
                      });
                      $editor.val(_dataItem[col_cfg.dataKey] || '');
                      $container.empty().append($editor);
                    }
                    else {
                      _dataItem[col_cfg.dataKey] = $elem.data('original_value');
                      let innerText = _dataItem[col_cfg.dataKey] || '';
                      if(col_cfg.render && $.isFunction(col_cfg.render)) {
                        innerText = col_cfg.render.call($elem, $_currentRow, _dataItem[col_cfg.dataKey], _dataItem) || innerText;
                      }
                      $container.empty().text(innerText);
                    }
                  }); 
                }
              })
              return $row;
            }
          }
        })();
  
        function createTableControl(tableTitle, tableCssClass, tableColumns) {
          let $table = $('<table />').addClass('kkui-table table').addClass(tableCssClass || '');

          let $tableCaption = null;
          if(tableTitle) {
            $tableCaption = $('<caption align="top" />').text(tableTitle || '未定义');
            $table.append($tableCaption);
          }

          let $tableHeader = $('<thead />').addClass('kkui-table__header thead-light');
          $table.append($tableHeader);
    
          let $th_row = $('<tr />');
          let th_columns = [];
          tableColumns.forEach((col) => {
            let $th = $('<th scope="col" />').addClass(col.cssClass || '').text(col.title || '空');
            if(col.style) {
              $th.attr('style', col.style);
            }
            if(col.align) {
              $th.css('text-align', col.align);
            }
            th_columns.push($th);
          });
          $th_row.append(th_columns);
          $tableHeader.append($th_row);
    
          let $tableBody = $('<tbody />').addClass('kkui-table__body');
          $table.append($tableBody);
           
          let $tableFooter = $('<tfoot />').addClass('kkui-table__footer');
          let $tableFooterRow = $('<tr />');
          $tableFooter.append($tableFooterRow);
          let $tableFooterCol = $('<td />').attr('colspan', tableColumns.length);
          $tableFooterRow.append($tableFooterCol);
          $table.append($tableFooter);

          let pager = pagerControl.getInstance();
          pager.renderTo($tableFooterCol);
          
          return {
            $caption: $tableCaption,

            $header: $tableHeader,

            $body: $tableBody,

            $footer: $.extend($tableFooter, {
              $pager: pager.$pager
            }),
 
            setDatasource: function(data) {
              localDataSource.create(data);
            },

            buildPage: function(pIndex) {
              config.pageIndex = pIndex;
              if(config.cacheKey) {
                cacheData = JSON.parse(sessionStorage.getItem(config.cacheKey) || "{}");
                cacheData.pageIndex = pIndex;
                sessionStorage.setItem(config.cacheKey, JSON.stringify(cacheData));
              }
              // .then 异步执行，确保数据加载完成
              localDataSource.getInstance().getPage(pIndex).then(function(dataResult) {
                $tableBody.empty();
                 
                pager.$pager.build(pIndex, localDataSource.getInstance().total()); 
                
                let rows = [];
                dataResult.forEach(item => {
                  rows.push(dataRowControl.create(item));
                });
  
                $tableBody.append(rows);
              })
            },

            renderTo: function($container) {
              $container.empty().append($table);
            }
          }
        }

        return {
          getInstance: function() {
            return instance;
          },
          create: function(title, cssClass, columns) {
            if(!columns || !$.isArray(columns) || columns.length == 0) {
              throw '表格的列未正确配置！';
            }
      
            if(!instance) {
              instance = createTableControl(title, cssClass, columns);
            }

            return instance;
          }
        }

      })();

      let $container = this;
      let table = tableControl.create(config.caption, config.cssClass, config.columns);
      table.renderTo($container);

      return $.extend(this, {
        /**
         * 
         * @param {Object} option {
         *  url: String,
         *  paged: false,
         *  data: Object, // {}
         *  beforePost: Function, // 数据提交之前执行
         *  dataLoaded: Function  // 数据加载完成执行
         * }
         */
        loadData: function(option) {
          if(!option.url) {
            throw '获取数据的 url 地址未配置！';
          }

          let properties = $.extend({
            url: '',
            data: {},
            beforePost: $.noop,
            dataLoaded: $.noop
          }, option || {});

          let post_data = properties.data || {};
          if(config.pageSize > 0){
            post_data['pageSize'] = config.pageSize;
            post_data['pageIndex'] = Number(config.pageIndex) || 0;
          }

          // 如果 beforePost 返回值为 false，终止执行
          if(properties.beforePost.call(this, post_data) === false) {
            return;
          }

          table.setDatasource({
            mode: 'ajax',
            url: properties.url,
            post_data: post_data,
            data_loaded: properties.dataLoaded
          });
          // build page 1 (index: 0)
          table.buildPage(pagerControl.getInstance().currentPageIndex);
        },

        applyData: function(data) {
          if(!data || !$.isArray(data)) {
            return;
          }
          
          table.setDatasource({ 
            mode: 'local',
            list: data,
            totalRecords: data.length
          });
          // build page
          table.buildPage(pagerControl.getInstance().currentPageIndex);
        },
        /**
        * 
        * @param {Function} filter_fn 本地数据，提供查询方法，参数为当条数据， 返回 false 过滤
        */
       filter: function(filter) {
         localDataSource.getInstance().setFilter(filter);
         // build page
         table.buildPage(0);
       }
      });
    },

    kTabPage: function(option) {
      let config = $.extend({
        cssClass: '',
        autoHeight: false,
        activeIndex: 0,
        cacheKey: '', // 缓存tabs
        tabs: [], //默认添加的 tabs: [{ id: '', title: '', fixed: false, content: '', onShow: Function },...]
        onActivate: $.noop,
        onRemove: $.noop
      }, option || {});

      let tabItemControl = (function() { 
        return {
          create: function(_cfg) {
            
            let $titleItem = $('<li role="tab" />').addClass('tab-item px-3 py-2 position-relative')
            .css({
              'cursor': 'pointer',
              'flex': 'none'
            })
            .append($('<span />').text(_cfg.title || '未定义'));
            
            if(!_cfg.id) {
              _cfg.id = 'tab_' + Math.floor((new Date()).getTime() / 1000);
            }
            $titleItem.attr('data-tab-id', _cfg.id);

            if(_cfg.faiconClass) {
              $titleItem.prepend($('<i class="fa mr-1"/>').addClass(_cfg.faiconClass));
            }
            
            let $contentItem = $('<div role="tabpanel" />').addClass('tab-pane p-2 bg-white').css('min-height', '100%').html(_cfg.content || '');

            $titleItem.on('click', function(e) {
              let idx = $(e.currentTarget).index();
              $(e.currentTarget).data('click_pos_left', e.pageX);
              tabPageControl.getInstance().setActiveTab(idx);
            })

            if(_cfg.removable) {
              $('<i class="fa fa-close" />').css({
                'position': 'relative',
                'left': '.75rem',
                'top': '-.5rem'
              }).hover(function() {
                $(this).css('color', '#F00'); 
              }, function() { 
                $(this).css('color', ''); 
              }).on('click', function(e) {
                tabPageControl.getInstance().removeAt($(e.target).parent().index());
              }).appendTo($titleItem);
            }

            if(_cfg.onRender) {
              _cfg.onRender.call(window, { $title: $titleItem, $content: $contentItem });

              $titleItem.bind('refresh', function() {
                _cfg.onRender.call(window, { $title: $titleItem, $content: $contentItem });
              });
            }

            return {
              $title: $titleItem,
              $content: $contentItem
            };
          }
        }
      })();

      let tabPageControl = (function() {
        _instance = null;

        function createTabPageControl($container, _autoHeight) {
          let $tabTitleContainer = $('<div />').addClass('d-flex align-items-center bg-white border border-light');
          let $tabList = $('<ul role="tablist" />').addClass('kkui-tabpage__title d-flex flex-nowrap m-0 p-0 list-unstyled border-left').css({
            'overflow': 'hidden'
          });
          $.extend($tabList, {
            count: function() {
              return this.children('.tab-item').length;
            },

            offsetLeft: function() {
              return parseInt($(this.children('.tab-item')[0]).css('left'));
            },

            getChild: function(index) {
              return $(this.children('.tab-item').eq(index));
            },

            getChildByID: function(tab_id) {
              return this.children('.tab-item[data-tab-id="'+tab_id+'"]').index();
            },

            getFirstChild: function() {
              return this.getChild(0);
            },

            getLastChild: function() {
              return this.getChild(this.count() - 1);
            },

            isOverflow: function() {
              let totalWidth = 0;
              this.children('.tab-item').each(function(i, item) {
                totalWidth += $(item).outerWidth();
              });
              return this.outerWidth() < totalWidth;
            },

            getActiveChildIndex: function() {
              return this.children('.tab-item.active').index();
            }
          });
          
          let $tabContent = $('<div />').addClass('kkui-tabpage__content p-3 tab-content border border-top-0');
          $.extend($tabContent, {
            getChild: function(index) {
              return $(this.children('.tab-pane').eq(index));
            },
            getActiveChildIndex: function() {
              return this.children('.tab-pane.active').index();
            }
          });

          let iconButtonControl = (function() {
            return {
              create: function(title, faiconClass) {
                let $_btn = $('<a class="btn btn-md" />').append($('<i />').addClass(faiconClass));
                if(title) {
                  $_btn.attr('title', title);
                }
                $_btn.hover(function(){
                  $(this).addClass('text-primary');
                }, function() {
                  $(this).removeClass('text-primary');
                });
                return $_btn;
              }
            }
          })();
          
          let $btnHome = iconButtonControl.create('第一个Tab', 'fa fa-step-backward').on('click', function() {
            _instance.setActiveTab(0);
          });

          let $btnRefresh = iconButtonControl.create('刷新当前页', 'fa fa-refresh').on('click', function() {
            let currentIndex = $tabContent.getActiveChildIndex();
            $tabList.getChild(currentIndex).triggerHandler('refresh');
          });

          let $btnContainer = $('<div class="d-flex ml-auto pl-1 border-left" />');
          // tabItem 向左滑动控制按钮
          let $btnLeft = iconButtonControl.create('向前','fa fa-angle-double-left').on('click', function() {
            let lOffset = $tabList.offsetLeft();
            // 没有超出宽度，不需要滚动
            if(!$tabList.isOverflow() || lOffset == 0) {
              return;
            }

            let posLeft = lOffset + $tabList.outerWidth() / 2 ;
            if(posLeft >= 0) {
              posLeft = 0; 
            }
            
            $tabList.children('.tab-item').animate({ 'left': posLeft}); 
          });

          // tabItem 向右滑动控制按钮
          let $btnRight = iconButtonControl.create('向后','fa fa-angle-double-right').on('click', function() {
            let lOffset = $tabList.offsetLeft();
            let lPosLastChild = $tabList.getLastChild().data('pos_left');
            // 没有超出宽度，不需要滚动
            if(!$tabList.isOverflow() || lOffset < $tabList.outerWidth() - lPosLastChild) {
              return;
            }

            let posLeft = lOffset - $tabList.outerWidth() / 2;
            
            $tabList.children('.tab-item').animate({'left': posLeft}); 
          });

          let $btnLast = iconButtonControl.create('最后一个Tab', 'fa fa-step-forward').on('click', function() {
            _instance.setActiveTab($tabList.count() - 1);
          });

          // 添加左、右滑动操作按钮到容器中
          $btnContainer.append($btnLeft, $btnRight, $btnLast);

          $tabTitleContainer.append($btnHome, $btnRefresh, $tabList, $btnContainer);
          $container.empty().append($tabTitleContainer, $tabContent);

          if(!_autoHeight) {
            $tabContent.css('overflow-y', 'auto');
            $tabContent.outerHeight($container.height() - $tabTitleContainer.outerHeight() - 2);

            /* 当窗口resize时候，触发resize事件更改高度 */
            $(window).on('resize', function() {
              $tabContent.outerHeight($container.height() - $tabTitleContainer.outerHeight());
            });
          }

          return {
            addTab: function(_cfg) {
              if(_cfg.id && (tabIndex = $tabList.getChildByID(_cfg.id)) >= 0) {
                this.setActiveTab(tabIndex);
                return tabIndex;
              }

              let tab = tabItemControl.create(_cfg);
              
              $tabList.append(tab.$title);
              $tabContent.append(tab.$content);
              let item_pos_left = tab.$title.position().left;

              tab.$title.data('pos_left', item_pos_left);

              return $tabList.count() - 1;
            },

            setActiveTab: function(index) {
              // index 超出范围
              if(index > $tabList.count() - 1 || index < 0) {
                index = 0;
              }

              let $cur_item = $tabList.getChild(index);
              let $cur_pane = $tabContent.getChild(index);

              config.onActivate && config.onActivate.call($cur_item, $cur_item.attr('data-tab-id'), index);

              $cur_item.addClass('active bg-light').siblings().removeClass('active bg-light');
              $cur_pane.addClass('active').siblings().removeClass('active');

              if(index == 0 || !$tabList.isOverflow()) {
                $($tabList.children('.tab-item')).animate({'left': 0});
                return;
              }  

              if($tabList.isOverflow()) {
                let leftPos = - $cur_item.data('pos_left') + $tabList.outerWidth() / 2;
                $($tabList.children('.tab-item')).animate({ 'left': leftPos > 0 ? 0 :leftPos });
              }
            },

            getTab: function(index) {
              let $tab = $tabList.getChild(index)
              return {
                tabID: $tab.attr('data-tab-id'),
                $title: $tab,
                $content: $tabContent.getChild(index)
              };
            },

            getTabList: function() {
              return $tabList;
            },

            getTabIndex: function(page_id) {
              return $tabList.getChildByID(page_id);
            },

            setActiveTabByID: function(page_id) {
              let idx = this.getTabIndex(page_id);
              this.setActiveTab(idx);
            },

            setTabContent: function(page_id, html) {
              let idx = this.getTabIndex(page_id);
              let tab = this.getTab(idx);
              return tab.$content.empty().html(html);
            },

            removeAt: function(index) {
              // index 超出范围
              if(index > $tabList.count() - 1 || index < 0) {
                return;
              }

              let $cur_item = $tabList.getChild(index);

              let adjustPostLeft = $cur_item.outerWidth();
              $cur_item.nextAll().each(function(i, item) {
                let posLeft = $(item).data('pos_left');
                $(item).data('pos_left', posLeft - adjustPostLeft);
              })
              
              $cur_item.remove();
              $($tabContent.getChild(index)).remove();

              config.onRemove && config.onRemove.call($cur_item, $cur_item.attr('data-tab-id'), index);

              if(index == 0) {
                this.setActiveTab(0);
                return;
              }
              
              if(index == $tabList.children('.tab-item').length) { 
                this.setActiveTab(index - 1);
                return;
              }

              this.setActiveTab(index); 
            }
          }
        }

        return {
          createTo: function($container, _autoHeight) {
            if(!_instance) {
              _instance = createTabPageControl($container, _autoHeight);
            }
          },
          getInstance: function() {
            return _instance;
          }
        }
      })();

      let htmlContent = $.trim(this.html());
      this.addClass('kkui-tabpage').addClass(config.cssClass || '');

      tabPageControl.createTo(this, config.autoHeight);

      // 如果当前元素内有内容，将元素内的内容当做第一个tab
      if(htmlContent) {
        tabPageControl.getInstance().addTab({ title: '首页', removable: false, content: htmlContent });
      }

      // 如果设置了 tabs 属性
      if(config.tabs && config.tabs.length > 0) {
        config.tabs.forEach(function(tab_cfg){
          tabPageControl.getInstance().addTab(tab_cfg);
        });
      }

      let activeIndex = config.activeIndex || 0;
      if($.isFunction(config.activeIndex)) {
        activeIndex = config.activeIndex.call(tabPageControl.getInstance().getTabList());
      }
      tabPageControl.getInstance().setActiveTab(activeIndex);

      return {
        getTabPage: function(pageid) {
          let idx = tabPageControl.getInstance().getTabIndex(pageid);
          let tab = tabPageControl.getInstance().getTab(idx);
          return tab.$title;
        },

        addTabPage: function(_cfg) {
          let idx = tabPageControl.getInstance().addTab(_cfg);
          tabPageControl.getInstance().setActiveTab(idx);

          return new Promise((resolve, reject) => {
            resolve(tabPageControl.getInstance().getTab(idx));
          });
        },

        activateTabPage: function(pageid) {
          tabPageControl.getInstance().setActiveTabByID(pageid); 
        },

        setTabPageContent: function(pageid, html) {
          return tabPageControl.getInstance().setTabContent(pageid, html); 
        }
      }
    }
  });
  
})(jQuery);
