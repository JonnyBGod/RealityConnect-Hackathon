define(["backbonestore"],function(e){var t="text!templates/listings/pager.html",n={};return n.List=e.View.extend({nameBase:"js-results-pager",settings:{},events:{"click .js-pager-item":"setPage"},id:"js-pager",initialize:function(t){_.bindAll(this,"render","renderCallback","setPage","pageEventName","activePage","prevPage","nextPage"),_.extend(this.settings,t),this.collection.on("complete",this.render),this.name=this.nameBase+"-"+this.settings.name,this._currentPage=$(".js-pager").find(".js-pager-item").filter(".active").attr("data-page"),this._total=$(".js-pager-item").eq(-2).data("page"),HMSEvent.on(t.name+"-render-complete",this.render,this)},render:function(e){this.view=e,HMSTemplate.get(t,this.renderCallback)},renderCallback:function(e){this.view&&this.view.el&&this.setElement(this.view.el);var t=this.collection.metadata.pagerdata;if(t&&t.Pages&&t.Pages>1){var n=e.render(t);this.$el.find("[data-id='"+this.id+"']").html(n)}else this.$el.find("[data-id='"+this.id+"']").empty();this.collection.metadata.pagerdata?(this._currentPage=this.collection.metadata.pagerdata.Current,this._total=this.collection.metadata.pagerdata.Pages):(this._currentPage=1,this._total=0),this.classUpdate()},pageEventName:function(){return this.classUpdate(),this.name+"-get"},triggerPaging:function(e){this._currentPage=e;var t=0;$("h1").length>0&&(t=$("h1").offset().top),$("html, body").animate({scrollTop:t},2e3),HMSEvent.trigger(this.pageEventName(),e)},classUpdate:function(){this._currentPage==1?$('*[data-page="prev"]').addClass("disabled"):$('*[data-page="prev"]').removeClass("disabled"),this._currentPage==this._total?$('*[data-page="next"]').addClass("disabled"):$('*[data-page="next"]').removeClass("disabled")},setPage:function(e){e.preventDefault();var t=$(e.currentTarget),n=t.attr("data-page");n==n/1&&this.triggerPaging(n),n=="next"&&(n=this.nextPage(),n>this._total?$.log("disable next"):this.triggerPaging(n)),n=="prev"&&(n=this.prevPage(),this._currentPage==1&&n==1?$.log("disable prev"):this.triggerPaging(n))},activePage:function(){var e;return e=this.$el.find(".js-pager-item").filter(".active").attr("data-page"),e},prevPage:function(){var e=1,t=parseInt(this.activePage());return t>1&&(e=t-1),e},nextPage:function(){var e=1,t=parseInt(this.activePage());return e=t+1,e}}),n})