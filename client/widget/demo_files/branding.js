define(["backbonestore","app/models/search","templateEngine","hmsglobal"],function(e,t,n,r){var i={},s={},o="text!templates/branding/office.html",u="text!templates/branding/agent.html";return window.pendingRequests||(window.pendingRequests=new Array),window.HMSAgentBranding||(window.HMSAgentBranding={}),i.AgentModel=e.Model.extend({name:"js-agent-branding-model",params:{SiteID:siteid},url:function(){var e="/api/agentbranding/?";return _.each(this.params,function(t,n){e+=n+"="+t+"&"}),e}}),i.AgentView=e.View.extend({name:"js-agent-branding",el:"[data-id='js-agent-branding']",settings:{rmxaid:""},initialize:function(e){_.bindAll(this,"render","getID","renderCallback"),this.settings.aid=this.getID(),this.model=new i.AgentModel(this),this.model.params.aid=this.settings.aid,HMSTrackingVars.PageName=="Listing Details"&&typeof HMSTrackingVars.hideAgentBranding=="undefined"&&(HMSTrackingVars.hideAgentBranding=!1),HMSTrackingVars.PageName=="Property Search Results"&&(this.settings.verifydisplayrules=1,this.model.params.verifydisplayrules=this.settings.verifydisplayrules);if(HMSTrackingVars.PageName!="Listing Details"||HMSTrackingVars.PageName=="Listing Details"&&!HMSTrackingVars.hideAgentBranding)if(pendingRequests.length>0&&(!e||e&&!e.forceagentbranding)){var t=this;HMSAgentBranding&&HMSAgentBranding.toJSON?this.render(HMSAgentBranding):setTimeout(function(){HMSAgentBranding&&HMSAgentBranding.toJSON&&t.render(HMSAgentBranding)},2e3)}else if(this.model.params.aid&&this.model.params.aid!=""&&HMSTrackingVars.PageName!="Agent/Office Search Form"&&HMSTrackingVars.PageName!="Agent Search Results"&&HMSTrackingVars.PageName!="Agent Details"&&HMSTrackingVars.PageName!="Office Search Results"&&HMSTrackingVars.PageName!="Office Detail"){var n=this.model.fetch({success:this.render});pendingRequests.push(n)}else $("*[data-id='js-agent-branding']").html(""),$("*[data-id='js-agent-branding']").hide()},getID:function(){var t=$.cookie("rmxaid"),n=$.cookie("rmxaidlistingreferred");typeof HMSTrackingVars!="undefined"&&!t&&n&&n!=""&&HMSTrackingVars.PageName=="Listing Details"&&(t=n),t||(t=r.getQueryVal("rmxaid"),t&&$.cookie("rmxaid",t));if(!t&&$(".js-listitem").length>0){var i=new e.Model;i.loadFromMData({el:".js-listitem"}),i.get("ListingAgentAssID")&&(t=i.get("ListingAgentAssID"),$.cookie("rmxaidlistingreferred",t,{path:"/"}))}return t},render:function(e){this.model=e,HMSTemplate.get(u,this.renderCallback)},renderCallback:function(e){if(!window.HMSAgentBranding||!window.HMSAgentBranding.toJSON)window.HMSAgentBranding=this.model;var t="";if(this.model){if(this.model.attributes&&this.model.attributes.AgentBusinessPhone&&!isNaN(this.model.attributes.AgentBusinessPhone)){var n=this.model.attributes.AgentBusinessPhone.match(/(\d{3})(\d{3})(\d{4})/);n&&(n="("+n[1]+") "+n[2]+"-"+n[3],this.model.attributes.AgentBusinessPhone=n)}t=e.render(this.model.toJSON())}var r="[data-id='js-agent-branding']";$(r).html(t),this.setElement($(r)),$(r).show()}}),i.OfficeModel=e.Model.extend({name:"model-office",initialize:function(e){_.bindAll(this,"loadFromMData","loadOffice"),this.loadOffice(e)},loadOffice:function(e){this.loadFromMData(e)}}),i.Office=e.View.extend({name:"js-branding",el:"[data-id='js-branding']",settings:{},initialize:function(e){_.bindAll(this,"render","renderCallback","renderHeader","renderHeaderCallback"),_.extend(this.settings,e),this.settings.collection&&this.settings.collection.on("complete",this.render),this.model=new i.OfficeModel(this),this.renderHeader(this.model.toJSON())},render:function(e){var t=e.metadata.office;if(t){if(!t.VirtualOfficeAllowed&&siteid!=t.SiteID||t.VirtualOfficeAllowed&&!r.convertToBool(this.model.get("VirtualOfficeAllowed")))return e&&e.params&&e.params.lsid!=""&&(t.lsid=e.params.lsid),HMSEvent.trigger("hms-redirect-search",t),!1;t.SiteID!=undefined&&(siteid=t.SiteID,HMSTemplate.get(o,this.renderCallback))}return this},renderCallback:function(e){var t,n=this.collection.metadata.office;t=e.render(n),$(this.el).html($(t).children()),this.renderHeader(n),this.model.loadOffice(this)},renderHeader:function(e){this.modelHeader=e,HMSTemplate.get(o,this.renderHeaderCallback)},renderHeaderCallback:function(e){var t,n,r=this.modelHeader;r&&(r.Address1=null,r.Address2=null,r.City=null,r.State=null,r.Zip=null,r.Phone=null,r.LicensedIn=null,r.LicenseNumber=null,r.ShowListingInformationSponsoredby&&r.ShowListingInformationSponsoredby.toLowerCase&&r.ShowListingInformationSponsoredby.toLowerCase()=="false"&&(r.ShowListingInformationSponsoredby=!1),t=$("#js-branding-header"),n=e.render(r),t.html(n))}}),s=i,s})