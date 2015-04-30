(function($) {
    "use strict";

    var AjaxChosen = function(options) {
        var $select = $(this);
        var params = $.extend({
            url: 'someUrl', //ajax url
            postData: {},   //additional post data
            delay: 500, //delay between ajax requests
            dynamicAdd: true //allow add value user on input
        }, options);

        var AjaxCh = function(el, options) {
            this.$select = $(el);
            this.$chosen = this.$select.next('.chosen-container');
            this.$chosenInp = this.$chosen.find('input');
            this.params = options;
            this.timeInited = false;
            this.ajaxInited = false;
            this.initEvents();
        };

        //Events
        AjaxCh.prototype.initEvents = function() {
            this.$chosenInp.on('input', $.proxy(this.getItems, this));
        };

        //Checkvalue
        AjaxCh.prototype.getItems = function(event) {
            var $el = $(event.currentTarget),
                _this = this;

            this.$chosen.find('.no-results').remove();

            //Check time delay
            if (!this.timeInited) {
                this.timeInited = true;
                this.initTimer();
            } else {
                clearTimeout(this.timer);
                this.initTimer();
            }
        };

        //Init timer
        AjaxCh.prototype.initTimer = function() {
            var _this = this;
            this.timer = setTimeout(function() {
                if (_this.$chosenInp.val().trim() !== '' && _this.ajaxInited === false) {
                    _this.sendAjax();
                }
            }, _this.params.delay);
        };

        AjaxCh.prototype.sendAjax = function() {
            var _this = this,
                postData = {
                    value: _this.$chosenInp.val(),
                    data: _this.params.postData
                };

            this.inpVal = postData.value.trim();
            this.$chosen.find('.chosen-drop').prepend('<div class="chosen-ajax-search"><i class="icon icon-loader css__spinner"></i>Поиск "' + postData.value + '"...</div>');
            this.ajaxInited = true;
            $.ajax({
                dataType: 'json',
                method: 'POST',
                url: _this.params.url,
                data: postData
            }).done(function(response) {
                _this.ajaxInited = false;
                _this.$chosen.find('.chosen-ajax-search').remove();
                
                if(_this.dynamicAdd === true) {
                    response.data.push(postData.value);
                }

                if (typeof response.data == 'object' && response.data.length > 0) {
                    _this.addElems(response.data);
                }
            });
        };

        //Add options
        AjaxCh.prototype.addElems = function(items) {
            var html = '';
            var selected = this.$select.val();
            if (selected) {
                //Удаляем все не выбранные
                this.$select.find('option').each(function(index, elem) {
                    var needRemove = true;
                    for (var i = 0, l = selected.length; i < l; i++) {
                        if (selected[i] == elem.value) {
                            needRemove = false;
                            break;
                        }
                    }
                    if (needRemove) {
                        $(elem).remove();
                    }
                });
            }

            //Check response elems
            $(items).each(function(index, elem) {
                //Dont add exist elems
                var needAdd = true;
                if (selected) {
                    for (var i = 0, l = selected.length; i < l; i++) {
                        if (selected[i] == elem) {
                            needAdd = false;
                            break;
                        }
                    }
                }

                if (needAdd) {
                    html += '<option value="' + elem + '">' + elem + '</option>';
                }
            });

            //Override or add new elems
            if (selected) {
                this.$select.append(html);
            } else {
                this.$select.html(html);
            }

            this.$select.trigger("chosen:updated");
            this.$chosenInp.val(this.inpVal);
        };

        return new AjaxCh($select, params);
    };

    $.fn.ajaxChosen = AjaxChosen;

})(jQuery);
