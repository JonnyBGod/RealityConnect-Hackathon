/*
*
* Copyright (c) 2011 Justin Dearing (zippy1981@gmail.com)
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) version 2 licenses.
* This software is not distributed under version 3 or later of the GPL.
*
* Version 1.0.1-dev

* Changes made by Jonathan Häberle (jonathan.haeberle@gmail.com)
* Published to BPM for browserify-usage
*
*/

/**
 * Javascript class that mimics how WCF serializes a object of type MongoDB.Bson.ObjectId
 * and converts between that format and the standard 24 character representation.
*/
var ObjectId = (function () {
    var increment = 0;
    var pid = Math.floor(Math.random() * (32767));
    var machine = Math.floor(Math.random() * (16777216));

    if (typeof (localStorage) != 'undefined') {
        var mongoMachineId = parseInt(localStorage['mongoMachineId']);
        if (mongoMachineId >= 0 && mongoMachineId <= 16777215) {
            machine = Math.floor(localStorage['mongoMachineId']);
        }
        // Just always stick the value in.
        localStorage['mongoMachineId'] = machine;
        document.cookie = 'mongoMachineId=' + machine + ';expires=Tue, 19 Jan 2038 05:00:00 GMT'
    }
    else {
        var cookieList = document.cookie.split('; ');
        for (var i in cookieList) {
            var cookie = cookieList[i].split('=');
            if (cookie[0] == 'mongoMachineId' && cookie[1] >= 0 && cookie[1] <= 16777215) {
                machine = cookie[1];
                break;
            }
        }
        document.cookie = 'mongoMachineId=' + machine + ';expires=Tue, 19 Jan 2038 05:00:00 GMT';

    }

    function ObjId() {
        if (!(this instanceof ObjectId)) {
            return new ObjectId(arguments[0], arguments[1], arguments[2], arguments[3]).toString();
        }

        if (typeof (arguments[0]) == 'object') {
            this.timestamp = arguments[0].timestamp;
            this.machine = arguments[0].machine;
            this.pid = arguments[0].pid;
            this.increment = arguments[0].increment;
        }
        else if (typeof (arguments[0]) == 'string' && arguments[0].length == 24) {
            this.timestamp = Number('0x' + arguments[0].substr(0, 8)),
            this.machine = Number('0x' + arguments[0].substr(8, 6)),
            this.pid = Number('0x' + arguments[0].substr(14, 4)),
            this.increment = Number('0x' + arguments[0].substr(18, 6))
        }
        else if (arguments.length == 4 && arguments[0] != null) {
            this.timestamp = arguments[0];
            this.machine = arguments[1];
            this.pid = arguments[2];
            this.increment = arguments[3];
        }
        else {
            this.timestamp = Math.floor(new Date().valueOf() / 1000);
            this.machine = machine;
            this.pid = pid;
            this.increment = increment++;
            if (increment > 0xffffff) {
                increment = 0;
            }
        }
    };
    return ObjId;
})();

ObjectId.prototype.getDate = function () {
    return new Date(this.timestamp * 1000);
};

ObjectId.prototype.toArray = function () {
    var strOid = this.toString();
    var array = [];
    var i;
    for(i = 0; i < 12; i++) {
        array[i] = parseInt(strOid.slice(i*2, i*2+2), 16);
    }
    return array;
};

/**
* Turns a WCF representation of a BSON ObjectId into a 24 character string representation.
*/
ObjectId.prototype.toString = function () {
    var timestamp = this.timestamp.toString(16);
    var machine = this.machine.toString(16);
    var pid = this.pid.toString(16);
    var increment = this.increment.toString(16);
    return '00000000'.substr(0, 8 - timestamp.length) + timestamp +
           '000000'.substr(0, 6 - machine.length) + machine +
           '0000'.substr(0, 4 - pid.length) + pid +
           '000000'.substr(0, 6 - increment.length) + increment;
};

(function($){
    $.countLines = function(ta, options){
        var defaults = {
            recalculateCharWidth: true,
            charsMode: "random",
            fontAttrs: ["font-family", "font-size", "text-decoration", "font-style", "font-weight"]
        };
        
        options = $.extend({}, defaults, options);
        
        var masterCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var counter;
        
        if (!ta.jquery){
            ta = $(ta);
        }
        
        var value = ta.val();
        switch (options.charsMode){
            case "random":
                // Build a random collection of characters
                options.chars = "";
                masterCharacters += ".,?!-+;:'\"";
                for (counter = 1; counter <= 12; counter++){
                    options.chars += masterCharacters[(Math.floor(Math.random() * masterCharacters.length))];
                }
                break;
            case "alpha":
                options.chars = masterCharacters;
                break;
            case "alpha_extended":
                options.chars = masterCharacters + ".,?!-+;:'\"";
                break;
            case "from_ta":
                // Build a random collection of characters from the textarea
                if (value.length < 15){
                    options.chars = masterCharacters;
                } else {
                    for (counter = 1; counter <= 15; counter++){
                        options.chars += value[(Math.floor(Math.random() * value.length))];
                    }
                }
                break;
            case "custom":
                // Already defined in options.chars
                break;
        }

        // Decode chars
        if (!$.isArray(options.chars)){
            options.chars = options.chars.split("");
        }

        // Generate a span after the textarea with a random ID
        var id = "";
        for (counter = 1; counter <= 10; counter++){
            id += (Math.floor(Math.random() * 10) + 1);
        }

        ta.after("<span id='s" + id + "'></span>");
        var span = $("#s" + id);

        // Hide the span
        span.hide();

        // Apply the font properties of the textarea to the span class
        $.each(options.fontAttrs, function(i, v){
            span.css(v, ta.css(v));
        });

        // Get the number of lines
        var lines = value.split("\n");
        var linesLen = lines.length;

        var averageWidth;

        // Check if the textarea has a cached version of the average character width
        if (options.recalculateCharWidth || ta.data("average_char") == null) {
            // Get a pretty good estimation of the width of a character in the textarea. To get a better average, add more characters and symbols to this list
            var chars = options.chars;

            var charLen = chars.length;
            var totalWidth = 0;

            $.each(chars, function(i, v){
                span.text(v);
                totalWidth += span.width();
            });

            // Store average width on textarea
            ta.data("average_char", Math.ceil(totalWidth / charLen));
        }

        averageWidth = ta.data("average_char");

        // We are done with the span, so kill it
        span.remove();

        // Determine missing width (from padding, margins, borders, etc); this is what we will add to each line width
        var missingWidth = (ta.outerWidth() - ta.width()) * 2;

        // Calculate the number of lines that occupy more than one line
        var lineWidth;

        var wrappingLines = 0;
        var wrappingCount = 0;
        var blankLines = 0;

        $.each(lines, function(i, v){
            // Calculate width of line
            lineWidth = ((v.length + 1) * averageWidth) + missingWidth;
            // Check if the line is wrapped
            if (lineWidth >= ta.outerWidth()){
                // Calculate number of times the line wraps
                var wrapCount = Math.floor(lineWidth / ta.outerWidth());
                wrappingCount += wrapCount;
                wrappingLines++;
            }

            if ($.trim(v) === ""){
                blankLines++;
            }
        });

        var ret = {};
        ret["actual"] = linesLen;
        ret["wrapped"] = wrappingLines;
        ret["wraps"] = wrappingCount;
        ret["visual"] = linesLen + wrappingCount;
        ret["blank"] = blankLines;

        return ret;
    };
}(jQuery));
'use strict';

angular
  .module('ori', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ngRoute',
    'lbServices',
    'services',
    'directives',
    'pascalprecht.translate', 'angulartics', 'angulartics.google.tagmanager'
  ])

  .config(['$locationProvider', function($locationProvider) {
      $locationProvider.
          html5Mode(true).hashPrefix('!');
  }])

  .config(['$translateProvider', function ($translateProvider) {
    // add translation tables
    $translateProvider.useStaticFilesLoader({
        prefix: 'locales/en.',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('en-GB');
    // remember language
    $translateProvider.useLocalStorage();

    //$translateProvider.useMissingTranslationHandler('sendMissingTranslation');
  }])

  .config(['$analyticsProvider', function ($analyticsProvider) {
    // turn off automatic tracking
    $analyticsProvider.settings.trackRelativePath = true;
  }])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'views/home.html',
        controller: 'homeCtrl',
        resolve: {
          app: ['$route', 'App', function($route, App) {
            return App.findById({id: $route.current.params.apiKey},
              function (res) {
                return res;
              },
              function () {
                return null;
              }
            );
          }],
          owner: ['$route', 'User', function($route, User) {
            return User.findOne({filter: {where: {or: [
              {phone: $route.current.params.t_i},
              {email: $route.current.params.t_i}
            ]}}},
              function (res) {
                return res;
              },
              function () {
                return null;
              }
            );
          }]
        }
      }).
      otherwise({
        redirectTo: '/'
      });
  }])

  .run(['AppAuth', 'User', 'LoopBackAuth', function(AppAuth, User, LoopBackAuth) {
    AppAuth.ensureHasCurrentUser(User);

    Visibility.change(function (e, state) {
      if (state === 'visible') {
        LoopBackAuth.currentUserId = localStorage['$LoopBack$currentUserId'] || sessionStorage['$LoopBack$currentUserId'] || null;
        LoopBackAuth.accessTokenId = localStorage['$LoopBack$accessTokenId'] || sessionStorage['$LoopBack$accessTokenId'] || null;
        AppAuth.ensureHasCurrentUser(User);
      }
    });
  }]);

'use strict';

angular.module('services', ['lbServices'])
  .factory('AppAuth', ['$rootScope', '$location', 'LoopBackAuth', '$window', function($rootScope, $location, LoopBackAuth, $window) {
    return {
      currentUser: {},

      // Note: we can't make the User a dependency of AppAuth
      // because that would create a circular dependency
      //   AppAuth <- $http <- $resource <- LoopBackResource <- User <- AppAuth
      ensureHasCurrentUser: function(User) {
        if (this.currentUser && this.currentUser.id) {
          if (!LoopBackAuth.currentUserId || !LoopBackAuth.accessTokenId) {
            return this.logout(User);
          }
        } else if (LoopBackAuth.currentUserId && LoopBackAuth.accessTokenId) {
          var self = this;
          self.currentUser = User.getCurrent(function(response) {
            // success
            self.currentUser.chatRooms = [];
            $rootScope.$broadcast('login', response.username);
          }, function(response) {
            console.log(response);
          });
        }
      },
      logout: function (User) {
        var self = this;
        User.logout(function() {
          self.currentUser = null;

          LoopBackAuth.currentUserId = '';
          LoopBackAuth.accessTokenId = '';
          LoopBackAuth.rememberMe = true;
          LoopBackAuth.save();

          $location.path('/');
          $window.location.reload();
        }, function (err) {
          if (err && err.data.error.message === 'could not find accessToken') {
            self.currentUser = null;

            LoopBackAuth.currentUserId = '';
            LoopBackAuth.accessTokenId = '';
            LoopBackAuth.rememberMe = true;
            LoopBackAuth.save();

            $location.path('/');
            $window.location.reload();
          }
        });
      }
    };
  }])
  .factory('iframe', ['$rootScope', function($rootScope) {
    function d(a) {
        return a.hash.slice(1).replace(/(^\d+).*/, "$1")
    }

    function e(a) {
        var b = a.split("/");
        return b[0] + "//" + b[2]
    }
    var f = d(window.location),
        g = window.opener || window.parent,
        h = document.referrer,
        i = {};
    i.client = e(document.location.href), i.host = h ? e(h) : i.client;

    var j = {
        getUID: d,
        origins: i,
        messageHandler: function (a) {
            a = a.originalEvent;
            var b;
            try {
                b = JSON.parse(a.data)
            } catch (c) {
                return
            }
            //console.log(b);
            if (!b.name || "!" !== b.name[0] || a.origin === i.client) switch (b.scope) {
            case "host":
                break;
            case "client":
                $rootScope.$broadcast(b.name, b.data)
            }
        },
        postMessage: function (a) {
            a.sender = f, a = JSON.stringify(a), g.postMessage(a, "*")
        },
        sendHostMessage: function (a, b) {
            b = b || [], j.postMessage({
                scope: "host",
                name: a,
                data: b
            })
        }
    };

    $(window).on("message", j.messageHandler);
    $(window).on("unload", function () {
      j.sendHostMessage("die")
    });

    return j;
  }])
  .factory('socket', ['$rootScope', 'LoopBackAuth', 'AppAuth', function($rootScope, LoopBackAuth, AppAuth) {
    return {
      socket: false,
      connect: function (token) {
        var self = this;
        if (!self.socket) {
          self.socket = io('/', {
            'query': 'access_token=' + LoopBackAuth.accessTokenId
          });

          self.on('connection', function(data) {
            console.log('connect');
          });

          self.on('connection_error', function(data) {
            console.log('connect_error');
          });

          self.on('chat', function(data) {
            console.log('chat', data);
            if (data.type === 'startConversation') {
              var room = AppAuth.currentUser.chatRooms.filter(function (e) { return e.id === data.chatRoom.id });
              if (!room.length) {
                data.chatRoom.noMore = true;
                if (!data.chatRoom.events) {
                  data.chatRoom.events = [];
                }
                AppAuth.currentUser.chatRooms.push(data.chatRoom);
              } else {
                for (var y = 0; y < data.chatRoom.users.length; y++) {
                  if (!room[0].users.filter(function (e) { return e.id === data.chatRoom.users[y].id }).length) {
                    room[0].users.push(data.chatRoom.users[y]);
                  }
                }
              }
              data = data.event || data.events;
            }

            if (!Array.isArray(data)) {
              data = [data];
            }

            for (var d = 0; d < data.length; d++) {
              for (var i = AppAuth.currentUser.chatRooms.length - 1; i >= 0; i--) {
                if (AppAuth.currentUser.chatRooms[i].id === data[d].chatRoom
                  || (data[d].chatRooms && data[d].chatRooms.indexOf(AppAuth.currentUser.chatRooms[i].id) !== -1)) {
                  if (data[d].type.indexOf('update') !== -1) {
                    if (data[d].type === 'update:seen') {
                      if (!AppAuth.currentUser.chatRooms[i].seen) {
                        AppAuth.currentUser.chatRooms[i].seen = [data[d].seen];
                      } else if (AppAuth.currentUser.chatRooms[i].seen.filter(function (e) { return e.user === data[d].seen.user }).length) {
                        AppAuth.currentUser.chatRooms[i].seen.filter(function (e) { return e.user === data[d].seen.user })[0].date = data[d].seen.date;
                      } else {
                        AppAuth.currentUser.chatRooms[i].seen.push(data[d].seen);
                      }
                    } else {
                      for (var y = AppAuth.currentUser.chatRooms[i].users.length - 1; y >= 0; y--) {
                        if (AppAuth.currentUser.chatRooms[i].users[y].id === data[d].sender) {
                          if (data[d].type === 'update:writting') {
                            AppAuth.currentUser.chatRooms[i].users[y].writting = true;
                          } else if (data[d].type === 'update:stoppedWritting') {
                            AppAuth.currentUser.chatRooms[i].users[y].writting = false;
                          }
                        }
                      }
                    }
                  } else {
                    AppAuth.currentUser.chatRooms[i].events.push(data[d]);
                  }
                }
              };
            };
          });
        }
      },
      on: function(eventName, callback) {
        var self = this;
        self.socket.on(eventName, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            callback.apply(self.socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        var self = this;
        self.socket.emit(eventName, data, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            if(callback) {
              callback.apply(self.socket, args);
            }
          });
        });
      },
      json: {
        send: function(data, callback) {
          var self = this;
          self.socket.json.send(data, function() {
            var args = arguments;
            $rootScope.$apply(function() {
              if(callback) {
                callback.apply(self.socket, args);
              }
            });
          });
        }
      }
    };
  }]);
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
	.directive('whenScrolledChat', ['$timeout', function($timeout) {
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
	}])
	.directive('whenScrolled', ['$timeout', function($timeout) {
	    return function(scope, elm, attr) {
	        var raw = elm[0];

	        elm.bind('scroll', function() {
	            if (!scope.currentChatRoom.loadingFiles && raw.scrollHeight - raw.scrollTop <=  raw.clientHeight + 100) {
	                scope.$apply(attr.whenScrolled);
	            }
	        });
	    };
	}])
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
	.directive('imageSrc', ['$timeout', function($timeout) {
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

    }])
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

'use strict';

angular.module('ori')
	.controller('homeCtrl', ['$scope', 'User', 'ChatRoom', '$location', 'AppAuth', 'app', 'owner', 'iframe', '$routeParams', '$timeout', '$q', function ($scope, User, ChatRoom, $location, AppAuth, app, owner, iframe, $routeParams, $timeout, $q) {
		$scope.currentUser = AppAuth.currentUser;
    $scope.params = $routeParams;
    $scope.showForm = false;
    $scope.ShowRegisterForm = false;
    $scope.data = {};
    $scope.success = false;
    $scope.error = false;
    $scope.formData = {};

		$scope.logout = function () {
      AppAuth.logout(User)
    };

    $q.all([app, owner]).then(function(results) {
        $scope.app = results[0];
        $scope.owner = results[1];

        if ($scope.currentUser.id && !$scope.currentChatRoom) {
          $scope.getChatRoom();
        }

        $timeout(function () {
          if ($scope.owner.email && $scope.owner.email === $scope.params.o_e && $scope.app) {
            iframe.sendHostMessage("ready");
            iframe.sendHostMessage("mainViewRendered", {
                height: $("body").height()
            })
          } else {
            iframe.sendHostMessage("fail");
            iframe.sendHostMessage("mainViewRendered", {
                height: $("body").height()
            })
          }
        }, 0);
    });

    $scope.getChatRoom = function () {
      var parser = document.createElement('a');
      parser.href = $scope.params.t_u;

      User.prototype$getChatRoom({
        id: $scope.currentUser.id,
        filter: {
          owner: $scope.owner.id,
          appId: $scope.app.id,
          appUrl: parser.pathname + parser.search
      }},
        function (res) {
          AppAuth.currentUser.chatRooms = [res.chatRoom];
          $scope.currentChatRoom = AppAuth.currentUser.chatRooms[0];
          $timeout(function () {
            iframe.sendHostMessage("resize", {
              height: $("body").height()
            });
          }, 100);
        },
        function (err) {
          AppAuth.currentUser.chatRooms = [];
          $scope.currentChatRoom = false;
          $timeout(function () {
            iframe.sendHostMessage("resize", {
              height: $("body").height()
            });
          }, 100);
        }
      );
    }

		$scope.$on('login', function (event, username) {
      $scope.currentUser = AppAuth.currentUser;

      if (username) {
        var top = screen.availHeight/2 - 242;
        var left = screen.availWidth/2 - 410;
        return AppAuth.popupWin = window.open('/widget/auth/','imoglobe','toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=500, height=420, top='+ top +', left='+ left);
      } else if (AppAuth.popupWin) {
        AppAuth.popupWin.close();
      }

      $scope.$watchCollection('currentUser.chatRooms', function () {
        if (AppAuth.currentUser.chatRooms.length) {
          $scope.currentChatRoom = AppAuth.currentUser.chatRooms[0];
        }
      });

      if ($scope.owner.id && $scope.app.id) {
        $scope.getChatRoom();
      } else {
        $q.all([app, owner]).then(function(results) {
          $timeout(function () {
            if ($scope.owner.id && $scope.app.id) {
              $scope.getChatRoom();
            }
          }, 100);
        });
      }
		});

    $scope.openAuth = function (provider) {
      if (provider.length) {
        var top = screen.availHeight/2 - 242;
        var left = screen.availWidth/2 - 410;
        if( !AppAuth.popupWin || AppAuth.popupWin.closed ) {
            AppAuth.popupWin = window.open('/../widget-auth/'+ provider,'imoglobe','toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=800, height=600, top='+ top +', left='+ left);
        } else AppAuth.popupWin.focus();
      } else {
        var top = screen.availHeight/2 - 242;
        var left = screen.availWidth/2 - 410;
        if( !AppAuth.popupWin || AppAuth.popupWin.closed ) {
            AppAuth.popupWin = window.open('/widget/auth/','imoglobe','toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=500, height=420, top='+ top +', left='+ left);
        } else AppAuth.popupWin.focus();
      };
    }

    /*iframe.sendHostMessage("resize", {
        height: $("body").height()
    })*/

    $scope.toggleShowForm = function () {
      $scope.showForm = true;
      setTimeout(function () {
        iframe.sendHostMessage("resize", {
            height: $("body").height()
        })
      });
    }

    $scope.toggleShowRegisterForm = function () {
      $scope.ShowRegisterForm = true;
      setTimeout(function () {
        iframe.sendHostMessage("resize", {
            height: $("body").height()
        })
      });
    }

    $scope.startConversation = function () {
      User.prototype$startConversation({
        id: AppAuth.currentUser.id},
        {
          users: [$scope.owner.id],
          appId: app.id,
          appUrl: $scope.params.t_u,
          event: { 
            type: 'message',
            text: $scope.data.message
          }
        },
        function (res) {
          //$scope.currentChatRoom = res.chatRoom;
          $scope.getChatRoom();
        },
        function () {

        }
      );
    }

    $scope.login = function () {
      $scope.loading = true;

      $scope.loginResult = User.login({include: 'user apps', rememberMe: true}, $scope.formData,
        function() {
          $scope.loading = false;

          AppAuth.currentUser = $scope.loginResult.user;
        },
        function(res) {
          $scope.loading = false;
          $scope.loginError = res.data.error;
        }
      );
    };

    $scope.register = function() {
      $scope.loading = true;

      $scope.user = User.save($scope.formData,
        function () {
          $scope.loading = false;
          $scope.login();
        },
        function (res) {
          $scope.loading = false;
          $scope.registerError = res.data.error;
        }
      );
    };
	}])
  .controller('chatCtrl', ['$scope', 'socket', '$timeout', '$window', 'User', '$q', 'ChatRoom', function ($scope, socket, $timeout, $window, User, $q, ChatRoom) {
    socket.connect();
    $scope.forceScrollReset = true;

    $scope.getChatRoomEvents = function () {
      var deferred = $q.defer();
      if (!$scope.currentChatRoom.loading && $scope.currentChatRoom && !$scope.currentChatRoom.noMore) {
        $scope.currentChatRoom.loading = true;
        var id = $scope.currentChatRoom.id;
        ChatRoom.prototype$__get__event({ id: id,
          filter: {
            where: {
              users: $scope.currentUser.id
            },
            order: 'id DESC',
            skip: $scope.currentChatRoom.events.length,
            limit: 10 }
          }, function (res) {
            var room = $scope.currentUser.chatRooms.filter(function (e) { return e.id === id })[0];
            room.loading = false;

            if (res.length < 10) {
              room.noMore = true;
            }

            if (res.length && !room.events.filter(function (e) { return e.id === res[0].id }).length) {
              [].push.apply( res.reverse(), room.events );
              room.events = res;
            }

            deferred.resolve();
          }, function (err) {
            var room = $scope.currentUser.chatRooms.filter(function (e) { return e.id === id })[0];
            room.loading = false;
        });
      } else {
        deferred.reject();
      }
      return deferred.promise;
    }

    /*$scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
      $timeout(function () {
        if ($scope.currentChatRoom) {
          if (!$scope.currentChatRoom.seen
            || !$scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id }).length
            || $scope.currentChatRoom.events.length && new Date($scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id })[0].date) < new Date(parseInt($scope.currentChatRoom.events[$scope.currentChatRoom.events.length -1].id.toString().slice(0,8), 16)*1000)
            ) {

            $scope.updateSeen();
          }
        }
      });
    });*/

    $scope.$watchCollection('currentChatRoom.events', function (newValue, oldValue) {
      if (!newValue || !oldValue) {
        return;
      }
      
      $timeout(function () {
        var objDiv = document.getElementById("chat");
        if (newValue.length > oldValue.length && (objDiv.style.top === 'auto' || objDiv.scrollTop + objDiv.clientHeight === objDiv.scrollHeight)) {
          if ($scope.currentChatRoom) {
            if (!$scope.currentChatRoom.seen
              || !$scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id }).length
              || new Date($scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id })[0].date) < new Date(parseInt($scope.currentChatRoom.events[$scope.currentChatRoom.events.length -1].id.toString().slice(0,8), 16)*1000)
              ) {

              $scope.updateSeen();
              $scope.$apply();
            }
          }
        }

        $scope.checkSize();
        if (oldValue && oldValue.length < 2
          || $scope.forceScrollReset
          || objDiv.clientHeight + objDiv.scrollTop + 60 >= objDiv.scrollHeight || !newValue[newValue.length -1].sender) {
          
          $timeout(function () {
            objDiv.scrollTop = objDiv.scrollHeight;
          });
          if ($scope.forceScrollReset) {
            $timeout(function () {
              $scope.forceScrollReset = false;
            }, 100);
          }
        }
      }, 0);
    });

    $scope.checkSize = function () {
      var objDiv = document.getElementById("chat");
      if (objDiv.scrollHeight <= objDiv.clientHeight && objDiv.clientHeight <= $('body').innerHeight() - 146) {
        objDiv.style.top = 'auto';

        if (!$scope.currentChatRoom.noMore) {
          $scope.getChatRoomEvents().then(function () {
            $timeout(function () {
              $scope.forceScrollReset = true;
            });
          });
        }
      } else {
        objDiv.style.top = 0;
        $scope.currentChatRoom.initialLoading = true;
      }
    }

    $scope.$watch('currentChatRoom.seen', function (newValue, oldValue) {
      if (!newValue) {
        return;
      }

      for (var i = 0; i < $scope.currentChatRoom.events.length; i++) {
        if ($scope.currentChatRoom.events[i].seen) {
          $scope.currentChatRoom.events[i].seen = null;
        }
      };

      for (var i = 0; i < newValue.length; i++) {
        if (newValue[i].user !== $scope.currentUser.id) {
          var plugged = false;
          for (var y = $scope.currentChatRoom.events.length -1; y >= 0; y--) {
            if (!plugged && new Date(newValue[i].date) > new Date(parseInt($scope.currentChatRoom.events[y].id.toString().slice(0,8), 16)*1000)) {
              if (!$scope.currentChatRoom.events[y].seen) {
                $scope.currentChatRoom.events[y].seen = [newValue[i]];
              } else {
                $scope.currentChatRoom.events[y].seen.push(newValue[i]);
              }
              plugged = true;
            }
          };
        }
      };
    }, true);

    $window.onfocus = function () {
      var objDiv = document.getElementById("chat");

      if (objDiv.style.top === 'auto' || objDiv.scrollTop + objDiv.clientHeight === objDiv.scrollHeight) {
        if ($scope.currentChatRoom) {
          if (!$scope.currentChatRoom.seen
            || !$scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id }).length
            || $scope.currentChatRoom.events.length && new Date($scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id })[0].date) < new Date(parseInt($scope.currentChatRoom.events[$scope.currentChatRoom.events.length -1].id.toString().slice(0,8), 16)*1000)
            ) {

            $scope.updateSeen();
            $scope.$apply();
          }
        }
      }
    }

    $(".home > .view").addClass('chatRoom');

    $scope.$on(
        "$destroy",
        function( event ) {
            $(".home > .view").removeClass('chatRoom');
            $window.onfocus = function () {};
        }
    );

    $scope.updateSeen = function () {
      if (!$scope.currentChatRoom.seen) {
        var seen = {user: $scope.currentUser.id, date: new Date() };
        $scope.currentChatRoom.seen = [seen];
      } else {
        var seen = $scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id });
        if (seen.length) {
          seen = seen[0];
          seen.date = new Date();
        } else {
          var seen = {user: $scope.currentUser.id, date: new Date() };
          $scope.currentChatRoom.seen.push(seen);
        }
      }

      socket.emit('chat', {
          chatRoom: $scope.currentChatRoom.id,
          seen: seen,
          type: 'update:seen'
        });
    }

    $scope.chatBoxFocus = function () {
      console.log('focus');
      //$scope.updateSeen();
    }

    $scope.chatDblClick = function () {
      console.log('dblClick');
    }

    $timeout(function () {
      var objDiv = document.getElementById("chat");
      objDiv.scrollTop = objDiv.scrollHeight;
    });
  }])
  .controller('chatFooterCtrl', ['$scope', 'socket', '$timeout', '$window', 'User', 'ChatRoom', function ($scope, socket, $timeout, $window, User, ChatRoom) {
    $scope.menu = false;
    $scope.menuPhoto = false;
    $scope.menuVideo = false;
    $scope.menuLocation = false;
    $scope.menuAttach = false;

    $scope.sendMessage = function () {
      var _event = {
        chatRoom: $scope.currentChatRoom.id,
        type: 'message',
        text: $scope.currentChatRoom.message.text
      };

      if (!$scope.currentChatRoom.events.length
        ||  Math.floor((new Date() - new Date(parseInt($scope.currentChatRoom.events[$scope.currentChatRoom.events.length -1].id.toString().slice(0,8), 16)*1000)) / 60000) > 60) {
        _event.startSession = true;
      }

      var _id = ObjectId().toString();
      User.events.create({id: $scope.currentUser.id}, _event,
        function (ev) {
          for (var i = 0; i < $scope.currentChatRoom.events.length; i++) {
            if ($scope.currentChatRoom.events[i].id === _id) {
              $scope.currentChatRoom.events[i] = ev;
            }
          };
        }, function (err) {
          console.error(err);
        }
      );
      $timeout(function () {
        _event.id = _id;
        $scope.currentChatRoom.events.push(_event);
        $scope.currentChatRoom.message.text = '';
        $scope.currentChatRoom.message.url = false;
        $("#chatBox").removeClass('expanded');
      }, 0);
    }

    $scope.updateChatBox = function () {
      var result = $.countLines("#chatBox");
      if (result.actual > 1) {
        $("#chatView").addClass('expandedChatBox');

        var objDiv = document.getElementById("chat");
        if (objDiv.scrollHeight <= objDiv.clientHeight && objDiv.clientHeight <= $('body').innerHeight() - 146) {
          objDiv.style.top = 'auto';
        } else {
          objDiv.style.top = 0;
        }

        if (objDiv.clientHeight + objDiv.scrollTop + 16 === objDiv.scrollHeight) {
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      } else {
        $("#chatView").removeClass('expandedChatBox');
      }

      if (!$scope.writting && $scope.currentChatRoom.message.text.length) {
        $scope.writting = true;
        socket.emit('chat', {
          chatRoom: $scope.currentChatRoom.id,
          type: 'update:writting'
        });
      } else if ($scope.writting && !$scope.currentChatRoom.message.text.length) {
        $scope.writting = false;
        socket.emit('chat', {
          chatRoom: $scope.currentChatRoom.id,
          type: 'update:stoppedWritting'
        });
      }
    }

    $scope.clearMessageUrl = function () {
      $scope.currentChatRoom.message.url = false;
    }

    $scope.send = function () {
      if ($scope.currentChatRoom.message.text.length) {
        $scope.sendMessage();
      }
    }

    $scope.chatBoxKeydown = function (e) {
      if (e.which === 13 && !e.shiftKey) {
        $scope.send();
        e.preventDefault();
      } else if (e.which === 13 && e.shiftKey) {
        var result = $.countLines("#chatBox");
        if (result.actual = 1) {
          $("#chatView").addClass('expandedChatBox');
        }
      }
    }
  }]);
