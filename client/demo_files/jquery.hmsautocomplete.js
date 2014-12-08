(function(e){e.hmsautocomplete=function(t,n){var r={container:e("body"),options:null,min:1,suppressEnter:!0,currency:!1,tinyscroll:!0,onSelect:function(){},onComplete:function(){}},s=[],o=this,u=null,a,f,l;o.settings={};var c=function(){o.settings=e.extend({},r,n),o.el=t,a=o.settings.templateType&&o.settings.templateType.match(/table/)!=null?"tr":"li",HMSEvent.on("abort-autocomplete",o.abortAll)};o.create=function(){var t=this;this.id=this.el.attr("id"),this.el.unbind("keyup").keyup(function(n){u!=null&&clearTimeout(u),n==null?key=event.keyCode:key=n.which;if(key==40)return n.preventDefault(),t.arrowDown(n),!1;if(key==38)return n.preventDefault(),t.arrowUp(n),!1;if(key==13)return n.stopPropagation(),n.preventDefault(),t.keyboardSubmit(n),!1;var r=e(this);n.type=="paste"&&r.val(r.val().trim()),r.val().length>=t.settings.min&&(u=setTimeout(function(){t.parseData()},200))}),this.el.unbind("paste").bind("paste",function(e){setTimeout(function(){t.ThrottleParsedata(e)},200)})},o.ThrottleParsedata=function(t){var n=e(t.currentTarget);t.type=="paste"&&n.val(n.val().trim()),n.val()&&n.val(n.val().ltrim()),n.val().length>=o.settings.min&&(u=setTimeout(function(){o.parseData()},200))},o.arrowDown=function(t){if(e("#js-autocomplete-"+this.id).length>0){var n=e("#js-autocomplete-"+this.id);n.css("display")=="none"&&n.fadeIn(),n.stopTime();var r=n.find(".js-active");if(r.length>0)var i=r.closest(a+':not(".js-hidden")').next();else var i=n.find(a+':not(".js-hidden"):first');if(i.length>0){r.removeClass("js-active active"),i.addClass("js-active active");if(n.find(".scroll").length>0){var s=n.find(a+':not(".js-hidden")').index(i);s>4&&n.tinyscrollbar_update((s-4)*i.outerHeight())}var u=i.attr("data-value");o.settings.currency?this.el.val(o.settings.utilities.addCommas(u)):this.el.val(u),this.el.data("value",u)}}},o.arrowUp=function(){if(e("#js-autocomplete-"+this.id).length>0){var t=e("#js-autocomplete-"+this.id);t.css("display")=="none"&&t.fadeIn(),t.stopTime();var n=t.find(".js-active"),r=n.prev().not(".js-hidden");if(r.length==0)t.oneTime(500,function(){t.fadeOut()});else{n.removeClass("js-active active"),r.addClass("js-active active");if(t.find(".scroll").length>0){var i=t.find(a+':not(".js-hidden")').index(r);i>3&&t.tinyscrollbar_update((i-4)*r.outerHeight())}var s=r.attr("data-value");o.settings.currency?this.el.val(o.settings.utilities.addCommas(s)):this.el.val(s),this.el.data("value",s),o.releaseEnterKey()}}},o.keyboardSubmit=function(t){var n=e("#js-autocomplete-"+this.id);n.fadeOut(),o.releaseEnterKey()},o.parseData=function(){this.settings.url!=null?this.parseAjax():_.isArray(this.settings.options)?this.parseArray():this.parseJSON()},o.parseJSON=function(){var e=this.el.val()+"",t=this.settings.options},o.abortPending=function(){e.each(s,function(e,t){t.abort()})},o.abortAll=function(){e.each(s,function(e,t){t.abort()});var n=e("#js-autocomplete-"+t.attr("id"));n.fadeOut()},o.parseAjax=function(){var t=this.el.val(),n=this,r;this.abortPending(),r=e.ajax({url:this.settings.url,contentType:"application/json; charset=utf-8",dataType:"text",data:{ss1:t},beforeSend:function(){e(".js-autocomplete").block()},success:function(t){t.match(/^[\(]/)!=null&&(t=t.substr(1,t.length),t=t.substr(0,t.length-1)),t=e.parseJSON(t),n.settings.onComplete(n,t),e(".js-autocomplete").unblock()}}),s.push(r)},o.parseArray=function(){var e=this.settings.currency&&this.el.val().substr(0,1)=="$"?this.el.val().substr(1):this.el.val(),t=this.settings.options,n=[];for(var r=0;r<t.length;r++){var i=new RegExp("^"+e),s=t[r]+"";s.match(i)!=null&&n.push(t[r])}this.renderArray(n)},o.renderArray=function(t){var n=this.el.attr("id");e("#js-autocomplete-"+n).remove();if(e("#js-autocomplete-"+n).length==0){var r=[];r.push('<div class="js-autocomplete autocomplete autocomplete-'+n+'" id="js-autocomplete-'+n+'">'),r.push('<ul class="autocomplete-list">');for(i=0;i<t.length;i++){var s=t[i];this.settings.currency&&(s=o.settings.utilities.addCommas(formatCurrency(t[i],!1))),r.push('<li class="autocomplete-item autocomplete-suggestion" data-value="'+t[i]+'"><a class="autocomplete-link" href="javascript:void(0)">'+s+"</a></li>")}r.push("</ul></div>"),t.length>0&&this.render(r)}},o.render=function(t){var n=this.el.attr("id");e("#js-autocomplete-"+n).remove();var r=_.isArray(t)?t.join(""):t;e("body").append(r);var i=e("#js-autocomplete-"+n),s=0,u=-2;if(e("#"+this.id).parent().hasClass("js-autocomplete-position")){var a=e("#"+this.id).parent();s=parseFloat(a.css("padding-left")),a.attr("data-classes")&&i.addClass(a.attr("data-classes"))}else var a=o.el;var f=a.outerWidth();a.css("padding-bottom")&&(u+=parseFloat(a.css("padding-bottom"))),a.css("border-left-width")&&(s+=parseInt(a.css("border-left-width"))),i.css({display:"block",opacity:0,width:f}),e("#"+n).is(":visible")&&i.position({of:e("#"+n),my:"left top",at:"left bottom",offset:"-"+s+" +"+u,collision:"none"}),this.addEvents(i),this.show()},o.releaseEnterKey=function(){o.el.unbind("keydown")},o.addEvents=function(t){var n=this;this.settings.suppressEnter&&this.el.unbind("keydown").keydown(function(e){e==null?key=event.keyCode:key=e.which;if(key==13)return e.stopPropagation(),e.preventDefault(),n.keyboardSubmit(e),!1}),t.delegate(a,"click",function(r){r.preventDefault();var i=e(this),s=i.attr("data-value");n.settings.currency?n.el.val(n.settings.utilities.addCommas(s)):n.el.val(s),n.el.data("value",s),n.releaseEnterKey(),n.el.focus(),t.fadeOut()}),t.delegate(a,"mouseenter",function(){var t=e(this);t.addClass("hover")}),t.delegate(a,"mouseleave",function(){var t=e(this);t.removeClass("hover")}),t.mouseenter(function(){e(this).stopTime()}),this.el.unbind("blur").blur(function(e){n.abortPending(),n.keyboardSubmit(e),t.trigger("mouseleave")})},o.show=function(){var t=this.el.attr("id"),n=e("#js-autocomplete-"+t);n.find(".scroll").length>0&&n.tinyscrollbar(),n.show().animate({opacity:1},200)},c()}})(jQuery)