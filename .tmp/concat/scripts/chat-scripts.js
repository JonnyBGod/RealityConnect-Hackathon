function encodeURL(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_');
}
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

moment.locale('en-short', {
    calendar : {
        lastDay : '[Yesterday]',
        sameDay : 'LT',
        nextDay : '[Tomorrow]',
        lastWeek : 'dddd',
        nextWeek : '[Next] dddd',
        sameElse : 'll'
    }
});
'use strict';

angular
  .module('App', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'lbServices',
    'services',
    'notifications',
    'filters',
    'directives',
    'ui.router',
    'angularModalService',
    'pascalprecht.translate', 'angulartics', 'angulartics.google.analytics'
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

  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push(['$q', '$location', '$injector', function($q, $location, $injector) {
      return {
        responseError: function(rejection) {
          if (rejection.status === 401) {
            var state = $injector.get('$state');
            if (!state.get($location.path().split('/')[1]) || !state.get($location.path().split('/')[1]).public) {
              $location.nextAfterLogin = $location.path();
              localStorage['nextAfterLogin'] = $location.nextAfterLogin;
              $location.path('/signin');
            }
          }
          return $q.reject(rejection);
        }
      };
    }]);
  }])

  .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.rule(function($injector, $location) {
      var path = $location.path(),
        // Note: misnomer. This returns a query object, not a search string
        search = $location.search(),
        params
        ;

      // check to see if the path already ends in '/'
      if (path[path.length - 1] === '/') {
        return;
      }

      // If there was no search string / query params, return with a `/`
      if (Object.keys(search).length === 0) {
        return path + '/';
      }

      // Otherwise build the search string and return a `/?` prefix
      params = [];
      angular.forEach(search, function(v, k){
        params.push(k + '=' + v);
      });
      return path + '/?' + params.join('&');
    });

    $urlRouterProvider
      .when('/verify-email', '/signin')
      .when('/verify-email/', '/signin')
      .otherwise('/chat/');

    $stateProvider
      .state('home', {
        url: '/',
        abstract: true,
        views: {
          'mainview': {
            templateUrl: 'views/home.html',
            controller: 'homeCtrl'
          }
        }
      })
      .state('home.rooms', {
        url: '',
        views: {
          'roomsView@home': {
            templateUrl: 'views/home.rooms.html',
            controller: 'roomsCtrl'
          },
          'chatView@home': {
            templateUrl: 'views/home.chat.html'
          }
        }
      })
      .state('signin', {
        url: '/signin/',
        views: {
          'mainview@': {
            templateUrl: 'views/signin.html',
            controller: 'signinCtrl'
          }
        },
        public: true
      })
      .state('signup', {
        url: '/signup/',
        views: {
          'mainview@': {
            templateUrl: 'views/signin.html',
            controller: 'signinCtrl'
          }
        },
        public: true
      })
      .state('verify-email', {
        url: '/verify-email/',
        views: {
          'mainview@': {
            templateUrl: 'views/signin.html',
            controller: 'signinCtrl'
          }
        },
        public: true
      })
      .state('reset-password', {
        url: '/reset-password/{resetPasswordToken}/',
        views: {
          'mainview@': {
            templateUrl: 'views/signin.html',
            controller: 'signinCtrl'
          }
        },
        public: true
      })
      .state('legal', {
        url: '/legal/',
        views: {
          'mainview@': {
            templateUrl: function () {
              //return 'views/legal/' + (locale || 'en') + '.html';
            },
            controller: 'legalCtrl'
          }
        },
        public: true
      })
      .state('newRoom', {
        url: '/newroom/',
        views: {
          'mainview@': {
            templateUrl: 'views/newRoom.html',
            controller: 'newRoomCtrl'
          }
        }
      })
      .state('contacts', {
        url: '/contacts/',
        views: {
          'mainview@': {
            templateUrl: 'views/contacts.html',
            controller: 'contactsCtrl'
          }
        }
      })
      .state('contacts.add', {
        url: 'add/',
        views: {
          'mainview@': {
            templateUrl: 'views/contacts.add.html',
            controller: 'contactsAddCtrl'
          }
        }
      })
      .state('profile', {
        url: '/profile/:id/',
        views: {
          'mainview@': {
            templateUrl: 'views/profile.html',
            controller: 'profileCtrl'
          }
        }
      })
      .state('recover-account', {
        url: '/recover-account/',
        views: {
          'mainview@': {
            templateUrl: 'views/signin.html',
            controller: 'signinCtrl'
          }
        },
        public: true
      })
      .state('deactivated', {
        url: '/deactivated/',
        views: {
          'mainview@': {
            templateUrl: 'views/deactivated.html'
          }
        }
      })
      .state('notfound', {
        url: '/notfound/',
        views: {
          'mainview@': {
            template: '',
            controller: ['$location', 'toaster', '$translate', function ($location, toaster, $translate) {
              toaster.pop('warning', $translate('Ad'), $translate('The Ad you requested does not exist.'));
              return $location.path('/');
              }]
          }
        },
        public: true
      })
      .state('settings', {
        url: '/settings/',
        views: {
          'mainview@': {
            templateUrl: 'views/settings.html',
            controller: 'settingsCtrl'
          }
        }
      })
      .state('home.rooms.chat', {
        url: ':id/',
        views: {
          'chatView@home': {
            templateUrl: 'views/home.chat.html',
            controller: 'chatCtrl'
          }
        }
      })
      .state('home.rooms.chat.details', {
        url: 'details/',
        views: {
          'chatDetailsView@home': {
            templateUrl: 'views/home.chatDetails.html',
            controller: 'chatDetailsCtrl'
          }
        }
      });
  }])
  .run(['$rootScope', '$cookies', '$location', 'AppAuth', '$http', 'User', 'LoopBackAuth', '$notification', function($rootScope, $cookies, $location, AppAuth, $http, User, LoopBackAuth, $notification) {
    $notification.enableHtml5Mode();

    if ($cookies.userId && $cookies.access_token) {
      LoopBackAuth.currentUserId = $cookies.userId || null;
      LoopBackAuth.accessTokenId = $cookies.access_token || '';
      LoopBackAuth.rememberMe = true;
      LoopBackAuth.save();
    }

    delete $cookies.userId;
    delete $cookies.access_token;

    AppAuth.ensureHasCurrentUser(User);

    if (localStorage['nextAfterLogin']) {
      var next = $location.nextAfterLogin || localStorage['nextAfterLogin'] || '/';
      localStorage.removeItem('nextAfterLogin');
      $location.path(next);
    }

    Visibility.change(function (e, state) {
      if (state === 'visible') {
        LoopBackAuth.currentUserId = localStorage['$LoopBack$currentUserId'] || sessionStorage['$LoopBack$currentUserId'] || null;
        LoopBackAuth.accessTokenId = localStorage['$LoopBack$accessTokenId'] || sessionStorage['$LoopBack$accessTokenId'] || null;
        AppAuth.ensureHasCurrentUser(User);
      }
    });
  }]);

angular.module('filters', [])
	.filter('caasTime', function() { 
		return function(id){
			moment.locale('en-short');
	    	return moment(new Date(parseInt(id.toString().slice(0,8), 16)*1000)).calendar();
	    };
	});
'use strict';

// load lbclient via browserify's require
/*var client = (function() {
  //global require:true
  return require('lbclient');
})();*/

angular.module('services', ['lbServices'])
  //.value('Todo', client.models.LocalTodo)
  //.value('RemoteTodo', client.models.Todo)
  //.value('sync', client.sync)
  //.value('network', client.network)

  .factory('AppAuth', ['$location', 'LoopBackAuth', '$window', function($location, LoopBackAuth, $window) {
    return {
      currentUser: {},
      imagesLoading: 0,

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
          console.log(self.currentUser);
          self.currentUser = User.getCurrent(function(response) {
            if (!self.currentUser.queue)
              self.currentUser.queue = {};
            if (!self.currentUser.queueEvents)
              self.currentUser.queueEvents = {};
            // success
            User.prototype$getChatRooms({id: self.currentUser.id},
              function (res) {
                console.log(res);
                self.currentUser.chatRooms = res.chatRooms;
                if (response.username) {
                  $location.path('/signup');
                } else if ($location.path() === '/signin/') {
                  $location.path('/');
                }
              },
              function () {
              }
            );
          }, function(err) {
            if (err.status === 404) {
              return self.logout(User);
            }
          });
        } else {
          $location.path('/signin');
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
  .factory('socket', ['$rootScope', 'LoopBackAuth', 'AppAuth', '$notification', function($rootScope, LoopBackAuth, AppAuth, $notification) {
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
                    if (data[d].type === 'notification:changeName') {
                      AppAuth.currentUser.chatRooms[i].name = data[d].text.substring(data[d].text.indexOf('to: ') + 4, data[d].text.length);
                    } else if (data[d].type === 'notification:removeUser') {
                      for (var y = 0; y < AppAuth.currentUser.chatRooms[i].users.length; y++) {
                        if (AppAuth.currentUser.chatRooms[i].users[y].id === data[d].removedUser) {
                          AppAuth.currentUser.chatRooms[i].users.splice(y, 1);
                        }
                      }
                      if (!AppAuth.currentUser.chatRooms[i].oldUsers) {
                        AppAuth.currentUser.chatRooms[i].oldUsers = [];
                      }
                      AppAuth.currentUser.chatRooms[i].oldUsers.push(data[d].removedUser);
                    } /*else if (data[d].type === 'notification:addUsers') {
                      console.log(data[d]);
                      for (var y = 0; y < data[d].users.length; y++) {
                        if (AppAuth.currentUser.chatRooms[i].users.filter(function (e) { return e.id === data[d].users[y].id }).length) {
                          AppAuth.currentUser.chatRooms[i].users.push(data[d].users[y]);
                        }
                      }
                    }*/

                    AppAuth.currentUser.chatRooms[i].events.push(data[d]);
                    if (!AppAuth.currentUser.chatRooms[i].doNotDisturb && data[d].sender !== AppAuth.currentUser.id) {
                      $notification.notify('custom', '', AppAuth.currentUser.chatRooms[i].users.filter(function (e) { return e.id === data[d].sender })[0].name, data[d].text, AppAuth.currentUser.chatRooms[i].id, 2000);
                    }
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
  }])
  .factory('Utils', function() {
    return {
      groupify : function(source, into) {
        var i, ch;
        for (var i = 0; i < source.length; i++) {
          ch = source[i].name.charAt(0);
          into[ch] || (into[ch] = {
            label: ch,
            contacts: []
          });
          into[ch].contacts.push(source[i]);
        };
      }
    }
  })
  .service('computeSlideStyle', ['DeviceCapabilities', function(DeviceCapabilities) {
        // compute transition transform properties for a given slide and global offset
        return function(absoluteLeft, transitionType) {
            var style = {},
                slideTransformValue = DeviceCapabilities.has3d ? 'translate3d(' + absoluteLeft + 'px, 0, 0)' : 'translate3d(' + absoluteLeft + 'px, 0)';

            if (!DeviceCapabilities.transformProperty) {
                // fallback to default slide if transformProperty is not available
                style['margin-left'] = absoluteLeft + 'px';
            } else {
                style[DeviceCapabilities.transformProperty] = slideTransformValue;
            }
            return style;
        };
    }]);

(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['angular'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        factory(require('angular'));
    } else {
        // Browser globals
        factory(angular);
    }
}(function (angular) {

    var module = angular.module('notifications', []);

    module.provider('$notification', function () {
        var settings = {
            info: {
                duration: 5000,
                enabled: true,
                class: 'info'
            },
            warning: {
                duration: 5000,
                enabled: true,
                class: 'warning'
            },
            error: {
                duration: 5000,
                enabled: true,
                class: 'danger'
            },
            success: {
                duration: 5000,
                enabled: true,
                class: 'success'
            },
            progress: {
                duration: 0,
                enabled: true,
                class: ''
            },
            custom: {
                duration: 35000,
                enabled: true,
                class: ''
            },
            details: true,
            localStorage: false,
            html5Mode: false,
            templateName: 'ng-notification-template'
        };
        this.setSettings = function (s) {
            angular.extend(settings, s);
        };

        function Notification($timeout, $window, s) {
            var settings = s;
            var notifications = JSON.parse(localStorage.getItem('$notifications')) || [],
                queue = [];

            function html5Notify(icon, title, content, ondisplay, onclose, timeout) {
               if (settings.html5Mode == 'moz') {
                if (!icon) {
                  icon = 'favicon.ico';
                }
                try {
                  Notification = $window.Notification || $window.mozNotification;
                  var noti = new Notification(
                    title, {
                      body: content,
                      dir: "auto",
                      lang: "",
                      tag: 'test',
                      icon: icon
                    });
                } catch (err) {
                  settings.html5Mode = false;
                }
              } else if (settings.html5Mode == 'webkit') {
                if ($window.webkitNotifications.checkPermission() === 0) {
                  if (!icon) {
                    icon = 'favicon.ico';
                  }
                  var noti = $window.webkitNotifications.createNotification(icon, title, content);
                  if (typeof ondisplay === 'function') {
                    noti.ondisplay = ondisplay;
                  }
                  if (typeof onclose === 'function') {
                    noti.onclose = onclose;
                  }
                  noti.show();
                }
                else {
                  settings.html5Mode = false;
                }
              }

              if (timeout) {
                $timeout(function() {
                    noti.close()
                }, timeout);
              } else {
                // an "infinite" notification should also pop focus on close.
                // (timeout notification shouldn't, since then $window could
                // take focus w/o user intervention)
                noti.onclose = function() {
                    console.log('close');
                    $window.blur();
                    $timeout($window.focus, 0);
                    this.close();
                };
              }
            }


            return {

                /* ========== SETTINGS RELATED METHODS =============*/

                disableHtml5Mode: function () {
                    settings.html5Mode = false;
                },

                disableType: function (notificationType) {
                    settings[notificationType].enabled = false;
                },

                enableHtml5Mode: function () {
                    // settings.html5Mode = true;
                    settings.html5Mode = this.requestHtml5ModePermissions();
                },

                enableType: function (notificationType) {
                    settings[notificationType].enabled = true;
                },

                getSettings: function () {
                    return settings;
                },

                toggleType: function (notificationType) {
                    settings[notificationType].enabled = !settings[notificationType].enabled;
                },

                toggleHtml5Mode: function () {
                    settings.html5Mode = !settings.html5Mode;
                },

                requestHtml5ModePermissions: function () {
                  if ($window.Notification || $window.mozNotification) {
                    Notification = $window.Notification || $window.mozNotification;
                    Notification.requestPermission(function(perm) {
                      if (perm == 'granted') {
                        settings.html5Mode = 'moz';
                      }
                      else {
                        settings.html5Mode = false;
                      }
                    });
                  } else if ($window.webkitNotifications) {
                    //console.log('notifications are available');
                    if ($window.webkitNotifications.checkPermission() === 0) {
                      return true;
                    }
                    else{
                      $window.webkitNotifications.requestPermission(function() {
                        if ($window.webkitNotifications.checkPermission() === 0) {
                          settings.html5Mode = 'webkit';
                        }
                        else {
                          settings.html5Mode = false;
                        }
                      });
                      return false;
                    }
                  } else {
                    //console.log('notifications are not supported');
                    return false;
                  }
                },


                /* ============ QUERYING RELATED METHODS ============*/

                getAll: function () {
                    // Returns all notifications that are currently stored
                    return notifications;
                },

                getQueue: function () {
                    return queue;
                },

                /* ============== NOTIFICATION METHODS ==============*/

                info: function (title, content, userData, duration) {
                    return this.notify('info', 'info', title, content, userData, duration);
                },

                error: function (title, content, userData, duration) {
                    return this.notify('error', 'error', title, content, userData, duration);
                },

                success: function (title, content, userData, duration) {
                    return this.notify('success', 'success', title, content, userData, duration);
                },

                warning: function (title, content, userData, duration) {
                    return this.notify('warning', 'warning', title, content, userData, duration);
                },

                notify: function (type, icon, title, content, userData, duration) {
                    return this.makeNotification(type, false, icon, title, content, userData, duration);
                },

                makeNotification: function (type, image, icon, title, content, userData, duration) {
                    if (Visibility.state() === 'visible') return;

                    var notification = {
                        'type': type,
                        'image': image,
                        'icon': icon,
                        'title': title,
                        'content': content,
                        'timestamp': +new Date(),
                        'userData': userData,
                        'duration': duration,
                        'class': settings[type].class
                    };
                    notifications.push(notification);

                    if (duration === undefined) {
                        duration = settings[type].duration;
                    }

                    if (settings.html5Mode) {
                        html5Notify(image, title, content, function () {}, function () {

                        }, duration);
                    } else {
                        queue.push(notification);
                        if (duration) {
                          $timeout(function removeFromQueueTimeout() {
                              queue.splice(queue.indexOf(notification), 1);
                          }, duration);
                        }
                    }

                    this.save();
                    return notification;
                },


                /* ============ PERSISTENCE METHODS ============ */

                save: function () {
                    // Save all the notifications into localStorage
                    if (settings.localStorage) {
                        localStorage.setItem('$notifications', JSON.stringify(notifications));
                    }
                },

                restore: function () {
                    // Load all notifications from localStorage
                },

                clear: function () {
                    notifications = [];
                    this.save();
                }
            }
        }

        this.$get = ['$timeout', '$window', '$templateCache',
            function ($timeout, $window, $templateCache) {
                if (!$templateCache.get('ng-notification-template')) {
                    $templateCache.put('ng-notification-template',
                        '<div class="ng-notification-wrapper" ng-repeat="noti in queue">' +
                        '<div class="ng-notification alert alert-{{noti.class}}">' +
                        '<div class="ng-notification-content">' +
                        '<button type="button" class="close" data-dismiss="modal" ng-click="removeNotification(noti)">'+
                        '<span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                        '<span class="title" ng-bind="noti.title"></span>' +
                        '</div>' +
                        '</div>' +
                        '</div>'
                    );
                }
                return new Notification($timeout, $window, settings);
            }
        ];
    })

    module.directive('notifications', ['$notification', '$compile', '$templateCache',
        function ($notification, $compile, $templateCache) {
            /**
             *
             * It should also parse the arguments passed to it that specify
             * its position on the screen like "bottom right" and apply those
             * positions as a class to the container element
             *
             * Finally, the directive should have its own controller for
             * handling all of the notifications from the notification service
             */
            function link(scope, element, attrs) {
                var position = attrs.notifications;
                position = position.split(' ');
                element.addClass('ng-notification-container');
                for (var i = 0; i < position.length; i++) {
                    element.addClass(position[i]);
                }
            }


            return {
                restrict: 'A',
                scope: {},
                template: $templateCache.get($notification.getSettings().templateName),
                link: link,
                controller: ['$scope',
                    function NotificationsCtrl($scope) {
                        $scope.queue = $notification.getQueue();

                        $scope.removeNotification = function (noti) {
                            $scope.queue.splice($scope.queue.indexOf(noti), 1);
                        };
                    }
                ]

            };
        }
    ]);

    return module;

}));
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
	    		return elm.attr('src', user.photo || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iMTQwIj48cmVjdCB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjcwIiB5PSI3MCIgc3R5bGU9ImZpbGw6I2FhYTtmb250LXdlaWdodDpib2xkO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtZmFtaWx5OkFyaWFsLEhlbHZldGljYSxzYW5zLXNlcmlmO2RvbWluYW50LWJhc2VsaW5lOmNlbnRyYWwiPjE0MHgxNDA8L3RleHQ+PC9zdmc+');
		    }
	    };
	})
	.directive('imgLoaded', function() {
	    return {
	    	scope: true,
	    	compile: function() {
		        return  {
		          	post: function(scope, elm, attrs) {
		          		if (!scope.currentChatRoom.initialLoading) {
		          			var obj = document.getElementById("chat");
				    		elm.imagesLoaded()
							  .always( function( instance ) {
							    //console.log('all images loaded');
							    obj.scrollTop = obj.scrollHeight;
							  })
							  .done( function( instance ) {
							    //console.log('all images successfully loaded');
							  })
							  .fail( function() {
							    //console.log('all images loaded, at least one is broken');
							  });
						}
	    			}
	    		}
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
	})
	.directive('backAnimation', ['$browser', '$location', function($browser, $location) {
		return {
			link: function(scope, elm) {

				$browser.onUrlChange(function(newUrl) {
					if ($location.absUrl() === newUrl) {
						elm.addClass('reverse');
					}
				});

				scope.__childrenCount = 0;
				scope.$watch(function() {
					scope.__childrenCount = elm.children().length;
				});

				scope.$watch('__childrenCount', function(newCount, oldCount) {
					if (newCount !== oldCount && newCount === 1) {
						elm.removeClass('reverse');
					}
				});
			}
		};
	}]);

'use strict';

angular.module('App')
	.controller('navigationCtrl', ['$scope', 'AppAuth', 'User', function ($scope, AppAuth, User) {
    $scope.toggleMenu = function (e) {
      $(".navigation").toggleClass('open');
      e.stopPropagation();
    }

    $scope.logout = function () {
      AppAuth.logout(User);
    };

    $scope.stopPropagation = function (e) {
      e.stopPropagation();
    }
  }])
  .controller('headerCtrl', ['$scope', '$location', '$window', 'ChatRoom', function ($scope, $location, $window, ChatRoom) {
    $scope.details = false;
    $scope.loading = false;
    $scope.from = '/_chat/';

    if ($location.path().indexOf('details') != -1) {
      $scope.details = true;
    }

    $scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
      if (to.name.indexOf('details') !== -1) {
        $scope.details = true;
      } else {
        $scope.details = false;
      }
    });

    $scope.goBack = function() {
      $window.history.back();
    }

    $scope.toggleMenu = function (e) {
      $(".navigation").toggleClass('open');
      e.stopPropagation();
    }

    $scope.toggleEditName = function () {
      if ($scope.currentChatRoom.appPage || !$scope.isActiveUser()) return;

      $scope.editingName = !$scope.editingName;
      $scope.currentChatRoom.newChatRoomName = $scope.currentChatRoom.name ? angular.copy($scope.currentChatRoom.name) : '';
    }

    $scope.editNameKeydown = function (e) {
      if (e.which === 13) {
        e.preventDefault();
        console.log($scope.currentChatRoom.newChatRoomName);
        if ($scope.currentChatRoom.newChatRoomName !== $scope.currentChatRoom.name) {
          ChatRoom.prototype$changeName({ id: $scope.currentChatRoom.id }, {
            name: $scope.currentChatRoom.newChatRoomName
          }, function (res) {
            console.log(res);
          }, function (err) {
            console.log(err);
          });
        }

        $scope.toggleEditName();
      }
    }

    $(".content").removeClass('reverse');
  }])
	.controller('homeCtrl', ['$scope', 'AppAuth', '$state', 'socket', 'ChatRoom', '$q', '$window', '$location', function ($scope, AppAuth, $state, socket, ChatRoom, $q, $window, $location) {
		$scope.currentUser = AppAuth.currentUser;
		$scope.currentChatRoom = false;
    $scope.roomList = 'personal';
    $scope.windowWidth = $window.innerWidth;

    $scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
      $scope.windowWidth = $window.innerWidth;

      if ($scope.currentUser && $scope.currentUser.chatRooms && $scope.currentUser.chatRooms.length) {
        $scope.currentChatRoom = $scope.currentUser.chatRooms.filter(function (e) { return e.id === toParams.id })[0];
        if ($scope.currentChatRoom && !$scope.currentChatRoom.imagesLoading)
          $scope.currentChatRoom.imagesLoading = 0;

        if (to.name.indexOf('home.rooms.chat') !== -1 && !$scope.currentChatRoom) {
          return $location.path('/');
        }

        if ($scope.currentChatRoom && !$scope.currentChatRoom.message)
          $scope.currentChatRoom.message = {
            text: '',
            url: false
          };

        if ($scope.currentChatRoom && $scope.currentChatRoom.events.length < 2) {
          $scope.getChatRoomEvents();
        }
      } else {
        $scope.currentChatRoom = false;
      }
    });

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

    $window.onresize = function () {
      $scope.windowWidth = $window.innerWidth;
      var objDiv = document.getElementById("chat");

      if (objDiv.scrollHeight <= objDiv.clientHeight && objDiv.clientHeight <= $('body').innerHeight() - 40) {
        objDiv.style.top = 'auto';
      } else {
        objDiv.style.top = 0;
      }
      $scope.$apply();
    };

    $scope.setup = function () {
      socket.connect();

      if ($state.params && $scope.currentUser && $scope.currentUser.chatRooms && $scope.currentUser.chatRooms.length) {
        $scope.currentChatRoom = $scope.currentUser.chatRooms.filter(function (e) { return e.id === $state.params.id })[0];
        if ($scope.currentChatRoom && !$scope.currentChatRoom.imagesLoading)
          $scope.currentChatRoom.imagesLoading = 0;

        if ($scope.currentChatRoom && $scope.currentChatRoom.events && $scope.currentChatRoom.events.length < 2) {
          $scope.getChatRoomEvents();
        }

        if ($scope.currentChatRoom && $scope.currentChatRoom.appPageId) {
          $scope.roomList = 'business';
        }
      } else if ($state.current.name.indexOf('home.rooms.chat') !== -1 && !$scope.currentChatRoom) {
        return $location.path('/');
      }

      $scope.$watchCollection('currentUser.chatRooms', function () {
        $scope.currentUser = AppAuth.currentUser;
        if ($state.params && $scope.currentUser && $scope.currentUser.chatRooms && $scope.currentUser.chatRooms.length) {
          $scope.currentChatRoom = $scope.currentUser.chatRooms.filter(function (e) { return e.id === $state.params.id })[0];
          if ($scope.currentChatRoom && !$scope.currentChatRoom.imagesLoading)
            $scope.currentChatRoom.imagesLoading = 0;

          if ($state.current.name.indexOf('home.rooms.chat') !== -1 && !$scope.currentChatRoom) {
            $location.path('/');
          }

          if ($scope.currentChatRoom && !$scope.currentChatRoom.message)
            $scope.currentChatRoom.message = {
              text: '',
              url: false
            };

          $scope.currentUser.chatRooms.sort(function (a, b) {
            if (a.events.length) {
              a = a.events[a.events.length -1];
            }

            if (b.events.length) {
              b = b.events[b.events.length -1];
            }

            return new Date(parseInt(b.id.toString().slice(0,8), 16)*1000) - new Date(parseInt(a.id.toString().slice(0,8), 16)*1000);
          });
        }
      });
    };

    $scope.isActiveUser = function () {
      return $scope.currentUser && $scope.currentChatRoom && $scope.currentChatRoom.users.filter(function (e) { return e.id === $scope.currentUser.id }).length;
    }

    if ($scope.currentUser && $scope.currentUser.id) {
      $scope.setup();
    } else {
      var listener = $scope.$watch('currentUser', function () {
        if ($scope.currentUser && $scope.currentUser.id && $scope.currentUser.chatRooms && !socket.socket) {
          $scope.setup();
          listener();
        }
      }, true);
    }
	}])
	.controller('roomsCtrl', ['$scope', '$location', function ($scope, $location) {
    
    $scope.openChatRoom = function () {
      $location.path('/'+ this.chatRoom.id);
    }

    $scope.changeRoomList = function (room) {
       $scope.roomList = room;
       $scope.searchFilter = "";
    }

    $scope.checkUnseen = function () {
      if (this.chatRoom.events.length && this.chatRoom.events[this.chatRoom.events.length -1].sender !== $scope.currentUser.id) {
        return new Date(this.chatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id })[0].date) < new Date(parseInt(this.chatRoom.events[this.chatRoom.events.length -1].id.toString().slice(0,8), 16)*1000);
      } else {
        return false;
      }
    }
	}])
	.controller('chatCtrl', ['$scope', 'socket', '$timeout', '$window', 'User', function ($scope, socket, $timeout, $window, User) {
    $scope.forceScrollReset = true;

    $scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
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
    });

    $scope.$watchCollection('currentChatRoom.events', function (newValue, oldValue) {
      /*if (!newValue) {
        return;
      }

      if (!$scope.currentChatRoom.seen
        || !$scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id }).length
        || (newValue.id !== oldValue.id && new Date($scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id })[0].date) < new Date(parseInt($scope.currentChatRoom.events[$scope.currentChatRoom.events.length -1].id.toString().slice(0,8), 16)*1000))
        ) {

        $scope.updateSeen();
      }*/

      /*if (!newValue || newValue.id !== oldValue.id) {
        if ($scope.currentChatRoom && $scope.currentChatRoom.queue)
          $scope.currentChatRoom.queue.length = 0;
      }*/

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

      if (objDiv.scrollHeight <= objDiv.clientHeight && objDiv.clientHeight <= $('body').innerHeight() - 40) {
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
        if (objDiv.scrollHeight <= objDiv.clientHeight && objDiv.clientHeight <= $('body').innerHeight() - 40) {
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

      if (!$scope.currentChatRoom.message.url) {
        $scope.currentChatRoom.message.url = $scope.currentChatRoom.message.text.match(/((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi);
        
        if ($scope.currentChatRoom.message.url) {
          $scope.currentChatRoom.message.url = $scope.currentChatRoom.message.url[0];
          User.prototype$getParseUrl({id: $scope.currentUser.id, url: $scope.currentChatRoom.message.url},
            function (res) {
              if (res.site_name || res.image) {
                $scope.currentChatRoom.message.url = res;
              } else {
                $scope.currentChatRoom.message.url = false;
              }
            },
            function (err) {
              console.log(err);
              $scope.currentChatRoom.message.url = false;
            }
          );
        }
      }
    }

    $scope.clearMessageUrl = function () {
      $scope.currentChatRoom.message.url = false;
    }

    $scope.send = function () {
      if ($scope.currentChatRoom.message.text.length || $scope.currentChatRoom.message.url || $scope.currentChatRoom.queue) {
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
  }])
	.controller('chatDetailsCtrl', ['$scope', 'User', '$timeout', 'ChatRoom', 'ModalService', function ($scope, User, $timeout, ChatRoom, ModalService) {
		$(".home > .view").addClass('details');

		$scope.$on(
        "$destroy",
        function( event ) {
            $(".home > .view").removeClass('details');
        }
    );

    $scope.menuLocation = false;

    $scope.doNotDisturb = function () {
      ChatRoom.update({ 
        where: { id: $scope.currentChatRoom.id }
      }, {
        doNotDisturb: $scope.currentChatRoom.doNotDisturb
      }, function () {

      }, function (err) {
        if (err) console.error(err);
      });
    }

    $scope.leaveConversation = function () {
      $scope.menuLeaveConversation = !$scope.menuLeaveConversation;
    }

    $scope.leaveChatRoom = function () {
      ChatRoom.prototype$removeUser({ 
        id: $scope.currentChatRoom.id,
        userId: $scope.currentUser.id
      }, function (res) {
        for (var i = 0; i < $scope.currentUser.chatRooms.length; i++) {
          if ($scope.currentUser.chatRooms[i].id === $scope.currentChatRoom.id) {
            $scope.currentUser.chatRooms.splice(i, 1);
          }
        }
        $location.path('/');
      }, function (err) {
        if (err) console.error(err);
      });
    }

    $scope.removeFromChatRoom = function () {
      var self = this;
      ChatRoom.prototype$removeUser({ 
        id: $scope.currentChatRoom.id,
        userId: self.$parent.user.id
      }, function (res) {
        for (var i = 0; i < $scope.currentChatRoom.users.length; i++) {
          if ($scope.currentChatRoom.users[i].id === self.$parent.user.id) {
            $scope.currentChatRoom.users.splice(i, 1);
          }
        }
      }, function (err) {
        if (err) console.error(err);
      });
    }

    $scope.addContact = function (id) {
      ModalService.showModal({
        templateUrl: "views/home.addContact.html",
        controller: "addContactCtrl",
        appendElement: angular.element('.hoverview')
      }).then(function(modal) {

      });
    }
	}]);

'use strict';

angular.module('App')
  	.controller('signinCtrl', ['$scope', '$state', '$stateParams', '$location', 'User', 'AppAuth', 'LoopBackAuth', function ($scope, $state, $stateParams, $location, User, AppAuth, LoopBackAuth) {
    	$scope.err = false;
        $scope.success = false;
        $scope.loading = false;

        $scope.formData = {}; 
        $scope.currentUser = AppAuth.currentUser;
        $scope.showForm = $state.current.name;

        if ($scope.currentUser.username && $state.current.name === 'signup') {
        	$scope.formData.email = $scope.currentUser.email;
        	$scope.formData.name = $scope.currentUser.name;
        }

        if ($stateParams.resetPasswordToken) {
        	//$scope.formData.password = $stateParams.resetPasswordToken;
        	LoopBackAuth.accessTokenId = $stateParams.resetPasswordToken;
			LoopBackAuth.save();
        }

        $scope.login = function () {
            $scope.loading = true;

            if ($scope.currentUser.username) {
            	$scope.loginResult = User.link({rememberMe: true}, $scope.formData,
					function() {
						$scope.loading = false;
						var next = $location.nextAfterLogin || localStorage['nextAfterLogin'] || '/';
						$location.nextAfterLogin = null;
						localStorage.removeItem('nextAfterLogin');

						AppAuth.ensureHasCurrentUser(User);
						$location.path(next);
					},
					function(res) {
						$scope.loading = false;
						$scope.loginError = res.data.error;
					}
				);
            } else {
            	$scope.loginResult = User.login({rememberMe: true}, $scope.formData,
					function() {
						$scope.loading = false;
						var next = $location.nextAfterLogin || localStorage['nextAfterLogin'] || '/';
						$location.nextAfterLogin = null;
						localStorage.removeItem('nextAfterLogin');

						AppAuth.ensureHasCurrentUser(User);
						$location.path(next);
					},
					function(res) {
						$scope.loading = false;
						$scope.loginError = res.data.error;
					}
				);
            }
        };

        $scope.register = function() {
        	$scope.loading = true;
        	
        	if ($scope.currentUser.username) {
        		$scope.user = User.createAndLink($scope.formData,
					function () {
						$scope.loading = false;
						$scope.login();
					},
					function (res) {
						$scope.loading = false;
						$scope.registerError = res.data.error;
					}
				);
        	} else {
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
        	}
		};

		$scope.resetPassword = function () {
        	$scope.loading = true;

            if ($scope.currentUser.name) {

            } else {
            	User.upsert({password: $scope.formData.password},
					function(res) {
						$scope.loading = false;
						console.log(res);
					},
					function(res) {
						$scope.loading = false;
						console.log(res);
						$scope.loginError = res.data.error;
					}
				);
            }
        };

        $scope.recover = function () {
            $scope.loading = true;

            User.resetPassword($scope.formData,
				function(res) {
					$scope.loading = false;
					console.log(res);
				},
				function(res) {
					$scope.loading = false;
					console.log(res);
					$scope.loginError = res.data.error;
				}
			);
            
        };

  	}]);

'use strict';

angular.module('App')
	.controller('contactsCtrl', ['$scope', 'User', '$location', '$window', 'AppAuth', 'Utils', function ($scope, User, $location, $window, AppAuth, Utils) {
		$scope.currentUser = AppAuth.currentUser;
		$scope.contacts = [];
		$scope.groups = {};
		$scope._setup = false;

		$scope.setup = function () {
			$scope._setup = true;
			User.prototype$findContacts({id: AppAuth.currentUser.id},
              function (res) {
                $scope.contacts = res;
                $scope.groups = {};
                Utils.groupify($scope.contacts, $scope.groups);
              },
              function () {
              }
            );
        };

		if ($scope.currentUser && $scope.currentUser.id) {
			$scope.setup();
		} else {
			$scope.$watch('currentUser', function () {
				if (!$scope._setup && $scope.currentUser && $scope.currentUser.id) {
					$scope.setup();
				}
			}, true);
		}

		$scope.openProfile = function () {
	      $location.path('/profile/'+ this.contact.id);
	    }
  	}])
  	.controller('contactsAddCtrl', ['$scope', 'User', '$location', '$window', 'AppAuth', '$timeout', function ($scope, User, $location, $window, AppAuth, $timeout) {
  		$scope.searchString = '';
  		$scope.people = [];
  		$scope.loading = false;

		$scope.searchPeople = function () {
			if (!$scope.loading && $scope.searchString.length > 4) {

				$timeout.cancel($scope.timer);

				$scope.timer = $timeout(function() {
					$scope.loading = true;

					User.find({filter: {where: {or: [
				      //{phone: $scope.searchString},
				      {email: $scope.searchString}
				    ]}}},
		              function (res) {
		              	$scope.loading = false;
		              	$scope.people = res;
		              },
		              function () {
		              	$scope.loading = false;
		              }
		            );
				}, 500);
			}
        };

        $scope.openProfile = function () {
	      $location.path('/profile/'+ this.person.id);
	    }

	    $scope.$on(
	        "$destroy",
	        function( event ) {
	            $timeout.cancel($scope.timer);
	        }
	    );
  	}])
  	.controller('contactsAddFacebookCtrl', ['$scope', 'User', '$location', '$window', 'AppAuth', function ($scope, User, $location, $window, AppAuth) {

		$scope.setup = function () {
			User.prototype$facebookContacts({id: AppAuth.currentUser.id},
              function (res) {
                AppAuth.currentUser.contacts = res;
                console.log(res);
              },
              function () {
              }
            );
        };

		if ($scope.currentUser && $scope.currentUser.id) {
			$scope.setup();
		} else {
			$scope.$watch('currentUser.chatRooms', function () {
				if ($scope.currentUser && $scope.currentUser.id) {
					if (!$scope.currentUser.contacts || !$scope.currentUser.contacts.length) {
						$scope.setup();
					}
				}
			});
		}

  	}])
  	.controller('contactsAddGoogleCtrl', ['$scope', 'User', '$location', '$window', 'AppAuth', function ($scope, User, $location, $window, AppAuth) {

  	}])
  	.controller('newRoomCtrl', ['$scope', 'User', '$location', '$window', 'AppAuth', 'Utils', function ($scope, User, $location, $window, AppAuth, Utils) {
		$scope.currentUser = AppAuth.currentUser;
		$scope.contacts = [];
		$scope.groups = {};
		$scope._setup = false;
		$scope.selectedContacts = [];

		$scope.setup = function () {
			$scope._setup = true;
			User.prototype$findContacts({id: AppAuth.currentUser.id},
              function (res) {
                $scope.contacts = res;
                $scope.groups = {};
                Utils.groupify($scope.contacts, $scope.groups);
              },
              function () {
              }
            );
        };

		if ($scope.currentUser && $scope.currentUser.id) {
			$scope.setup();
		} else {
			$scope.$watch('currentUser', function () {
				if (!$scope._setup && $scope.currentUser && $scope.currentUser.id) {
					$scope.setup();
				}
			}, true);
		}

		$scope.toggleContact = function () {
			if ($scope.selectedContacts.indexOf(this.contact) === -1) {
				$scope.selectedContacts.push(this.contact);
			} else {
				$scope.selectedContacts.splice($scope.selectedContacts.indexOf(this.contact), 1);
			}
	    }

	    $scope.createRoom = function () {
	    	if (!$scope.selectedContacts.length) return;

	    	var users = [AppAuth.currentUser.id];

	    	for (var i = 0; i < $scope.selectedContacts.length; i++) {
	    		users.push($scope.selectedContacts[i].id);
	    	};

			User.prototype$createChatRoom({id: AppAuth.currentUser.id}, {users: users},
				function (res) {
					if (res.chatRooms) {
						AppAuth.currentUser.chatRooms.push(res.chatRooms);
						$location.path('/'+ res.chatRooms.id);
					} else {
						$location.path('/'+ res.id);
					}
				}, function () {
				});
		}
  	}]);
'use strict';

angular.module('App')
	.controller('profileCtrl', ['$scope', 'User', '$stateParams', 'AppAuth', '$location', function ($scope, User, $stateParams, AppAuth, $location) {
		$scope.currentUser = AppAuth.currentUser;

		$scope.setup = function () {
			User.findById({id: $stateParams.id},
        function (res) {
        	$scope.profile = res;
          console.log(res);
        },
        function () {
        }
      );
    };

		if ($scope.currentUser && $scope.currentUser.id) {
			$scope.setup();
		} else {
			$scope.$watch('currentUser', function () {
				if (!$scope.profile && $scope.currentUser && $scope.currentUser.id) {
					$scope.setup();
				}
			}, true);
		}

		$scope.addContact = function () {
			User.prototype$createContact({id: AppAuth.currentUser.id}, {contactId: $scope.profile.id},
        function (res) {
          $scope.currentUser.contacts = AppAuth.currentUser.contacts = res;
        },
        function () {
        }
      );
		}

		$scope.message = function () {
			User.prototype$createChatRoom({id: AppAuth.currentUser.id}, {users: [AppAuth.currentUser.id, $scope.profile.id]},
        function (res) {
          if (res.chatRooms) {
          	AppAuth.currentUser.chatRooms.push(res.chatRooms);
          	$location.path('/'+ res.chatRooms.id);
          } else {
          	$location.path('/'+ res.id);
          }
        },
        function () {
        }
      );
		}
  }]);
'use strict';

angular.module('App')
	.controller('settingsCtrl', ['$scope', '$window', function ($scope, $window) {
		$scope.goBack = function() {
	      $window.history.back();
	    }
  	}]);
'use strict';

angular.module('App')
  .controller('addContactCtrl', ['$scope', 'User', 'ChatRoom', '$window', 'AppAuth', 'Utils', '$stateParams', 'close', function ($scope, User, ChatRoom, $window, AppAuth, Utils, $stateParams, close) {
    $scope.currentUser = AppAuth.currentUser;
    $scope.currentChatRoom = $scope.currentUser.chatRooms.filter(function (e) { return e.id === $stateParams.id })[0];
    $scope.contacts = [];
    $scope.groups = {};
    $scope._setup = false;
    $scope.selectedContacts = [];

    $scope.$on(
        "$destroy",
        function( event ) {
            $(".hoverview").html('');
            $(".hoverview").css('display', 'none');
        }
    );

    $scope.close = function(result) {
      close(result, 200);
    }

    $scope.setup = function () {
      $scope._setup = true;
      User.prototype$findContacts({id: AppAuth.currentUser.id},
              function (res) {
                $scope.contacts = res;
                $scope.groups = {};
                Utils.groupify($scope.contacts, $scope.groups);

                for (var i = 0; i < $scope.contacts.length; i++) {
                  if ($scope.currentChatRoom.users.filter(function (e) { return e.id === $scope.contacts[i].id}).length) {
                    $scope.selectedContacts.push($scope.contacts[i]);
                  } 
                }
              },
              function () {
              }
            );
        };

    if ($scope.currentUser && $scope.currentUser.id) {
      $scope.setup();
    } else {
      $scope.$watch('currentUser', function () {
        if (!$scope._setup && $scope.currentUser && $scope.currentUser.id) {
          $scope.setup();
        }
      }, true);
    }

    $scope.toggleContact = function () {
      var self = this;
      if ($scope.currentChatRoom.users.filter(function (e) { return e.id === self.contact.id}).length) return;

      if ($scope.selectedContacts.indexOf(self.contact) === -1) {
        $scope.selectedContacts.push(self.contact);
      } else {
        $scope.selectedContacts.splice($scope.selectedContacts.indexOf(self.contact), 1);
      }
    }

    $scope.createRoom = function () {
      if ($scope.selectedContacts.length <= $scope.currentChatRoom.users.length-1) return $scope.close();

      var users = [];

      for (var i = 0; i < $scope.selectedContacts.length; i++) {
        if (!$scope.currentChatRoom.users.filter(function (e) { return e.id === $scope.selectedContacts[i].id}).length) {
          users.push($scope.selectedContacts[i].id);
        }
      };

      ChatRoom.prototype$addUsers({ id: $scope.currentChatRoom.id }, {
        users: users
      }, function (res) {
        for (var i = 0; i < res.length; i++) {
          if (!$scope.currentChatRoom.users.filter(function (e) { return e.id === res[i].id }).length) {
            $scope.currentChatRoom.users.push(res[i]);
          }
        };
        $scope.close();
      }, function (err) {
        if (err) console.error(err);
      });
    }

    $(".hoverview").css('display', 'block');
  }]);