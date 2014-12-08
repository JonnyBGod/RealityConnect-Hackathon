'use strict';

/* Directives */


angular.module('directives', [])
	.directive('caasTime', function() {
	    return {
	    	link: function(scope, elm, attr) {
	    		moment.locale('en');
		    	return elm.text(moment(new Date(parseInt(attr.caasTime.toString().slice(0,8), 16)*1000)).calendar());
		    }
	    };
	})
	.directive('caasTimeStamp', function() {
	    return {
	    	link: function(scope, elm, attr) {
	    		moment.locale('en');
		    	return elm.text(moment(new Date(parseInt(attr.caasTimeStamp.toString().slice(0,8), 16)*1000)).format('LT'));
		    }
	    };
	})
	.directive('whenScrolledChat', function($timeout) {
	    return function(scope, elm, attr) {
	        var raw = elm[0];
	        var sh = false;

	        elm.bind('scroll', function() {
	        	if (sh) sh = false;

	            if (!scope.forceScrollReset && !scope.loading && raw.scrollTop <= 100) {
	                sh = raw.scrollHeight;
	                scope.$apply(attr.whenScrolledChat).then(function() {
	                    $timeout(function() {
	                    	if (sh)
	                        	raw.scrollTop = raw.scrollHeight - sh;
	                    });
	                });
	            } else if (raw.scrollTop + raw.clientHeight === raw.scrollHeight) {
					if (!scope.currentChatRoom.seen
						|| !scope.currentChatRoom.seen.filter(function (e) { return e.user === scope.currentUser.id }).length
						|| new Date(scope.currentChatRoom.seen.filter(function (e) { return e.user === scope.currentUser.id })[0].date) < new Date(parseInt(scope.currentChatRoom.events[scope.currentChatRoom.events.length -1].id.toString().slice(0,8), 16)*1000)
						) {

						scope.updateSeen();
						scope.$apply();
					}
	            }
	        });
	    };
	})
	.directive('whenScrolled', function($timeout) {
	    return function(scope, elm, attr) {
	        var raw = elm[0];

	        elm.bind('scroll', function() {
	            if (!scope.currentChatRoom.loadingFiles && raw.scrollHeight - raw.scrollTop <=  raw.clientHeight + 100) {
	                scope.$apply(attr.whenScrolled);
	            }
	        });
	    };
	})
	.directive('seenSrc', function() {
	    return {
	    	link: function(scope, elm, attr) {
	    		return elm.attr('src', scope.currentChatRoom.users.filter(function (e){ return e.id === scope.seen.user })[0].photo || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iMTQwIj48cmVjdCB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjcwIiB5PSI3MCIgc3R5bGU9ImZpbGw6I2FhYTtmb250LXdlaWdodDpib2xkO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtZmFtaWx5OkFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmO2RvbWluYW50LWJhc2VsaW5lOmNlbnRyYWwiPjE0MHgxNDA8L3RleHQ+PC9zdmc+');
		    }
	    };
	})
	.directive('photoSrc', function() {
	    return {
	    	link: function(scope, elm, attr) {
	    		var user = scope.currentChatRoom.users.filter(function (e){ return e.id === scope.event.sender })[0] || scope.currentChatRoom.oldUsers.filter(function (e){ return e.id === scope.event.sender })[0];
	    		return elm.attr('src', user.photo || scope.params.t_p || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iMTQwIj48cmVjdCB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjcwIiB5PSI3MCIgc3R5bGU9ImZpbGw6I2FhYTtmb250LXdlaWdodDpib2xkO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtZmFtaWx5OkFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmO2RvbWluYW50LWJhc2VsaW5lOmNlbnRyYWwiPjE0MHgxNDA8L3RleHQ+PC9zdmc+');
		    }
	    };
	})
	.directive('imageSrc', function($timeout) {
	    return {
	    	link: function(scope, element, attrs) {
	    		$timeout(function () {
	    			var width = element.width();
		    		var height = element.height();

		    		if (attrs.imageSrc.indexOf('http') === -1) {
		    			attrs.imageSrc = 'http:'+ attrs.imageSrc;
		    		}
		            for (var x = 0; x < photoSizesWidths.length; x++) {
						if (photoSizesWidths[x] < width) {
							for (var y = 0; y < photoSizesHeights.length; y++) {
								if (photoSizesHeights[y] < height) {
									var calc = (photoSizesWidths[x-1] ? photoSizesWidths[x-1] : photoSizesWidths[x]) +'x'+ (photoSizesHeights[y-1] ? photoSizesHeights[y-1] : photoSizesHeights[y]);
									element.attr('src', '//d10nrrb1q7v7qu.cloudfront.net/'+ encodeURL(CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1('trim/'+ calc +'/smart/'+ attrs.imageSrc, 'qwerty'))) +'/trim/'+ calc +'/smart/'+ attrs.imageSrc);
									y = photoSizesHeights.length + 1;
								}
							}
							x = photoSizesWidths.length + 1;
						}
					};
	    		}, 0);
	        }

	    };

    })
	.directive('arrowBackground', function() {
	    return {
	    	link: function(scope, elm, attr) {
	    		elm.append('<style scoped>'+ attr.arrowBackground +'</style>');

	    		attr.$observe('arrowBackground', function(val){
	    			elm.children('style').remove();
	    			elm.append('<style scoped>'+ attr.arrowBackground +'</style>');
	    		});
		    }
	    };
	});
