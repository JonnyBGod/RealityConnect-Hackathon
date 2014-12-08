define(["domReady","backbonestore","text!app/ui-modules/modal/templates/modal.html","app/ui-modules/leadcapture/leadcapture","innershiv","jquery-plugins/jquery.easing"],function(e,t,n,r){function f(){a&&a.view&&a.view.isoverlayOpened&&a.view.relocate()}var i={},s={},o="#js-modal",u=!0;s.Init=t.View.extend({initialize:function(e){var t=Hogan.compile(n),r=t.render(),i=$(o);i.length===0?$("body").append(r):i.replaceWith(r),this.view=new s.View(e)}}),s.View=t.View.extend({el:o,settings:{newElement:!1,triggerElement:null,content:"",url:"",outEffect:"topOut",inEffect:"topIn",effectSpeed:400,easingIn:"easeOutSine",easingOut:"easeInCirc",centerForm:!0,dragable:!0,overlay:!0,onClose:function(){HMSEvent.trigger("ui-remove-tooltip")}},events:{"click #js-modal-close":"hide"},initialize:function(e){var t=this;_.extend(this.settings,e),_.bindAll(this,"show","setContent","setContactForm","hide","showOverlay","hideOverlay","effectOut","effectIn","onContactFormRenderedComplete","relocate"),this.bind("open",this.show),this.bind("close",this.hide),this.settings.triggerElement&&$("body").on("click",e.triggerElement,function(n){e.left=this.parentElement.offsetLeft,e.top=this.parentElement.offsetTop+this.parentElement.offsetHeight+2,n.preventDefault(),n.stopImmediatePropagation(),t.trigger("open")}),this.modal=$(this.el),this.overlay=$("#js-overlay"),this.isoverlayOpened=!1,HMSEvent.on("onContactFormRenderedComplete",this.onContactFormRenderedComplete,this)},setPosition:function(){var t={modal:{width:this.modal.outerWidth(!0),height:this.modal.outerHeight(!0)},viewport:{width:$(window).width(),height:$(window).height()},scroll:{top:this.getScrollTop(),left:this.getScrollLeft()},top:0,left:0};this.settings.centerForm&&(t.viewport.height-t.modal.height>10?t.top=Math.floor((t.viewport.height-t.modal.height)/2)+t.scroll.top:this.dim&&this.dim.top?(t.top=this.dim.top,t.scroll.top-(t.modal.height-t.viewport.height)>-10&&(t.top=t.scroll.top-(t.modal.height-t.viewport.height+10))):t.top=10+t.scroll.top,t.left=Math.floor((t.viewport.width-t.modal.width)/2)),this.dim=t},getScrollTop:function(){return $("html").scrollTop()>0?$("html").scrollTop():$("body").scrollTop()>0?$("body").scrollTop():0},getScrollLeft:function(){return $("html").scrollLeft()>0?$("html").scrollLeft():$("body").scrollLeft()>0?$("body").scrollLeft():0},relocate:function(){this.isoverlayOpened&&this.settings.dragable&&(this.setPosition(),this.drag())},setContent:function(e){this.settings.content=e;var t=$(e),n=t.attr("id");this.modal.attr("id",n);var r=this.getClasses(t);r&&r!=""&&this.modal[0]&&n!="js-modal-msgnooffice"&&(this.modal[0].className=null),this.setClasses(r),this.modal.head=this.setHead(this.getHead(t)),this.modal.body=this.setBody(this.getBody(t)),this.modal.foot=this.setFoot(this.getFoot(t)),this.modal.closeIcon=this.setCloseIcon(this.getCloseIcon(t)),this.setPosition(),this.show()},setContactForm:function(e,t){this.settings.contactform=e;var n=$("<div/>").addClass("js-contactform").attr("data-contactformtype",e);this.modal.find("#js-modal-body").show().html(n),this.modal.body=this.modal.find("#js-modal-body"),r.createsingleform(n,t)},onContactFormRenderedComplete:function(e){e&&e.indexOf("modal")!=-1&&($content=$('.js-contactform[data-contactformtype="'+e+'"]'),this.modal.attr("id",$content.attr("id")),this.setClasses(this.getClasses($content)),this.modal.head=this.setHead(!1),this.modal.foot=this.setFoot(!1),this.modal.closeIcon=this.setCloseIcon(this.getCloseIcon($content)),this.setPosition(),this.show())},getClasses:function(e){return e.data("modal")?e.data("modal").classes:e.data("class")?e.data("class"):this.modal.data("default")?this.modal.data("default"):!1},getHead:function(e){return e.data("modal")&&e.data("modal").head?e.find(e.data("modal").head):!1},getBody:function(e){return e.data("modal")&&e.data("modal").body?e.find(e.data("modal").body):e?e.html():!1},getFoot:function(e){return e.data("modal")&&e.data("modal").foot?e.find(e.data("modal").foot):!1},getCloseIcon:function(e){return e.data("modal")&&e.data("modal").closeIcon?e.data("modal").closeIcon:this.modal.find("#js-modal-close").data("default")},setClasses:function(e){e&&this.modal.addClass(e)},setHead:function(e){var t=this.modal.find("#js-modal-head");return e?t.html(e).show():t.hide().html(""),t},setBody:function(e){var t=this.modal.find("#js-modal-body");return e?t.html(e).show():t.hide().html(""),t},setFoot:function(e){var t=this.modal.find("#js-modal-foot");return e?t.html(e).show():t.hide().html(""),t},setCloseIcon:function(e){var t=this.modal.find("#js-modal-close");return e&&t.addClass(e),t},setUrl:function(e){},resetModal:function(){this.modal.removeAttr("class").removeData("modal, class").attr("id","js-modal").addClass(this.modal.attr("id")+" "+this.modal.data("default")),typeof this.modal.head=="object"&&this.modal.head.removeAttr("class").removeData("modal, class").attr("id","js-modal-head").addClass(this.modal.head.attr("id")).hide().html(""),typeof this.modal.body=="object"&&this.modal.body.removeAttr("class").removeData("modal, class").attr("id","js-modal-body").addClass(this.modal.body.attr("id")).hide().html(""),typeof this.modal.foot=="object"&&this.modal.foot.removeAttr("class").removeData("modal, class").attr("id","js-modal-foot").addClass(this.modal.foot.attr("id")).hide().html(""),typeof this.modal.closeIcon=="object"&&this.modal.closeIcon.removeAttr("class").removeData("modal, class").attr("id","js-modal-close").addClass(this.modal.closeIcon.attr("id"))},effectOut:function(e){typeof this.settings.outEffect!="function"?this[this.settings.outEffect].call(this):this.settings.outEffect.call(this,this.modal,this.dim,this.settings)},effectIn:function(e){typeof this.settings.inEffect!="function"?this[this.settings.inEffect].call(this):this.settings.inEffect.call(this,this.modal,this.dim,this.settings)},showOverlay:function(){if(!this.isoverlayOpened){var e=this;this.overlay.length===0&&($("body").append('<div id="js-overlay"></div>'),this.overlay=$("#js-overlay")),this.overlay.css("opacity",0).addClass(this.overlay.data("default")).show().fadeTo(this.settings.effectSpeed*2,.8).click(function(){e.trigger("close")}),this.isoverlayOpened=!0}},hideOverlay:function(){this.isoverlayOpened&&(this.overlay.fadeTo(this.settings.effectSpeed*2,0,function(){$(this).hide()}).unbind("click"),this.isoverlayOpened=!1)},show:function(e){this.settings.overlay&&this.showOverlay(e),this.effectIn(),$("input").bind("focusin",function(e){u=!1}),$("input").bind("blur",function(e){u=!0}),$("textarea").bind("focusin",function(e){u=!1}),$("textarea").bind("blur",function(e){u=!0})},hide:function(e){HMSEvent.trigger("onBeforeModalClose",e),e&&e.preventDefault(),this.settings.overlay&&this.hideOverlay(),this.dim&&this.effectOut(),_.isFunction(this.settings.onClose)&&this.settings.onClose(),this.resetModal(),$(".model-user-login").removeClass("model-user-login"),$("#js-autocomplete-js-mls-change").hide(),HMSEvent.trigger("notifytracking-modalclose",{e:e}),HMSEvent.trigger("onAfterModalClose",e)},leftOut:function(){var e=this.dim.modal.width*-1-100;this.modal.animate({left:e,opacity:0},{duration:this.settings.effectSpeed,easing:this.settings.easingOut})},topOut:function(){var e=this.dim.modal.height*-1-100;this.modal.animate({top:e,opacity:0},{duration:this.settings.effectSpeed,easing:this.settings.easingIn})},bottomOut:function(){var e=this.dim.modal.height+this.dim.viewport.height+100;this.modal.animate({top:e,opacity:0},{duration:this.settings.effectSpeed,easing:this.settings.easingIn})},rightOut:function(){var e=this.dim.modal.width*-1-100;this.modal.animate({left:e,opacity:0},{duration:this.settings.effectSpeed,easing:this.settings.easingIn})},fadeOut:function(){this.modal.fadeOut()},leftIn:function(){var e=this.dim.viewport.width+this.dim.modal.width+100;this.modal.css({left:e,top:this.dim.top,display:"block",opacity:0}).animate({left:this.dim.left,opacity:1},{duration:this.settings.effectSpeed,easing:this.settings.easingIn})},rightIn:function(){var e=this.dim.modal.width*-1-100;this.modal.css({left:e,top:this.dim.top,display:"block",opacity:0}).animate({left:this.dim.left,opacity:1},{duration:this.settings.effectSpeed,easing:this.settings.easingIn})},topIn:function(){var e,t,n,r,i,s;this.settings.centerForm?(r=this.dim.modal.height*-1-100,n=this.dim.left,t=this.dim.top):(e=this.settings.top,t=e,n=this.settings.left,r=e,i=325,s=510),this.modal.css({top:r,width:i,height:s,left:n,display:"block",opacity:0}).animate({top:t,opacity:1},{duration:this.settings.effectSpeed,easing:this.settings.easingIn})},bottomIn:function(){var e=this.dim.modal.height+this.dim.viewport.height+100;this.modal.css({top:e,left:this.dim.left,display:"block",opacity:0}).animate({top:this.dim.top,opacity:1},{duration:this.settings.effectSpeed,easing:this.settings.easingIn})},randomIn:function(){var e=["top","left","bottom","right"],t=Math.floor(Math.random()*4);this[e[t]+"In"].call(this)},fadeIn:function(){this.modal.css({top:this.dim.top,left:this.dim.left,display:"block",opacity:1}).fadeIn()},drag:function(){u&&this.modal.animate({top:this.dim.top,left:this.dim.left,opacity:1},{duration:20,easing:this.settings.easingIn})}});var a=null;return HMSEvent.on("ui-modal-open",function(e){HMSEvent.trigger("ui-remove-notify"),e.url?a.view.setUrl(e.url):e.content?a.view.setContent(e.content):e.contactform&&a.view.setContactForm(e.contactform,e.data),HMSEvent.trigger("notifytracking-modalopen",e)}),HMSEvent.on("ui-modal-close",function(){HMSEvent.trigger("ui-remove-notify"),a&&a.view&&a.view.trigger("close")}),i.execute=function(e){a||(a=new s.Init(e)),HMSEvent.trigger("onModalReady")},window.onscroll=function(e){f()},window.onresize=function(e){f()},i})