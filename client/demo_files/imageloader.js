define(["backbonestore"],function(e){var t={},n={},r="photo-coming-soon",i=!1,s="/resources/images/rmx-photo-coming-soon.jpg";return t.GetThumbnail=function(e){e=$(e).filter("[data-src]");if(e){var n=t.GetImageData(e,"src",""),i=t.GetImageData(e,"height",0),o=t.GetImageData(e,"width",0),u=t.GetImageData(e,"maintainscale",1),a=t.GetImageData(e,"type",0);n?(n=t.GetThumbnailURL(n,i,o,u,a),$(e).removeClass(r),$(e).attr("src",n)):($(e).attr("src",s),$(e).addClass(r))}},t.GetThumbnails=function(e){var n=$(e).find("[data-src]");if(n)for(var r=0;r<n.length;r++)t.GetThumbnail(n[r])},t.LazyLoad=function(e){var n,r="",s=new Array;e&&(e.selector&&(e.selector=="#js-foreclosures-view"&&(i=!0),r=e.selector),e.el&&(n=e.el)),r=r+" "+"img[data-src]",n?n=n.find(r):n=$(r);for(var o=0;o<n.length;o++){var u=t.GetImageData(n[o],"src",""),a=t.GetImageData(n[o],"height",0),f=t.GetImageData(n[o],"width",0),l=a,c=f,h=t.GetImageData(n[o],"maintainscale",0),p=t.GetImageData(n[o],"scaleto","width"),d=t.GetImageData(n[o],"timeout",2e4);d==-1&&(d=null),h=="1"&&p&&(p=="width"?a=1e3:p=="height"&&(f=1e3));if(u==""||u=="null")t.NoImage(n[o]);else{t.DomainImage(u)?u=t.GetThumbnailURL(u,a,f,h):u=t.GetThumbnailCrossDomain(u,a,f,h);if($.browser.msie||window.chrome){var v={height:l,width:c};t.Success(u,"",v)}else s[o]=$.ajax({url:u,type:"GET",timeout:d,beforeSend:function(e){e.overrideMimeType("text/plain; charset=x-user-defined")},dims:{height:l,width:c},cache:!0}),s[o].fail(function(e,n){t.FailOver(this.url,this.dims)}),s[o].done(function(e,n,r){e.length==9018||e.length==0?t.FailOver(this.url,this.dims):t.Success(this.url,e,this.dims)})}}},t.GetImageData=function(e,t,n){var r=$(e).attr("data-"+t);return r||(r=n),r},t.DomainImage=function(e){var t=/.+cdn-.+eneighborhoods.com.+/g;return t.test(e)},t.Success=function(e,n,i){try{e=t.ParseURL(e);var s="[data-src='"+e+"']",o,u,a;i&&(i.height&&(s+="[data-height='"+i.height+"']"),i.width&&(s+="[data-width='"+i.width+"']")),o=$(s),a=e.substring(e.lastIndexOf(".")+1),n.length==0?u=e:u="data:image/"+a+";base64,"+t.base64Encode(n),o.removeClass(r),o.attr("src",u)}catch(f){t.FailOver(e)}},t.ParseURL=function(e){e.indexOf("/system/img.aspx")>=0&&(e=unescape(e.substring(e.indexOf("img=")+4)));if(e.indexOf("_resizeto_")>=0){var t;t=e.substring(e.indexOf("_resizeto_"),e.lastIndexOf(".")),e=e.replace(t,"")}return e},t.GetThumbnailCrossDomain=function(e,t,n,r){return e="/system/img.aspx?w="+n+"&h="+t+"&s="+r+"&img="+escape(e),e},t.GetThumbnailURL=function(e,n,r,i,s){t.DomainImage(e)&&s=="largeImage"&&(n="458",r="611");var o="_resizeto_{maxWidth}x{maxHeight}x{maintainScale}";return n=parseInt(n),r=parseInt(r),n==0||r==0?e:(t.DomainImage(e)&&(o=o.replace("{maxHeight}",n),o=o.replace("{maxWidth}",r),o=o.replace("{maintainScale}",i),e=e.substring(0,e.lastIndexOf("."))+o+e.substring(e.lastIndexOf("."))),e)},t.FailOver=function(e,n){e=t.ParseURL(e);var r="[data-src='"+e+"']",i;n&&(n.height&&(r+="[data-height='"+n.height+"']"),n.width&&(r+="[data-width='"+n.width+"']")),i=$(r),t.NoImage(i)},t.NoImage=function(e){var n,s,o,u,a,f,l;s=t.GetImageData(e,"lat",0),o=t.GetImageData(e,"long",0),a=t.GetImageData(e,"height",0),f=t.GetImageData(e,"width",0);if(s==0&&o==0)return t.NoLatLong(e);a&&f?u="&mapSize="+f+","+a:u="",i?l="":l="&pp="+s+","+o+";8",n="http://dev.virtualearth.net/REST/v1/Imagery/Map/Aerial/"+s+","+o+"/18/?key=AixeHnqgeDJMlM66s_zas1q9tJ0JbIkjuIVzLwiu7r1bBlRTNSkFo1eFkWYY4-Mm"+u+l,$(e).removeClass(r),$(e).attr("src",n)},t.NoLatLong=function(e){e&&($(e).attr("src",s),$(e).addClass(r))},t.base64Encode=function(e){var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",n="",r=0,i=e.length,s,o,u;while(r<i){s=e.charCodeAt(r++)&255;if(r==i){n+=t.charAt(s>>2),n+=t.charAt((s&3)<<4),n+="==";break}o=e.charCodeAt(r++);if(r==i){n+=t.charAt(s>>2),n+=t.charAt((s&3)<<4|(o&240)>>4),n+=t.charAt((o&15)<<2),n+="=";break}u=e.charCodeAt(r++),n+=t.charAt(s>>2),n+=t.charAt((s&3)<<4|(o&240)>>4),n+=t.charAt((o&15)<<2|(u&192)>>6),n+=t.charAt(u&63)}return n},n=t,n})