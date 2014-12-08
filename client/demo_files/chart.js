define(["domReady","backbonestore","app/ui-modules/charts/model/model","jqplot","app/ui-modules/charts/plugins/jqplot.highlighter.min","app/ui-modules/charts/plugins/jqplot.cursor.min","app/ui-modules/charts/plugins/jqplot.dateAxisRenderer.min"],function(e,t,n){function s(e){var t=document.createElement("link");t.type="text/css",t.rel="stylesheet",t.href=e,document.getElementsByTagName("head")[0].appendChild(t)}var r={},i={};return s("/resources/js/app/ui-modules/charts/ui/jquery.jqplot.min.css"),i.View=t.View.extend({el:"#js-chart-module",settings:{getdata:!0},events:{},model:new n.Charts,initialize:function(e){_.extend(this.settings,e),_.bindAll(this,"render","getCharts","getDataAttr","getData","plotChart"),this.getCharts()},getCharts:function(){var e=$(".js-chart"),t="",n=this;$.each(e,function(r,i){t=$(e[r]).attr("id"),$(e[r]).data("points")?n.getDataAttr(t):n.getData(t)})},getDataAttr:function(e){var t=[],n=$("#"+e).data("points");n.pop(),t.data=n,t.plot=e,this.plotChart(t)},getData:function(e){var t=[],n=[],r=this;this.settings.getdata?this.model.fetch({success:function(i){t=i.attributes.chartInfo,$.each(t,function(e,r){n.push([t[e].date,t[e].price])});var s=[];s.data=n,s.plot=e,r.plotChart(s)}}):$("chartInfo").each(function(e,t){})},plotChart:function(e){var t=[];t=e.data;var n=e.plot||"id";if(t.length==0){$("#js-home-value-history").hide();return}$("#js-home-value-history").show(),this.plot1=$.jqplot(n,[t],{legend:{show:!0,location:"n"},axesDefaults:{rendererOptions:{baselineWidth:1,baselineColor:"#cccccc",drawBaseline:!0}},axes:{xaxis:{renderer:$.jqplot.DateAxisRenderer,tickOptions:{formatString:"%b-%Y"},drawMajorGridlines:!0},yaxis:{pad:1.05,tickOptions:{formatString:"$%'d",showMark:!1}}},grid:{background:"rgba(0,0,0,0.0)",drawBorder:!1,shadow:!1,gridLineColor:"#cccccc",gridLineWidth:.8},highlighter:{show:!0,sizeAdjust:8,tooltipOffset:9},cursor:{show:!0,tooltipLocation:"sw"},series:[{label:"Estimated Value"}]})},render:function(){}}),r=i,r})