define(["domReady","backbonestore","bootstrap-plugins/bootstrap-dropdown"],function(e,t){function i(e){var t=document.createElement("link");t.type="text/css",t.rel="stylesheet",t.href=e,document.getElementsByTagName("head")[0].appendChild(t)}var n={},r={};return i("/resources/js/app/ui-modules/dropdown/ui/dropdown.css"),r.View=t.View.extend({events:{"click .dropdown-menu label":"onDropDownClick","click .dropdown-menu input":"onDropDownClick"},settings:{},el:".dropdown-menu",initialize:function(e){_.extend(this.settings,e),_.bindAll(this,"render","onDropDownClick"),this.render()},render:function(){},onDropDownClick:function(e){}}),n.execute=function(e){return new r.View(e)},n})