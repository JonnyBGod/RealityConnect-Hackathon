function isLoggedin(){return HMSUser&&!HMSUser.isLoggedout()?!0:!1}function addCommas(e){e+="",x=e.split("."),x1=x[0],x2=x.length>1?"."+x[1]:"";var t=/(\d+)(\d{3})/;while(t.test(x1))x1=x1.replace(t,"$1,$2");return x1+x2}function getAmPmTime(e){var t=null,n=new Date(Number(e)),r=n.getMinutes(),i=n.getHours();return i>=12?(i-=12,t="PM"):t="AM",i===0&&(i=12),r<10&&(r="0"+r),i+":"+r+" "+t}function getTravelTime(e){return e+" Minutes"}function AbortPending(){window.arrPending&&$.each(window.arrPending,function(e,t){t&&t.abort&&t.abort()})}function reformatLocation(e){var t=new Array;t=e.split(" ");var n=t.length,r=[],i=t.length/2,s=0;while(s<n){var o=Math.ceil((n-s)/i--);r.push(t.slice(s,s+o)),s+=o}return r}define(["backbonestore","text!templates/listings/results-details.html","text!templates/listings/results-details-Foreclosure.html","app/models/search","app/ui-modules/tabs/base","app/detail/views/nearbyhomes","app/shared/views/compliance","app/ui-modules/imagegallery/gallery","app/ui-modules/charts/chart","app/ui-modules/onoffswitch/onoffswitch","app/ui-modules/slider/slider","app/shared/views/branding","templateEngine","bootstrap-plugins/bootstrap-collapse","text!templates/listings/gallery.html","app/demographics/demographics","hmsglobal","app/ui-modules/miraclehome/view"],function(Backbone,TemplateListingDetail,TemplateForeclosureListingDetail,ModelSearch,Tabs,NearbyHomes,Compliance,ImageGallery,Charts,OnOffSwitch,Slider,Branding,TemplateEngine,Collapse,TemplateGallery,Demographics,HmsGlobal,MiracleHome){var ListingDetail={},exports={},hfMapData={},isNextPage=!1,isNextPageMap=!1,_bolIsHFLoaded=!1,_bolShowLogin_Amenities=!1,_bolShowLogin_AllLinks=!0,_bolShowLogin_QuietMode=!1,_bolE1_framework=!1,_bolE2_framework=!1,_toggleDisplay=!1,_isQuietMode=!1,_isPhotos=!0,_isPhotosLoaded=!1,_isModeFirstTime=!1,_strMode="",_currentTab="photos",_bolCancelFramework=!1,_frameworkClicked={},_nowShowing="",templateGallery=Hogan.compile(TemplateGallery),templateListingDetail=Hogan.compile(TemplateListingDetail),templateForeclosureListingDetail=Hogan.compile(TemplateForeclosureListingDetail),templateMoreListings="text!templates/search/morelistings.html",templateAltReg="text!templates/user/alternate-registration.html",milperhour=36e5,milpermin=6e4,nowPageLoaded=new Date,isForeclosureAuth=!1;return ListingDetail.Details=Backbone.View.extend({el:$(".js-listingdetail"),settings:{},name:"js-listing-detail",events:{"click a[data-toggle='collapse']":"toggleFeatures","click #js-a-listing-features":"onPropDetailsClick","click .js-price-alert":"onPriceAlert","click .js-user-morelistings":"showMoreListings","click .js-foreclosure-login":"showForeclosureLogin","click .js-foreclosure-register":"showForeclosureRegister","click .js-foreclosure-trial":"showForeclosureLogin"},mode:"fullmode",tab:"photos",listingurl:"",listingid:0,isHomeValue:!1,isForeclosure:!1,hideAgentBranding:!1,baseRoute:"detail",page:0,initialize:function(e){_.extend(this.settings,e),_.bindAll(this,"render","block","unblock","get","getRoute","getBaseRoute","renderListingDataSource","showMoreListings","toggleViewMoreDisplay","callPlotCharts","showForeclosureLogin","showForeclosureRegister","foreclosureLogout","isScrolledIntoView","setScrollEvent"),this.router=e.router,this.settings.el=this.el,this.model=new ModelSearch.Listing({el:this.el}),this.modelModeTab=new Backbone.Model,this.updateldpCountCookie(),this.initMiracleHome(),typeof this.model.get("ListingID")!="undefined"&&(this.isHomeValue=HmsGlobal.convertToBool(this.model.get("IsHomeValue")),this.isForeclosure=HmsGlobal.convertToBool(this.model.get("IsForeclosure")),this.hideAgentBranding=HmsGlobal.convertToBool(this.model.get("HideAgentBranding")),this.listingurl=this.model.get("ListingDetailURL"),this.model.on("change",this.render),this.tabsView=new ListingDetail.Tabs(this),this.isForeclosure?this.nearbyRecentSalesView=new NearbyHomes.RecentSalesList(this):this.nearbyHomesView=new NearbyHomes.PropertyList(this),this.brandingView=new Branding.Office,this.HomeFactsView=new Demographics.HomeFacts(this),HMSEvent.on("onUserReady",this.frameworkCheck,this),HMSEvent.on("onUserLoggedOut",this.userLoggedOut,this),HMSEvent.on("onLoginRegisterCancelled",this.userModalCancel,this),HMSEvent.on("onFrameWorkFunctionCallBack",this.frameworkCallback,this),HMSEvent.on("onPlotChartsRecall",this.onPlotChartsRecall,this),HMSEvent.on("user-foreclosure-reloadpage",this.get,this),HMSEvent.on("user-foreclosure-logout",this.foreclosureLogout,this),$("*[data-id='js-agent-branding']").hide(),HMSTrackingVars.hideAgentBranding=this.hideAgentBranding,this.isHomeValue?(this.listingid=this.model.get("HVListingID"),$("#js-hv-notforsale").show(),$("#js-home-value-history").show(),$('textarea[id="field-message"]').val(""),$('textarea[id="field-message"]').html(""),$(".site-office-name").text(""),$(".js-attribution-sponsor").text("")):(this.listingid=this.model.get("ListingID"),this.disclosureView=new Compliance.Disclosure(this),$("#js-a-listing-features").show()),this.hideAgentBranding||$("*[data-id='js-agent-branding']").show(),$(".collapse").collapse({toggle:!1}),this.pager=new ListingDetail.PagerView(this),this.renderListingDataSource(),HMSEvent.trigger("onListingDetailInitialized"),this.morelistings=new ListingDetail.MoreListings(this)),HMSEvent._callbacks.TrackAdobeTag?HMSEvent.trigger("TrackAdobeTag"):HMSEvent.on("onTrackerReady",this.onTrackerReady,this),this.editListingDetails(),this.setToolTip(),this.setScrollEvent(),this.callPlotCharts()},setMode:function(e){this.modelModeTab.set("mode",e),this.mode=e},setTab:function(e){this.modelModeTab.set("tab",e),this.tab=e},callPlotCharts:function(){this.isHomeValue&&(this.plotCharts?this.plotCharts.getCharts():this.plotCharts=new Charts.View)},onPlotChartsRecall:function(){this.isHomeValue&&this.plotCharts&&this.plotCharts.plot1._drawCount===0&&this.plotCharts.plot1.replot()},onTrackerReady:function(){HMSEvent.trigger("TrackAdobeTag")},updateldpCountCookie:function(){$.cookie("ldpCount")?$.cookie("ldpCount",parseInt($.cookie("ldpCount"))+1,{path:"/"}):$.cookie("ldpCount",1,{path:"/"})},showMoreListings:function(e){e.preventDefault(),this.morelistings||(this.morelistings=new ListingDetail.MoreListings(this)),this.morelistings.render()},showForeclosureLogin:function(e){isLoggedin()?HMSEvent.trigger("user-show-foreclosure"):HMSEvent.trigger("user-show-login",{IsForeclosure:!0})},showForeclosureRegister:function(e){isLoggedin()?HMSEvent.trigger("user-show-foreclosure"):HMSEvent.trigger("user-show-register",{IsForeclosure:!0})},frameworkCheck:function(){if(HMSUser){var e=HMSUser.model.get("registrationSwitch");e.C1&&(_bolShowLogin_Amenities=!0),e.C5?_bolShowLogin_AllLinks=!0:_bolShowLogin_AllLinks=!1,e.C2&&(_bolShowLogin_QuietMode=!0),e.E1&&(_bolE1_framework=!0),e.E2&&(_bolE2_framework=!0)}},userLoggedOut:function(){_bolShowLogin_Amenities&&_currentTab=="amenities"&&this.tabsView.gotoTab(0),_bolShowLogin_AllLinks&&(_toggleDisplay=!0,this.toggleViewMoreDisplay())},userModalCancel:function(){_bolShowLogin_Amenities&&_currentTab=="amenities"&&this.tabsView.gotoTab(0)},getBaseRoute:function(){var e=this.baseRoute+"/"+this.mode+"/"+this.tab+"/";return e},getRoute:function(){var e=this.getBaseRoute()+this.listingid;return this.listingurl.indexOf("/")!=0&&(e+="/"),e+=this.listingurl,e},render:function(e){var t=e.toJSON();t.IsForeclosureAuthenticated=isForeclosureAuth;var n=templateGallery.render(t);if($.isNumeric(t.LotSize)||t.LotSize==null&&t.SearchableLotSize!=null){var r=0;t.SearchableLotSize&&t.SearchableLotSize!=null?t.SearchableLotSize>=t.LotSize&&t.SearchableLotSize>10890?(r=Math.floor(t.SearchableLotSize/43560*100)/100,t.LotSize=r+" acres"):(r=addCommas(t.SearchableLotSize),t.LotSize=r+" sqft"):(r=addCommas(t.LotSize),t.LotSize=r+" sqft")}this.listingurl=t.ListingDetailURL,this.listingid=t.ListingID,this.isHomeValue=HmsGlobal.convertToBool(t.IsHomeValue),this.isForeclosure=HmsGlobal.convertToBool(t.IsForeclosure);if(this.isForeclosure)var i=templateForeclosureListingDetail.render(t,{gallery:n});else var i=templateListingDetail.render(t,{gallery:n});this.hideAgentBranding=HmsGlobal.convertToBool(t.HideAgentBranding),_bolCancelFramework=!1,_frameworkClicked={},i=$(i),this.setElement(i),$(".js-listingdetail").replaceWith(i),this.isHomeValue?($(".js-search-tabs-photos").hide(),$("#js-home-value-history").show(),$("#js-hv-notforsale").show()):$("#js-a-listing-features").show(),HMSEvent.trigger("ui-show-contactform",{isHomeValue:this.isHomeValue}),this.tabsView.toggleMode(this.mode),this.unblock(),HMSEvent.trigger(this.name+"-render",this.model),$("*[data-id='js-agent-branding']").hide(),this.hideAgentBranding||$("*[data-id='js-agent-branding']").show(),HMSTrackingVars.hideAgentBranding=this.hideAgentBranding,e.get("ListingSourceID")&&(HMSTrackingVars.LSID=e.get("ListingSourceID")),e.get("MLSNumber")&&(HMSTrackingVars.MLSNumber=e.get("MLSNumber")),e.get("ListHubKey")&&(HMSTrackingVars.ListHubKey=e.get("ListHubKey")),this.renderListingDataSource(),this.morelistings||(this.morelistings=new ListingDetail.MoreListings(this)),this.morelistings.refresh(),this.updateldpCountCookie(),this.initMiracleHome(),this.setToolTip(),this.setScrollEvent();var s=parseInt($.cookie("ldpCount"));this.editListingDetails(),!$.browser.msie||$.browser.msie&&$.browser.version>=9?$("title").html(e.get("Address")+" "+e.get("City")+", "+e.get("State")+" Property Listing ‐ RE/MAX"):document.title=e.get("Address")+" "+e.get("City")+", "+e.get("State")+" Property Listing - RE/MAX",t.CityStateSearchResultURL&&t.CityStateFormatted&&($(".js-citystateurl").length>0&&($(".js-citystateurl")[0].href=t.CityStateSearchResultURL),$(".js-citystateformatted").html(t.CityStateFormatted)),HMSEvent.trigger("TrackAdobeTag"),this.setToolTip(),this.callPlotCharts()},setScrollEvent:function(){var e=this;$(window).on("scroll",function(){$.log("visible");if(e.model&&!_bolIsHFLoaded){var t=e.model.toJSON();e.renderHomeFacts(t),_bolIsHFLoaded=!0,$(window).off("scroll")}})},isScrolledIntoView:function(e){if($(e).length==0)return!1;var t=$(window).scrollTop(),n=t+$(window).height(),r=$(e).offset().top,i=r+$(e).height();return n>=r&&t<=i},renderHomeFacts:function(e){if(e.Latitude&&e.Longitude){var t=this,n=new Demographics.HomeFactsCollection;n.params.lat=e.Latitude,n.params.long=e.Longitude,e.Zip&&(n.params.zipcode=e.Zip),n.fetch({success:function(e){var n=e.models[0].toJSON();t.HomeFactsView.render(n),hfMapData=n,t.tab=="map"&&HMSEvent.trigger("render-map-services",n)}})}},editListingDetails:function(){var e=$(".listing-detail-stats-main").find("dd"),t=$(".listing-detail-stats-more").find("dd");$.each(e,function(e,t){var n=this.innerHTML.toLowerCase().trim();n=="true"&&(this.innerHTML="Yes"),n=="false"&&(this.innerHTML="No")}),$.each(t,function(e,t){var n=this.innerHTML.toLowerCase().trim();if(n.indexOf("true")!=-1){var r=n.split(" ");$.each(r,function(e,t){r[e]=t.replace(/true/g,"Yes")}),r=r.join(" "),this.innerHTML=r}if(n.indexOf("false")!=-1){var r=n.split(" ");$.each(r,function(e,t){r[e]=t.replace(/true/g,"No")}),r=r.join(" "),this.innerHTML=r}n=="true"&&(this.innerHTML="Yes"),n=="false"&&(this.innerHTML="No")})},unblock:function(){HMSEvent.trigger("ui-update-share"),$(".js-listingdetail").unblock()},block:function(){$(".js-listingdetail").block()},toggleFeatures:function(e){e.preventDefault()},propDetailsSet:function(e){$("#js-a-listing-features").trigger("click")},toggleViewMoreDisplay:function(){_toggleDisplay?($("#js-listing-features").hide(),$("#js-a-listing-features span.icon").removeClass("active"),_toggleDisplay=!1):($("#js-listing-features").show(),$("#js-a-listing-features span.icon").addClass("active"),_toggleDisplay=!0),HMSEvent.trigger("ui-update-classes")},frameworkCallback:function(e){var t=e.framework;t.name=="E1"&&this.toggleViewMoreDisplay(),t.name=="amenities"&&this.tabsView.gotoTab(t.arg),t.name=="quietmode"&&this.tabsView.displayQuietMode(t.arg),t.name=="gallery"?this.tabsView.gotoTab(0):_bolCancelFramework=!0},onPropDetailsClick:function(e){var t=parseInt($.cookie("ldpCount")),n=[];n.callback=this.propDetailsSet,n.arg=e,!isLoggedin()&&_bolShowLogin_AllLinks&&!_bolCancelFramework?(_bolE1_framework&&t%3==0&&t<=9&&(this.altRegModal||(this.altRegModal=new ListingDetail.AltRegistrationModal(n)),this.altRegModal.showModal(n)),_bolE1_framework&&t>9&&HMSEvent.trigger("user-show-register",{callback:this.propDetailsSet,args:e}),_bolE1_framework||HMSEvent.trigger("user-show-register",{callback:this.propDetailsSet,args:e}),t%3!=0&&t<=9&&_bolE1_framework&&this.toggleViewMoreDisplay()):this.toggleViewMoreDisplay()},onPriceAlert:function(e){HMSEvent.trigger("user-savelisting",e)},get:function(e){this.setToolTip(),isForeclosureAuth=HMSUser.model.get("isForeclosureAuth"),e||(e=this.listingid),pendingRequests&&pendingRequests.pop&&pendingRequests.pop(),this.model.attributes.ListingAgentAssID=null,this.model.attributes.VirtualTourURL=null,this.model.attributes.LotSize=null,this.model.attributes.SearchableLotSize=null,this.model.attributes.HasOpenHouse=null,this.model.attributes.ShowPriceCut=null,this.model.attributes.NewListing=null,this.model.attributes.PendingListing=null,this.model.attributes.ListingImages=null,this.model.attributes.IDXPhotoRef=null,this.model.params.ListingID=e,this.block(),this.model.fetch()},foreclosureLogout:function(){var e=this;this.isForeclosure&&(this.tabsView.gotoTab(0),this.get())},renderListingDataSource:function(){$(".js-listing-datasource").html(this.model.get("ListingDataSource"))},initMiracleHome:function(){this.miracleHome=new MiracleHome.MiracleView,this.miracleHome.render()},setToolTip:function(){$(".js-valuedisclaimer").qtip({content:'<h6 class="listing-detail-estimate-disclaimer-title">Homes.com Value Estimate</h6><p class="listing-detail-estimate-disclaimer-body">A remax.com home value, provided by Homes.com, is an automatically generated estimate of a home’s fair market value based on several real estate market factors. <a href="/c/general/home-value-estimate-faq" target="_blank" class="link-10">Read More &gt;&gt;</a>',position:{my:"topMiddle",at:"bottomMiddle",viewport:$("#site-body"),container:$("#site-body")},hide:{delay:3e3},style:{classes:"ui-tooltip-remax",tip:{width:24,height:12},widget:!1,def:!1}}),this.isForeclosure&&HMSEvent.trigger("ui-foreclosure-pricetooltip")}}),ListingDetail.Tabs=Backbone.View.extend({name:"js-detail-tabs",el:$(".js-search-tabs"),settings:{},hasPhotos:!0,hasLongLat:!0,initialize:function(e){_.bindAll(this,"onTabChanged","onModeChanged","photos","map","balloon","amenities","showActive","reload","toggleMode","toggle","attachEvents","tabToggle","onKeyboardEscape","displayQuietMode","routeTab","setDefault","onOnOffSwitchRenderCompleted","onSliderStop","onSliderSlide","drawDriveTimePolygons","clearDriveTimePolygons"),this.listingView=e,this.model=e.model,this.model.on("change",this.reload),this.modelModeTab=e.modelModeTab,this.modelModeTab.on("change:tab",this.onTabChanged),this.modelModeTab.on("change:mode",this.onModeChanged),this.router=e.router,this.attachEvents(),HMSEvent.on("setdefaultframework",this.setDefault,this),HMSEvent.on("event-keyboard-escape",this.onKeyboardEscape),this.options.isHomeValue||(this.onoffSwitch=new OnOffSwitch.View({cookieName:"OnOffSwitch",attachedElement:".js-drive-time",onAttachedElementShow:this.drawDriveTimePolygons,onAttachedElementHide:this.clearDriveTimePolygons,onOnOffSwitchRenderCompleted:this.onOnOffSwitchRenderCompleted}))},onOnOffSwitchRenderCompleted:function(){var e=new Date(nowPageLoaded.getFullYear(),nowPageLoaded.getMonth(),nowPageLoaded.getDay(),0,0,0,0),t=e.getTime(),n=e.getTime()+5*milperhour,r=e.getTime()+29*milperhour,i=e.getTime()+7*milperhour,s=$.cookie("dtp_timeofday");if(!s||isNaN(s)||Number(s)%milpermin!=0)s=7*milperhour;$.cookie("dtp_timeofday",s,{path:"/"});var o=e.getTime()+Number(s);this.timeofdaySlider?this.timeofdaySlider.render({el:".js-timeofday-slider",value:o,valueformatted:getAmPmTime(o)}):this.timeofdaySlider=new Slider.View({type:"timeofday",animate:!0,el:".js-timeofday-slider",disableQtip:!0,value:o,valueformatted:getAmPmTime(o),defaultvalue:i,min:n,max:r,step:30*milpermin,range:"min",onSliderStop:this.onSliderStop,onSliderSlide:this.onSliderSlide,midnight:t});var u=$.cookie("dtp_traveltime");u||(u=15),$.cookie("dtp_traveltime",u,{path:"/"}),this.traveltimeSlider?this.traveltimeSlider.render({el:".js-traveltime-slider",value:u,valueformatted:getTravelTime(u)}):this.traveltimeSlider=new Slider.View({type:"traveltime",animate:!0,el:".js-traveltime-slider",disableQtip:!0,value:u,valueformatted:getTravelTime(u),defaultvalue:15,min:5,max:90,step:5,range:"min",onSliderStop:this.onSliderStop,onSliderSlide:this.onSliderSlide})},onSliderStop:function(e,t,n){t.stopPropagation(),e.options.type=="timeofday"&&$.cookie("dtp_timeofday",n.value-e.options.midnight,{path:"/"}),e.options.type=="traveltime"&&$.cookie("dtp_traveltime",n.value,{path:"/"}),this.drawDriveTimePolygons()},onSliderSlide:function(e,t,n){t.stopPropagation(),e.options.type=="timeofday"&&$(".js-timeofday-output").html(getAmPmTime(n.value)),e.options.type=="traveltime"&&$(".js-traveltime-output").html(getTravelTime(n.value))},drawDriveTimePolygons:function(){if(this.onoffSwitch&&this.onoffSwitch.model.get("switch")=="on"){var e=$.cookie("dtp_timeofday");if(!e||isNaN(e)||Number(e)%milpermin!=0)e=7*milperhour;var t=new Date,n=new Date(t.getFullYear(),t.getMonth()+1,t.getDay(),0,0,0,0),r=new Date(n.getTime()+Number(e));datetime=r.toISOString();var i=$.cookie("dtp_traveltime");i||(i=30);var s=this.model.get("Latitude"),o=this.model.get("Longitude"),u=s+"|"+o;if(s&&o){var a=new ModelSearch.DriveTimePolygons({center:u,duration:i,datetime:datetime,hour:r.getHours(),minute:r.getMinutes()});if(this.mapView&&this.mapView.drawDriveTimePolygons){AbortPending(),HMSEvent.trigger("ui-show-blocker",{element:"#js-map-container-map",overlay:{opacity:.1,cursor:"default"}});var f=a.fetch({success:this.mapView.drawDriveTimePolygons});arrPending.push(f)}}}},clearDriveTimePolygons:function(){AbortPending(),this.mapView&&this.mapView.clearDriveTimePolygons&&this.mapView.clearDriveTimePolygons()},onTabChanged:function(e,t){AbortPending(),this.onoffSwitch&&(t=="map"?this.onoffSwitch.show():this.onoffSwitch.hide())},onModeChanged:function(e,t){AbortPending(),e.get("tab")=="map"&&this.drawDriveTimePolygons()},onKeyboardEscape:function(e){_isQuietMode&&$("[data-id='quietButton']").trigger("click")},setDefault:function(e){this.modelModeTab.get("tab")=="amenities"&&this.gotoTab(0),this.onKeyboardEscape(),$("#js-carousel-image").css({visibility:"visible"})},toggle:function(e){var t=parseInt($.cookie("ldpCount")),n=[];n.callback=this.toggle,n.arg=e,!isLoggedin()&&_bolShowLogin_QuietMode&&!_bolCancelFramework?_bolE2_framework?(_bolE2_framework&&t%3==0&&t<=9&&(this.altRegModal?this.altRegModal.showModal(n):(this.altRegModal=new ListingDetail.AltRegistrationModal(n),this.altRegModal.showModal(n)),_frameworkClicked.name="quietmode",_frameworkClicked.arg=e),_bolE2_framework&&t>9&&this.displayQuietMode(e),t%3!=0&&t<=9&&this.displayQuietMode(e)):HMSEvent.trigger("user-show-register",{callback:this.toggle,args:e}):this.displayQuietMode(e)},displayQuietMode:function(e){_isPhotosLoaded=!1;if(e){e.preventDefault();var t=$(e.currentTarget).attr("data-mode"),n;this.listingView.mode=t,n=this.listingView.getRoute(),this.router.navigate(n,{trigger:!0})}else $("[data-id='quietButton']").trigger("click")},tabToggle:function(e){if(HMSUser){var t=$(e.currentTarget).attr("data-tab");t=="photos"?_isPhotos=!0:_isPhotos=!1,this.tabRouteUrl(t)}},tabRouteUrl:function(e){var t,n=this,r=parseInt($.cookie("ldpCount")),i=[];i.callback=this.gotoTab,i.arg=3,!isLoggedin()&&e=="amenities"&&_bolShowLogin_Amenities&&!_bolCancelFramework?_bolE2_framework?(_bolE2_framework&&r%3==0&&r<=9&&(this.altRegModal?this.altRegModal.showModal(i):(this.altRegModal=new ListingDetail.AltRegistrationModal(i),this.altRegModal.showModal(i)),_frameworkClicked.name="amenities",_frameworkClicked.arg=3),_bolE2_framework&&r>9&&this.routeTab(e),r%3!=0&&r<=9&&this.routeTab(e)):HMSEvent.trigger("user-show-register",{callback:this.gotoTab,args:3}):this.routeTab(e)},routeTab:function(e){this.listingView.tab!=e&&(HMSEvent.trigger("ui-show-blocker",{element:"#js-tab-navigation",msg:" ",overlay:{opacity:0}}),this.listingView.tab=e,baseRoute=this.listingView.getRoute(),this.router.navigate(baseRoute,{trigger:!0}))},attachEvents:function(){$("[data-id='quietButton']").on("click",this.toggle),$("#js-tab-navigation [data-tab]").on("click",this.tabToggle),$(".js-contact-form").on("click",this.quietModeForm)},reload:function(e){this.attachEvents(),this[this.listingView.tab].apply(this),HMSEvent.trigger("user-update-savedlistings"),this.onoffSwitch&&this.onoffSwitch.render()},photos:function(e){var t=this,n="data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";this.hasPhotos=this.model&&this.model.attributes&&this.model.attributes.ImageCount>0,this.model.attributes.IDXPhotoRef&&this.model.attributes.IDXPhotoRef.length>0&&this.model.attributes.IDXPhotoRef!=n&&(this.hasPhotos=!0),this.hasLongLat=this.model.get("Latitude"),this.hasLongLat||($(".js-search-tabs-balloon").hide(),$(".js-search-tabs-map").hide(),$(".js-search-tabs-amenities").hide(),$("#js-sales-nearby").hide());if(this.options.isHomeValue||!this.hasPhotos||this.options.isForeclosure)this.balloon(e),$(".js-search-tabs-photos").hide(),HMSEvent.trigger("ui-hide-blocker",{element:"#js-tab-navigation"});else{var r=new ModelSearch.Listing;r.set("ListingID",this.model.get("ListingID")),r.set("onlyphotos",!0),this.options.isForeclosure&&r.set("IsForeclosure",!0),r.fetch({success:function(n,r){var i={};i.IDXPhotoRef=r.IDXPhotoRef,i.ListingImages=r.ListingImages,i.Address=t.model.attributes.Address,i.City=t.model.attributes.City,i.State=t.model.attributes.State,i.Zip=t.model.attributes.Zip,_currentTab="photos",t.doActivate("photos"),t.imageGallery?isNextPage?(t.imageGallery.render(t.model.attributes),isNextPage=!1):_isPhotosLoaded&&t.imageGallery.render(i):(t.imageGallery=new ImageGallery.View(e),t.imageGallery.render(i)),_isModeFirstTime&&(_isModeFirstTime=!1,HMSEvent.trigger("onDetailsMode",_strMode)),_isPhotosLoaded=!0,HMSEvent.trigger("ui-hide-blocker",{element:"#js-tab-navigation"})}})}},map:function(){_frameworkClicked.name="",_isPhotosLoaded=!1,this.runMap("map")},balloon:function(){_frameworkClicked.name="",_isPhotosLoaded=!1,this.runMap("balloon")},amenities:function(e){var t,n=this,r=parseInt($.cookie("ldpCount")),i=[];i.callback=this.gotoTab,i.arg=3,_currentTab="amenities",_isPhotosLoaded=!1,!isLoggedin()&&_bolShowLogin_Amenities&&!_bolCancelFramework?_bolE2_framework?(_bolE2_framework&&r%3==0&&r<=9&&(this.altRegModal?this.altRegModal.showModal(i):(this.altRegModal=new ListingDetail.AltRegistrationModal(i),this.altRegModal.showModal(i)),_frameworkClicked.name="amenities",_frameworkClicked.arg=3),_bolE2_framework&&r>9&&this.runMap("amenities"),r%3!=0&&r<=9&&this.runMap("amenities")):HMSEvent.trigger("user-show-register",{callback:this.gotoTab,args:3}):this.runMap("amenities")},runMap:function(e){this.hasLongLat=this.model.get("Latitude"),!this.hasPhotos&&!this.hasLongLat?($(".js-search-tabs-balloon").hide(),$(".js-search-tabs-map").hide(),$(".js-search-tabs-amenities").hide(),$("#js-quietmode").hide(),$("#js-sales-nearby").hide()):(_currentTab=e,this.doActivate(e),this.openMap({tab:e}))},gotoTab:function(e){$($("#js-tab-navigation [data-tab]")[e]).trigger("click")},toggleMode:function(e){var t=$("*[data-quietclass]"),n=0;e=="quietmode"?(_isQuietMode=!0,$("*[data-quietmode='false']").hide(),$("*[data-quietmode='true']").show(),t.each(function(e){var t=$(this);t.removeClass(t.data("quietclass").normal).addClass(t.data("quietclass").quiet)}),HMSEvent.trigger("onDetailsMode","quietmode"),$("#js-page-head-quietmode").length>0&&$("#js-page-head-quietmode").is(":visible")&&(n=$("#js-page-head-quietmode").offset().top)):($("*[data-quietmode='false']").show(),$("*[data-quietmode='true']").hide(),t.each(function(e){var t=$(this);t.removeClass(t.data("quietclass").quiet).addClass(t.data("quietclass").normal)}),_isQuietMode&&_isPhotos&&(_isQuietMode=!1,HMSEvent.trigger("onDetailsMode","fullmode"),HMSEvent.trigger("onPlotChartsRecall")),$("h1").length>0&&$("h1").is(":visible")&&(n=$("h1").offset().top-30)),$("html, body").scrollTop()>0&&$("html, body").animate({scrollTop:n},1e3),this.imageGallery||(_isModeFirstTime=!0,_strMode=e)},loadQuietMode:function(e){_currentTab="quietmode",_isPhotosLoaded=!1,this.toggleMode("quietmode")},quietModeForm:function(){HMSEvent.trigger("ui-modal-open",{contactform:"requestshowing-modal"})},showActive:function(e){},openMap:function(e){e.model=this.model,this.mapView?this.mapView.openMap(e):(e.router=this.router,this.mapView=new ListingDetail.Map(e))},doActivate:function(e){$(".js-tabs-content").hide(),$(".js-tabs-nav a").removeClass("active"),$("#js-detail-"+e+"view").show(),$(".js-search-tabs-"+e+" a").addClass("active"),HMSEvent.trigger("ui-update-classes")}}),ListingDetail.Map=Backbone.View.extend({name:"js-map-listing-results",el:".js-map-listing-results",settings:{},maxcount:200,activePin:null,pendingLoadModules:{},events:{"change #js-service-police":"updateServices","change #js-service-fire":"updateServices","change #js-service-hospitals":"updateServices","change #js-service-schools":"updateServices","change #js-service-airports":"updateServices"},initialize:function(e){_.bindAll(this,"openMap","show","hide","mapReady","loadApi","render","createPin","createClusteredPin","displayCheck","addOne","mapChange","getAmenities","addAmenities","showInfo","drawDriveTimePolygons","clearDriveTimePolygons","renderMapServices","addServices","updateServices","hideServices","showServices","getServicesCookie","setServicesCookie"),HMSEvent.on("render-map-services",this.renderMapServices),this.router=e.router,this.openMap(e),this.isForeclosure=HmsGlobal.convertToBool(this.model.get("IsForeclosure"))},openMap:function(e){this.tab=e.tab,this.model=e.model,this.centerLat=this.model.get("Latitude"),this.centerLong=this.model.get("Longitude"),this.elMapHolder=$("#js-map-container-"+this.tab)[0],this.key=$(".js-mapsearch").attr("data-key"),this.poiCollection=new Demographics.POICollection,this.loadApi()},drawDriveTimePolygons:function(e,t){if(this.tab=="map")if(this.isLoaded()){var n=new Microsoft.Maps.Color(100,237,180,188),r=null;if(t&&t.Polygons&&t.Polygons.DriveTime&&t.Polygons.DriveTime.Polygon&&t.Polygons.DriveTime.Polygon.exterior&&t.Polygons.DriveTime.Polygon.exterior.LinearRing&&t.Polygons.DriveTime.Polygon.exterior.LinearRing.posList){var i=reformatLocation(t.Polygons.DriveTime.Polygon.exterior.LinearRing.posList);r=new Array;for(x=0;x<i.length;x++)r.push(new Microsoft.Maps.Location(i[x][0],i[x][1]))}if(r){this.polygonLayer&&this.polygonLayer.clear(),this.polygonLayer=new Microsoft.Maps.EntityCollection({visible:!0});var s=new Microsoft.Maps.Polygon(r,{fillColor:n,strokeColor:n});this.polygonLayer.push(s),this.map.entities.push(this.polygonLayer),this.map.setView({bounds:Microsoft.Maps.LocationRect.fromLocations(r)})}HMSEvent.trigger("ui-hide-blocker",{element:"#js-map-container-map"})}else this.pendingLoadModules.drawDriveTimePolygons=t;HMSEvent.trigger("ui-hide-blocker",{element:"#js-tab-navigation"})},clearDriveTimePolygons:function(){this.polygonLayer&&this.polygonLayer.clear(),HMSEvent.trigger("ui-hide-blocker",{element:"#js-map-container-map"})},loadApi:function(){HMSEvent.on("map-api-loaded",this.mapReady),require(["V7ClientSideClustering"]),require(["http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&onScriptLoad=HMSEventMapReady"]),this.isLoaded()&&this.mapReady()},isLoaded:function(){return typeof Microsoft!="undefined"&&typeof Microsoft.Maps!="undefined"&&typeof Microsoft.Maps.Map!="undefined"&&typeof ClusteredEntityCollection!="undefined"},query:function(){this.collection.getTop(this.maxcount)},mapReady:function(){this.renderMap(this.tab)},addOne:function(t){var n=this;view=new Results.ListItem({model:t}),view.render(),$(this.el).find("ol").append(view.el)},render:function(e){this.renderMap(e)},renderMap:function(t){var n=!1,r=!0;switch(t){case"balloon":this.mapType=Microsoft.Maps.MapTypeId.birdseye,this.zoom=20;break;default:this.mapType=Microsoft.Maps.MapTypeId.road,this.zoom=15,_bolIsHFLoaded||(this.hfInfo=this.model.toJSON(),this.router.listingDetailView.renderHomeFacts(this.hfInfo),_bolIsHFLoaded=!0,$(window).off("scroll"))}this.isForeclosure?isForeclosureAuth?($(".js-inrix-disabled").hide(),$(".js-search-tabs-map").show(),n=!1,r=!0):($(".js-inrix-disabled").show(),$(".js-search-tabs-map").hide(),n=!0,r=!1):($(".js-inrix-disabled").hide(),$(".js-search-tabs-map").show()),this.map=new Microsoft.Maps.Map(this.elMapHolder,{credentials:this.key,center:new Microsoft.Maps.Location(this.centerLat,this.centerLong),mapTypeId:this.mapType,zoom:this.zoom,enableSearchLogo:!1,enableClickableLogo:!1,disableZooming:n,disablePanning:n,showDashboard:r}),this.addListing(this.centerLat,this.centerLong),this.isForeclosure?isForeclosureAuth?this.listingLayer.setOptions({visible:!0}):this.listingLayer.setOptions({visible:!1}):this.listingLayer.setOptions({visible:!0}),this.tab=="amenities"&&this.getAmenities(),this.pendingLoadModules.drawDriveTimePolygons?this.drawDriveTimePolygons(null,this.pendingLoadModules.drawDriveTimePolygons):HMSEvent.trigger("ui-hide-blocker",{element:"#js-tab-navigation"})},getServicesCookie:function(){var e=[];if($.cookie("showMapServices")){var t=$.cookie("showMapServices");e=JSON.parse(t)}else{var n=$(".js-service-dropdown").find("input");$.each(n,function(t,n){e.push({name:$(n).val(),isChecked:$(n).is(":checked")})});var r=JSON.stringify(e);$.cookie("showMapServices",r,{path:"/"})}return e},setServicesCookie:function(){var e=[],t=$(".js-service-dropdown").find("input");this.activePin&&this.activePin.info.setOptions({visible:!1}),$.each(t,function(t,n){e.push({name:$(n).val(),isChecked:$(n).is(":checked")})});var n=JSON.stringify(e);$.cookie("showMapServices",n,{path:"/"})},renderMapServices:function(e){console.log(e);var t={},n=[];n=this.getServicesCookie();if(e.ShowAmenities){$("#js-detail-mapview").block(),$(".js-map-services").show(),e.HFSchoolsShow&&$("label[for=js-field-service-schools]").show(),e.ShowPoliceStations&&$("label[for=js-field-service-police]").show(),e.ShowFireStations&&$("label[for=js-field-service-fire]").show(),e.ShowHospitals&&$("label[for=js-field-service-hospitals]").show(),e.ShowAirports&&$("label[for=js-field-service-airports]").show(),t=e.HFAmenities,this.addServices(t);var r=this,i=$(".js-service-dropdown").find("input");$.each(i,function(e,t){for(var i=0;i<n.length;i++)$(t).val()==n[i].name&&($(t).attr("checked",n[i].isChecked),n[i].isChecked||r.hideServices(n[i].name))})}},updateServices:function(e){var t=e.currentTarget.value;e.currentTarget.checked?this.showServices(t):this.hideServices(t)},hideServices:function(e){$.log(e);for(var t=0;t<=this.serviceLayer.getLength()-1;t++)this.serviceLayer.get(t).type==e&&this.serviceLayer.get(t).setOptions({visible:!1});this.setServicesCookie()},showServices:function(e){$.log(e);for(var t=0;t<=this.serviceLayer.getLength()-1;t++)this.serviceLayer.get(t).type==e&&this.serviceLayer.get(t).setOptions({visible:!0});this.setServicesCookie()},addServices:function(e){var t=new Array,n=0;for(i=0;i<e.length;i++){var r,s={title:e[i].Name,offset:new Microsoft.Maps.Point(-2,10),showCloseButton:!0,width:300,height:45,visible:!1,zIndex:3e3,id:"pin-"+n},o={icon:"",typeName:"icon icons-map-pin-"+e[i].Type+"-20x20",width:20,height:20,visible:!0,id:"pin-"+n},u=new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(e[i].Latitude,e[i].Longitude),s),r=new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(e[i].Latitude,e[i].Longitude),o);r.type=e[i].Type,r.info=u,Microsoft.Maps.Events.addHandler(r,"click",this.showInfo),this.serviceLayer.push(r),this.infoBoxLayer.push(u),n++}this.map.entities.push(this.serviceLayer),this.map.entities.push(this.infoBoxLayer),$("#js-detail-mapview").unblock()},getAmenities:function(){$("#js-detail-amenitiesview").block();var e=this.map.getBounds();this.poiCollection.params.lat=this.centerLat,this.poiCollection.params.long=this.centerLong,this.poiCollection.params.nelat=e.getNorth(),this.poiCollection.params.nelong=e.getEast(),this.poiCollection.params.swlat=e.getSouth(),this.poiCollection.params.swlong=e.getWest(),this.poiCollection.fetch({success:this.addAmenities})},addAmenities:function(e,t){var n=e.toJSON(),r=new Array;for(i=0;i<n.length;i++){var s,o={title:n[i].Name,offset:new Microsoft.Maps.Point(0,20),showCloseButton:!0,width:250,height:125,visible:!1,description:"<ul><li>"+n[i].PointOfInterestType+"</li><li>"+n[i].Address+"</li><li>Distance: "+n[i].Distance+" miles</li>"};r[i]=new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(n[i].Lat,n[i].Long),o);var s=new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(n[i].Lat,n[i].Long),{infobox:r[i]});Microsoft.Maps.Events.addHandler(s,"click",this.showInfo),this.map.entities.push(s),this.map.entities.push(r[i])}$("#js-detail-amenitiesview").unblock()},showInfo:function(e){var t=e.target._location.latitude,n=e.target._location.longitude;this.map.setView({center:new Microsoft.Maps.Location(t,n)}),this.activePin&&this.activePin.info.setOptions({visible:!1}),e.target.info.setOptions({visible:!0}),this.activePin=e.target},addListing:function(){this.setElement(".js-map-listing-results"),this.map.entities.clear(),this.listingLayer=new Microsoft.Maps.EntityCollection({visible:!0,zIndex:3e3}),this.serviceLayer=new Microsoft.Maps.EntityCollection({visible:!0,zIndex:2e3}),this.infoBoxLayer=new Microsoft.Maps.EntityCollection({visible:!0,zIndex:4e3});var e=new Microsoft.Maps.Pushpin(this.map.getCenter(),{typeName:"icon icons-mappin-red-43x38",icon:"",width:43,height:38});this.listingLayer.push(e),this.map.entities.push(this.listingLayer),_bolIsHFLoaded&&this.tab=="map"&&hfMapData&&this.renderMapServices(hfMapData)},mapChange:function(e){$(this.el).find("ol").empty()},show:function(){$(this.el).show()},hide:function(){$(this.el).hide()},createPins:function(e){this.clusteredLayer=new ClusteredEntityCollection(e,{singlePinCallback:this.createPin,clusteredPinCallback:this.createClusteredPin,clusteringEnabled:!0,gridSize:40,callback:this.displayCheck})},createPin:function(e){this.latLong=e._LatLong;var t=new Microsoft.Maps.Pushpin(e._LatLong);return this.addOne(e),t},createClusteredPin:function(e,t){var n=new Microsoft.Maps.Pushpin(t,{text:"+"});for(var r=0;r<e.length;r++)this.addOne(e[r]);return n},displayCheck:function(){}}),ListingDetail.PagerView=Backbone.View.extend({name:"js-detail-pager",el:"[data-id='js-listing-detail-pager']",settings:{},page:1,initialize:function(e){_.bindAll(this,"loadCollection","render","getListing","page"),$("[data-id='js-listing-detail-pager']").hide(),this.listingView=e,this.listingModel=e.model,HMSEvent.on(this.listingView.name+"-render",this.loadCollection),this.collection=new ListingDetail.PagerCollection,this.router=e.router,HMSEvent.on(this.collection.name+"-parsecomplete",this.render),this.loadCollection()},loadCollection:function(){var e=this.listingModel.toJSON();this.collection.isHomeValue=HmsGlobal.convertToBool(e.IsHomeValue),this.collection.isForeclosure=HmsGlobal.convertToBool(e.IsForeclosure),this.collection.isHomeValue?this.collection.params.ListingID=e.HVListingID:this.collection.params.ListingID=e.ListingID,this.collection.params.Page=this.listingView.page,this.collection.fetch()},page:function(e){var t=this,n=parseInt($.cookie("ldpCount")),r=parseInt($.cookie("ldpCount"));r+=1,!isLoggedin()&&_bolE2_framework&&r%3==0&&r<=9&&HMSEvent.trigger("setdefaultframework"),e.preventDefault(),isNextPage=!0,isNextPageMap=!0,_bolIsHFLoaded=!1,HMSEvent.trigger("on-next-page",this);var i=t.listingView.getBaseRoute(),s=e.currentTarget,o,u,a;o=$(s).attr("data-listingid"),u=$(s).attr("data-listingurl"),a=$(s).attr("data-page"),t.listingView.page=a,i+=o+u,t.router.navigate(i,{trigger:!0})},render:function(e){this.pagers=$("[data-id='js-listing-detail-pager']"),this.prev=this.pagers.filter("[data-type='js-prev']"),this.next=this.pagers.filter("[data-type='js-next']"),this.pagers.on("click",this.page),e.prevlistingurl?(this.prev.attr("data-listingurl",e.prevlistingurl),this.prev.attr("data-listingid",e.prevlistingid),this.prev.attr("data-page",e.prevpage),this.prev.show()):this.prev.hide(),e.nextlistingurl?(this.next.attr("data-listingurl",e.nextlistingurl),this.next.attr("data-listingid",e.nextlistingid),this.next.attr("data-page",e.nextpage),this.next.show()):this.next.hide()},getListing:function(e,t,n,r){this.listingModel.params.ListingID=n,this.listingView.block(),this.listingModel.fetch()}}),ListingDetail.PagerCollection=Backbone.Collection.extend({name:"model-listingdetail-pager",params:{SiteID:siteid,Page:1},parse:function(e){return HMSEvent.trigger(this.name+"-parsecomplete",e),e},url:function(){var e="/api/listingpager/?";return _.each(this.params,function(t,n){e+=n+"="+t+"&"}),this.isHomeValue&&(e+="isHomeValue=true"),this.isForeclosure&&(e+="isForeclosure=true"),e}}),ListingDetail.MoreListings=Backbone.View.extend({el:"#js-modal-morelistings",events:{"click a.js-otherlisting":"handleClick"},initialize:function(e){_.bindAll(this,"render","renderCallback","handleClick","refresh"),this.listingView=e,this.router=e.router,this.refresh()},refresh:function(){var ol=new Array;$(".js-otherlisting-item").each(function(i,o){ol.push(eval("("+$(o).data("otherlisting")+")"))}),this.model=new Backbone.Model,this.model.set("OtherListings",ol),this.model.get("OtherListings")&&this.model.get("OtherListings").length>0?$(".js-user-morelistings").show():$(".js-user-morelistings").hide()},render:function(){HMSTemplate.get(templateMoreListings,this.renderCallback)},renderCallback:function(e){var t=e.render(this.model.toJSON());HMSEvent.trigger("ui-modal-open",{content:t}),this.setElement($("#js-modal-morelistings"))},handleClick:function(e){e.preventDefault(),HMSEvent.trigger("ui-modal-close"),isNextPage=!0,isNextPageMap=!0;var t=this.listingView.getBaseRoute(),n=e.currentTarget,r,i,s;r=$(n).attr("data-listingid"),i=$(n).attr("data-listingurl"),s=$(n).attr("data-page"),s&&(this.listingView.page=s),t+=r+i,this.router.navigate(t,{trigger:!0})}}),ListingDetail.AltRegistrationModal=Backbone.View.extend({el:$("#js-modal-altregistration"),events:{"click .js-altregistration-close":"onAltregistrationClose","click .js-altregistration-submit":"onModalSubmit"},settings:{},initialize:function(e){_.extend(this.settings,e),_.bindAll(this,"render","renderCallback"),this.setElement($("#js-modal-altregistration")),HMSEvent.on("onBeforeModalClose",this.onModalClose,this)},showModal:function(e){this.parent=e.parent,this.callBack=e.callback,this.arg=e.arg,this.render()},render:function(e){HMSTemplate.get(templateAltReg,this.renderCallback)},renderCallback:function(e){var t="";t+=e.render(),HMSEvent.trigger("ui-modal-open",{content:t}),this.setElement($("#js-modal-altregistration"))},onModalSubmit:function(e){HMSEvent.trigger("user-show-register",{callback:this.callBack,args:this.arg})},onModalClose:function(e){var t={};e&&($(e.currentTarget).parents("#js-modal-altregistration").length>0?(_bolCancelFramework=!0,_bolE1_framework&&(t.name="E1"),_bolE2_framework&&(t=_frameworkClicked),HMSEvent.trigger("onFrameWorkFunctionCallBack",{framework:t})):_bolCancelFramework=!1)},onAltregistrationClose:function(e){_bolCancelFramework=!0;var t={};_bolE1_framework&&(t.name="E1"),_bolE2_framework&&(t=_frameworkClicked),HMSEvent.trigger("onFrameWorkFunctionCallBack",{framework:t}),HMSEvent.trigger("ui-modal-close")}}),exports=ListingDetail,exports}),HMSEventMapReady=function(){HMSEvent.trigger("map-api-loaded")}