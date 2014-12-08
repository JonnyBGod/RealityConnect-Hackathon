define(["backbonestore","app/ui-modules/autocomplete/view","app/models/search","hmsglobal"],function(e,t,n,r){var i={},s={},o="text!templates/search/invalid-search-modal.html",u="text!templates/search/search-mls-modal.html",a="text!templates/search/listing-detail-not-found-modal.html";return i.Simplesearch=e.View.extend({el:"#js-user-propsearch",events:{"click .js-navsearch-submit":"doSearch",keypress:"handleKeypress","click .js-navsearch-mls":"doMlsModal"},settings:{},initialize:function(){_.bindAll(this,"doSearch","handleKeypress","doMlsModal","displayModalCallback"),this.invalidsearch=r.getQueryVal("invalidsearch"),this.listingnotfound=r.getQueryVal("listingnotfound"),HMSEvent.on("onShowMLSSearch",this.doMlsModal,this),t.execute(),this.invalidsearch==1?this.displayModal(o):this.listingnotfound==1&&this.displayModal(a)},displayModal:function(e,t){HMSTemplate.get(e,this.displayModalCallback)},displayModalCallback:function(e){$("#js-autocomplete-js-hpsearch-search").hide();var t="";t+=e.render(),HMSEvent.trigger("ui-modal-open",{content:t}),self.setElement&&self.setElement($("#js-modal-invalid-search"))},handleKeypress:function(e){e.keyCode==13&&this.doSearch(e)},doSearch:function(t){var r=$("#js-navbar-search");t.preventDefault(),HMSEvent.trigger("abort-autocomplete"),$("#js-navsearch").block({spinnerSettings:{lines:10,length:3,width:2,radius:4,corners:1,rotate:26,color:"#606060",speed:1,trail:94,className:"spinner"}}),seoModel=new n.SeoModel,seoModel.set({search:r.val(),SiteID:0,ignoremulticity:"true"}),seoModel.fetch({success:function(e){var t=e.toJSON();if(t.Success==1)$.cookie("HandoffSearchType","explicit",{path:"/"}),window.location.href=t.SEOUrl;else{$("#js-autocomplete-js-navbar-search").hide();var n="";n+=o.render(),HMSEvent.trigger("ui-modal-open",{content:n}),self.setElement&&self.setElement($("#js-modal-invalid-search")),$("#js-navsearch").unblock()}}})},doMlsModal:function(){this.mlsModal||(this.mlsModal=new i.MlsModal),this.mlsModal.showModal()}}),i.MlsModal=e.View.extend({el:"#js-modal-mls",events:{"click .js-mls-submit":"doSearch",keypress:"handleKeypress"},settings:{},initialize:function(e){_.bindAll(this,"renderCallback")},showModal:function(){this.render()},render:function(e){HMSTemplate.get(u,this.renderCallback)},renderCallback:function(e){var t="";t+=e.render(),HMSEvent.trigger("ui-modal-open",{content:t}),this.setElement($("#js-modal-mls"))},handleKeypress:function(e){e.keyCode==13&&this.doSearch(e)},doSearch:function(e){var t=$("#js-mls-change");e.preventDefault(),$("#js-modal-mls").block(),seoModel=new n.SeoModel,seoModel.set({mls:t.val(),SiteID:0}),seoModel.fetch({success:function(e){var t=e.toJSON();t.Success==1?window.location.href=t.SEOUrl:($("#js-modal-mls").unblock(),$("#js-mls-change").trigger("keyup"))}})}}),s=i,s})