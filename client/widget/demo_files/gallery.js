define(["domReady","backbonestore","app/ui-modules/modal/view","app/ui-modules/imagegallery/models/model","app/ui-modules/images/imageloader","hmsglobal","greensock/tweenmax"],function(e,t,n,r,i,s){function p(e){HMSEvent.trigger("onRegSwitch",{info:_objSwitchInfo})}function d(){return HMSUser&&!HMSUser.isLoggedout()?!0:!1}var o={},u={},a=!0,f=!1,l=!1,c=!1;_bolE2_framework=!1,_bolShowLogin=!1,_bolLoadMoreImages=!1,_numViewCounterMax=0,_numViewCounter=1,_numCurrentCount=0,_numTotalImages=0,_numTotalInfo=0,_numCounter=0,_numImgLoadCount=15,_numLoadCount=1,_arrImageInfo=new Array,_arrImgInfo=new Array,_arrSelectedThumb=[],_currentImage={},_newImage={},_objSwitchInfo={},_objImageInfo={},_bolCancelFramework=!1,thumbWidth=96,thumbHeight=65,galleryWidth=611,galleryHeight=458,gallerywidthQuiet=1e3,galleryHeightQuiet=750;var h="text!templates/user/alternate-registration.html";return u.View=t.View.extend({el:"#js-carousel",settings:{modal:!0,animate:!0,getimages:!1},events:{"click .js-carousel-next":"onLargeNavigateRightClick","click .js-carousel-prev":"onLargeNavigateLeftClick","click .js-carousel-thumb":"onThumbClick","click #js-carousel-left":"onScrollLeftClick","click #js-carousel-right":"onScrollRightClick"},model:new r.ImageGallery,initialize:function(e){_.extend(this.settings,e),_.bindAll(this,"render","buildGallery","onLargeNavigateRightClick","onLargeNavigateLeftClick","setSlider","onScroll","onNumCurrentChange"),this.bind("move",this.onLargeNavigateLeftClick),$(document).on("keydown",this.onKeypressDown);var t=this;setTimeout(function(){t.frameworkCheck()},1e3),HMSEvent.on("onRegSwitch",this.onRegSwitch,this),HMSEvent.on("onFrameWorkFunctionCallBack",this.onFrameworkCallback,this),HMSEvent.on("onDetailsMode",this.onSetGalleryMode,this),HMSEvent.on("onSetCurrentThumb",this.onSetCurrentThumb,this),_numCounter=parseInt($.cookie("ldpCount"))},frameworkCheck:function(){if(HMSUser!=null){var e=HMSUser.model.get("registrationSwitch");if(e.C3||e.C4)_bolShowLogin=!0;e.C3&&(_numViewCounterMax=3),e.C4&&(_numViewCounterMax=6),e.E1&&(c=!0),e.E2&&(_bolE2_framework=!0)}},isMobile:function(){var e=navigator.appVersion.indexOf("Mobile");return e>-1},render:function(e){var t=[];e&&e.ListingImages?(t=e,t.Itemprop="ListingImages",t.Images=e.ListingImages,this.buildGallery(t)):e&&e.IDXPhotoRef?(t=e,t.Itemprop="IDXPhotoRef",t.Images=e.IDXPhotoRef,this.buildGallery(t)):"no images"},buildGallery:function(e){_bolCancelFramework=!1,_numCurrentCount=0,_numViewCounter=1,_arrImgInfo=[],a=!0;var t=this;$("#js-carousel-menu-container").hide(),this.setElement("#js-carousel");var n=new Array,r=new Array;$.each(e.Images,function(t,i){var s='<div class="js-large-image carousel-image-frame " style="display:none; width:611px; height:458px; background-color: rgb(255, 255, 255)" > <img itemprop="'+e.Itemprop+'" class="js-carousel-large-image" alt="'+e.Address+" "+e.City+", "+e.State+", "+e.Zip+'" src="data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="'+i+'"  data-type="largeImage"></div>';n.push($(s));var o='<li class="js-carousel-item inline-unit width-1of5 media carousel-thumb"><a href="javascript:void(0)" class="js-carousel-thumb-box media-frame margin-half-horizontal carousel-thumb-frame skin-25" data-states=\'{"hover": "skin-26", "active": "skin-26", "normal": "skin-25"}\'><img itemprop="'+e.Itemprop+'" class="js-carousel-thumb media-item carousel-thumb-item" alt="" src="data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" width="96" height="65" data-width="96" data-height="65" data-src="'+i+'" data-maintainscale="1" data-timeout="-1" data-type="thumbnailImage"></a></li>';r.push($(o))}),_numTotalInfo=r.length,$("#js-carousel-menu-container").scrollLeft(0),$.each(n,function(e,t){$($(r[e]).find("img")).attr("data-index",e),e>=_numImgLoadCount?(_bolLoadMoreImages=!0,_arrImageInfo.push({lg:$(t),th:$(r[e])}),$(t).remove(),$(r[e]).remove()):(_bolLoadMoreImages=!1,_arrImgInfo.push({lg:$(t),th:$(r[e])}),$("#js-carousel-menu").append($(r[e])),$("#js-carousel-image").append($(t)))}),$("#js-carousel-menu-container").scroll(function(){_bolLoadMoreImages&&t.onScroll()}),$("img[itemprop='ListingImages']").length===0&&$("img[itemprop='IDXPhotoRef']").length===0?($("#js-carousel-menu-container").hide(),$("#js-carousel-menu-container-no-image").show()):(i.GetThumbnails("#js-carousel"),this.getThumbs(),$("#js-carousel-menu-container").fadeIn(2e3)),this.setElement("#js-carousel"),this.swipeSetup(),l&&($("#js-carousel-image").height(galleryHeightQuiet),$("#js-carousel-image").width(gallerywidthQuiet),$(".js-large-image").height(galleryHeightQuiet),$(".js-large-image").width(gallerywidthQuiet))},addToLoad:function(){var e=this;$.log("addToLoad");if(_arrImgInfo.length!=_numTotalInfo){var t=new Array;t=_arrImageInfo.splice(0,_numImgLoadCount),$.each($(t),function(e,t){var n=$(t)[0].lg,r=$(n),i=$(t)[0].th,s=$(i);$("#js-carousel-image").append($(r)[0]),$("#js-carousel-menu").append($(s)[0]),_arrImgInfo.push({lg:n,th:i})}),_bolLoadMoreImages=!0}else _bolLoadMoreImages=!1,$(".js-carousel-prev").show();i.GetThumbnails("#js-carousel"),this.restartThumbs(),this.largeImages.restart(),l&&($("#js-carousel-image").height(galleryHeightQuiet),$("#js-carousel-image").width(gallerywidthQuiet),$(".js-large-image").height(galleryHeightQuiet),$(".js-large-image").width(gallerywidthQuiet))},getThumbs:function(e){this.restartThumbs(),f=this.settings.getimages;var t=new Array;if(this.settings.getimages)this.model.fetch({success:function(e){new u.ThumbnailMenu(e.attributes.listingImages)}});else{var n=$("#js-carousel-menu li").find("img");this.thumbnails||(this.thumbnails=new u.ThumbnailMenu),this.thumbnails.render(t),this.largeImages||(this.largeImages=new u.LargeImage),this.largeImages.onStart()}},restartThumbs:function(){var e=$("#js-carousel-menu-container").find("img");$.each(e,function(e,t){$(this).height(thumbHeight+"px"),$(this).width("auto")})},setSlider:function(e){var t=e.self,n=e.amount;for(var r=0;r<n;r++)$(".js-carousel-item:last").after($(".js-carousel-item:first"));$("#js-carousel-menu").css({left:0}),t.setElement("#js-carousel")},swipeSetup:function(){$("#js-carousel-image").swipe({swipe:function(e,t,n,r,i){t=="left"&&$(".js-carousel-next").trigger("click"),t=="right"&&$(".js-carousel-prev").trigger("click")}})},onKeypressDown:function(e){e.keyCode==37?$(".js-carousel-prev").trigger("click"):e.keyCode==39?$(".js-carousel-next").trigger("click"):e.keyCode==27&&HMSEvent.trigger("event-keyboard-escape",this)},onLargeNavigateLeftClick:function(e){var t=[];return t.count=_numCurrentCount-1,t.slide="prev",t.single=!0,_bolLoadMoreImages?(this.addToLoad(),_numCurrentCount-1!=-1?this.showImageByID(t):_numCurrentCount=0):this.showImageByID(t),!1},onLargeNavigateRightClick:function(e){_bolLoadMoreImages&&this.addToLoad();var t=[];return t.count=_numCurrentCount+1,t.slide="next",t.single=!0,this.showImageByID(t),!1},onThumbClick:function(e){e.preventDefault(),_bolLoadMoreImages&&this.addToLoad();var t=$(e.currentTarget);_objSwitchInfo.current=!1,_objSwitchInfo.self=t,_objSwitchInfo.id=0;var n=[];return n.count=t.data("index"),n.slide="goto",this.checkImage(n),!1},onScrollLeftClick:function(e){e.preventDefault();var t=$(e.currentTarget),n=[];n.slide="prev",n.single=!1},onScrollRightClick:function(e){e.preventDefault();var t=$(e.currentTarget),n=[];n.slide="next",n.single=!1},onScroll:function(e){var t=this;$(t).data("scrollTimeout")&&clearTimeout($(t).data("scrollTimeout")),$(t).data("scrollTimeout",setTimeout(function(){t.addToLoad()},250,t))},showImageByID:function(e){var t=_arrImgInfo.length-1;e.count==-1&&(e.count=_arrImgInfo.length-1),e.count==_arrImgInfo.length&&(e.count=0),e.count==_arrImgInfo.length+1&&(e.count=1);var n=_arrImgInfo[e.count];_objSwitchInfo.current=!0,_objSwitchInfo.self=n,_objSwitchInfo.id=e,this.checkImage(e)},checkImage:function(e){var t=[];t.callback=p,t.arg=_objSwitchInfo,_numCounter=parseInt($.cookie("ldpCount")),_numViewCounter++,!d()&&_numViewCounter>=_numViewCounterMax&&_bolShowLogin&&!_bolCancelFramework?c||_bolE2_framework?(c&&_numCounter%3==0&&_numCounter<=9&&_numViewCounterMax==3&&(this.altRegModal||(this.altRegModal=new u.AltRegistrationModal(t)),this.altRegModal.showModal(t)),c&&_numCounter>9&&HMSEvent.trigger("user-show-register",{callback:p,args:_objSwitchInfo}),_bolE2_framework&&_numCounter%3==0&&_numCounter<=9&&_numViewCounterMax==6&&(this.altRegModal||(this.altRegModal=new u.AltRegistrationModal(t)),this.altRegModal.showModal(t)),_bolE2_framework&&_numCounter>9&&this.displayImage(e),_numCounter%3!=0&&_numCounter<=9&&this.displayImage(e)):HMSEvent.trigger("user-show-register",{callback:p,args:_objSwitchInfo}):this.displayImage(e)},displayImage:function(e){HMSEvent.trigger("navigation_"+e.slide,{index:e.count},this)},onSetGalleryMode:function(e){e=="quietmode"?(l=!0,$("#js-carousel-image").height(galleryHeightQuiet),$("#js-carousel-image").width(gallerywidthQuiet),$(".js-large-image").height(galleryHeightQuiet),$(".js-large-image").width(gallerywidthQuiet)):(l=!1,$("#js-carousel-image").height(galleryHeight),$("#js-carousel-image").width(galleryWidth),$(".js-large-image").height(galleryHeight),$(".js-large-image").width(galleryWidth))},onFrameworkCallback:function(e){_bolCancelFramework=!0},onRegSwitch:function(e){_objSwitchInfo.current},onSetCurrentThumb:function(e){var t=e.index;if(t!=_numCurrentCount||t==0){var n=$("#js-carousel-menu"),r=$("#js-carousel-menu li").find("[data-index='"+t+"']"),i=r.parent().parent(),s=r.parent();_arrSelectedThumb=r.parent().parent(),$(i).toggleClass("active"),$(i).find("a").toggleClass("active"),$(i).siblings().removeClass("active"),$(i).siblings().find("a").removeClass("active");var o=$("#js-carousel-menu-container"),u=$(i),r=$("#js-carousel-menu li").find("[data-index='"+t+"']"),i=r.parent().parent();try{o.scrollLeft(u.offset().left-o.offset().left+o.scrollLeft()-230)}catch(e){}}_numCurrentCount=t,HMSEvent.trigger("ui-update-classes")},onLoadMoreImages:function(e){var t=this;e.arg.dataset.type&&e.arg.dataset.type=="largeImage"&&($.log("_numLoadCount :: "+_numLoadCount),_numLoadCount==_numImgLoadCount&&(_numLoadCount=0,console.log("yes")),_numLoadCount++)},onNumCurrentChange:function(e){$.log("onNumCurrentChange"),$.log(_numCurrentCount)}}),u.LargeImage=t.View.extend({el:"#js-carousel-image",locked:null,activeSlide:0,numberSlides:0,orbitWidth:611,index:0,mode:"normal",options:{animationSpeed:800,afterSlideChange:$.noop,animation:"horizontal-push"},initialize:function(e){this.settings=e,_.extend(this.settings),_.bindAll(this,"render","restart","onStart","onPrevShift","onNextShift","onGoToShift","resetAndUnlock"),$.log("LargeImages Init"),HMSEvent.on("navigation_prev",this.onPrevShift,this),HMSEvent.on("navigation_next",this.onNextShift,this),HMSEvent.on("navigation_goto",this.onGoToShift,this),this.onStart()},restart:function(){this.$slides=$(".js-large-image"),this.$imgSlides=this.$slides.find("img"),this.numberSlides=this.$imgSlides.length;var e=this;setTimeout(function(){e.resizeImagesForGallery(),e.setupFirstSlide()},1e3)},onStart:function(){this.activeSlide=0,this.numberSlides=0,this.index=0,this.$element=$("#js-carousel-image"),this.$slides=$(".js-large-image"),this.$imgSlides=this.$slides.find("img"),this.numberSlides=this.$imgSlides.length;var e=this;setTimeout(function(){e.resizeImagesForGallery(),e.setupFirstSlide()},1e3)},onPrevShift:function(e){this.index=e.index,this.shift("prev")},onNextShift:function(e){this.index=e.index,this.shift("next")},onGoToShift:function(e){this.index=e.index,this.shift(e.index)},resizeImagesForGallery:function(){var e=this;$(".js-large-image").each(function(){$(this).css({display:"block"})}),this.$imgSlides.each(function(){var e=$(this)[0],t=e.width,n=e.height;$.browser.msie&&$.browser.version>8&&(t=e.naturalWidth,n=e.naturalHeight);var r=n/t*galleryWidth,i=t/n*galleryHeight,s=Math.ceil(galleryHeight/2-r/2),o=Math.ceil(galleryWidth/2-i/2);t>n?($(this).width("100%"),$(this).height("auto"),$(this).css({maxHeight:"100%"}),s>0&&$(this).css({marginTop:s})):n>t?($(this).height("100%"),$(this).width("auto")):($(this).height("100%"),$(this).width("auto"))})},resetAndUnlock:function(){$.log("resetAndUnlock"),this.$slides.eq(this.prevActiveSlide).css({"z-index":1,position:"absolute"}),this.unlock(),this.options.afterSlideChange.call(this,this.$slides.eq(this.prevActiveSlide),this.$slides.eq(this.activeSlide))},setupFirstSlide:function(){var e=this,t=this.$slides.children(),n=t.first();this.$slides.first().css({"z-index":3}).fadeIn(function(){e.$slides.css({display:"block",position:"absolute"})}),this.setCaption()},lock:function(){this.locked=!0},unlock:function(){this.locked=!1},shift:function(e){var t=e;this.prevActiveSlide=this.activeSlide;if(this.prevActiveSlide==t)return!1;if(this.$slides.length=="1")return!1;this.locked||(this.lock(),e=="next"?(this.activeSlide++,this.activeSlide==this.numberSlides&&(this.activeSlide=0)):e=="prev"?(this.activeSlide--,this.activeSlide<0&&(this.activeSlide=this.numberSlides-1)):(this.activeSlide=e,this.prevActiveSlide<this.activeSlide?t="next":this.prevActiveSlide>this.activeSlide&&(t="prev")),this.$slides.eq(this.prevActiveSlide).css({"z-index":2}),this.options.animation=="horizontal-push"&&(t=="next"&&(this.$slides.eq(this.activeSlide).css({left:this.orbitWidth,"z-index":3}).animate({left:0},this.options.animationSpeed,this.resetAndUnlock),this.$slides.eq(this.prevActiveSlide).animate({left:-this.orbitWidth},this.options.animationSpeed)),t=="prev"&&(this.$slides.eq(this.activeSlide).css({left:-this.orbitWidth,"z-index":3}).animate({left:0},this.options.animationSpeed,this.resetAndUnlock),this.$slides.eq(this.prevActiveSlide).animate({left:this.orbitWidth},this.options.animationSpeed))),HMSEvent.trigger("onSetCurrentThumb",{index:this.index}),this.setCaption())},setCaption:function(){var e=this.index+1,t=_numTotalInfo;$(".js-carousel-caption").html(e+" of "+t),_bolLoadMoreImages&&_numCurrentCount==0?$(".js-carousel-prev").hide():$(".js-carousel-prev").show()}}),u.ThumbnailMenu=t.View.extend({el:"#js-carousel-menu",initialize:function(e){_.bindAll(this,"render"),this.settings=e},render:function(e){_numTotalImages=$(".js-carousel-thumb").length,$("#js-carousel-menu").removeClass("carousel-menu"),$("#js-carousel-menu").addClass("carousel-menu-small");var t=$(".js-carousel-item:nth-child(1)");t.addClass("active"),this.showDefaultImage(t),this.setElement("#js-carousel-menu"),HMSEvent.trigger("ui-update-classes")},showDefaultImage:function(e){var t=$(e).find("img"),n=t.parent().parent();$(n).toggleClass("active"),$(n).siblings().removeClass("active"),HMSEvent.trigger("onSetCurrentThumb",{index:0})}}),u.AltRegistrationModal=t.View.extend({el:$("#js-modal-altregistration"),events:{"click .js-altregistration-close":"onAltregistrationClose","click .js-altregistration-submit":"onModalSubmit"},settings:{},initialize:function(e){_.extend(this.settings,e),_.bindAll(this,"render","renderCallback"),HMSEvent.on("onBeforeModalClose",this.onModalClose,this)},showModal:function(e){this.parent=e.parent,this.callBack=e.callback,this.arg=e.arg,this.render()},render:function(e){HMSTemplate.get(h,this.renderCallback)},renderCallback:function(e){var t="";t+=e.render(),HMSEvent.trigger("ui-modal-open",{content:t}),this.setElement($("#js-modal-altregistration"))},onModalSubmit:function(e){HMSEvent.trigger("user-show-register",{callback:this.callBack,args:this.arg})},onModalClose:function(e){if(e){var t={};$(e.currentTarget).parents("#js-modal-altregistration").length>0?(_bolCancelFramework=!0,t.name="gallery",HMSEvent.trigger("onFrameWorkFunctionCallBack",{framework:t})):_bolCancelFramework=!1}},onAltregistrationClose:function(e){var t={};_bolCancelFramework=!0,t.name="gallery",HMSEvent.trigger("onFrameWorkFunctionCallBack",{framework:t}),HMSEvent.trigger("ui-modal-close")}}),o=u,o})