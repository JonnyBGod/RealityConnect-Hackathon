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
    'ui.router',
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
            if (!state.get($location.path().split('/')[1]).public && $location.path().split('/')[1] !== '') {
              $location.nextAfterLogin = $location.path();
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
      .otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        views: {
          'mainview': {
            templateUrl: '/views/home.html',
            controller: 'homeCtrl'
          }
        },
        public: true
      })
      .state('signin', {
        url: '/signin/',
        views: {
          'mainview@': {
            templateUrl: '/views/signin.html',
            controller: 'signinCtrl'
          }
        },
        public: true
      })
      .state('signup', {
        url: '/signup/',
        views: {
          'mainview@': {
            templateUrl: '/views/signin.html',
            controller: 'signinCtrl'
          }
        },
        public: true
      })
      .state('verify-email', {
        url: '/verify-email/',
        views: {
          'mainview@': {
            templateUrl: '/views/signin.html',
            controller: 'signinCtrl'
          }
        },
        public: true
      })
      .state('reset-password', {
        url: '/reset-password/{resetPasswordToken}/',
        views: {
          'mainview@': {
            templateUrl: '/views/signin.html',
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
              //return '/views/legal/' + (locale || 'en') + '.html';
            },
            controller: 'legalCtrl'
          }
        },
        public: true
      })
      .state('account', {
        url: '/account/',
        views: {
          'mainview@': {
            templateUrl: '/views/account.html',
            controller: 'accountCtrl'
          }
        }
      })
      .state('apps', {
        url: '/apps/',
        views: {
          'mainview@': {
            templateUrl: '/views/apps.html',
            controller: 'appsCtrl'
          }
        }
      })
      .state('apps.app', {
        url: '{app}/',
        abstract: true,
        views: {
          'mainview@': {
            templateUrl: '/views/apps.html',
            controller: 'appsCtrl'
          }
        }
      })
      .state('apps.app.analytics', {
        url: '',
        views: {
          'nestedview@apps.app': {
            templateUrl: '/views/apps.analytics.html',
            controller: 'appsAnalyticsCtrl'
          }
        }
      })
      .state('apps.app.settings', {
        url: 'settings/',
        abstract: true,
        views: {
          'nestedview@apps.app': {
            templateUrl: '/views/apps.settings.html'
          }
        }
      })
      .state('apps.app.settings.general', {
        url: '',
        views: {
          'nestednestedview@apps.app.settings': {
            templateUrl: '/views/apps.settings.general.html',
            controller: 'appsSettingsGeneralCtrl'
          }
        }
      })
      .state('apps.app.settings.advanced', {
        url: 'advanced/',
        views: {
          'nestednestedview@apps.app.settings': {
            templateUrl: '/views/apps.settings.advanced.html',
            controller: 'appsSettingsAdvancedCtrl'
          }
        }
      })
      .state('apps.app.settings.install', {
        url: 'install/',
        views: {
          'nestednestedview@apps.app.settings': {
            templateUrl: '/views/apps.settings.install.html',
            controller: 'appsSettingsInstallCtrl'
          }
        }
      })
      .state('newapp', {
        url: '/newapp/',
        views: {
          'mainview@': {
            templateUrl: '/views/newapp.html',
            controller: 'newappCtrl'
          }
        }
      })
      .state('recover-account', {
        url: '/recover-account/',
        views: {
          'mainview@': {
            templateUrl: '/views/signin.html',
            controller: 'signinCtrl'
          }
        },
        public: true
      })
      .state('deactivated', {
        url: '/deactivated/',
        views: {
          'mainview@': {
            templateUrl: '/views/deactivated.html'
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
      });
  }])

  .run(['$rootScope', '$cookies', '$location', 'AppAuth', '$http', 'User', 'LoopBackAuth', function($rootScope, $cookies, $location, AppAuth, $http, User, LoopBackAuth) {
      if ($cookies.userId && $cookies.access_token) {
          LoopBackAuth.currentUserId = $cookies.userId || null;
          LoopBackAuth.accessTokenId = $cookies.access_token || '';
          LoopBackAuth.rememberMe = true;
          LoopBackAuth.save();
      }

      delete $cookies.userId;
      delete $cookies.access_token;

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
        if (this.currentUser.id) {
          if (!LoopBackAuth.currentUserId || !LoopBackAuth.accessTokenId) {
            return this.logout(User);
          }
        } else if (LoopBackAuth.currentUserId && LoopBackAuth.accessTokenId) {
          var self = this;
          self.currentUser = User.getCurrent(function(response) {
            // success
            User.apps({id: self.currentUser.id}, 
              function (res) {
                self.currentUser.apps = res;
                if (response.username) {
                  $location.path('/signup');
                } else {
                  $rootScope.$broadcast('login');
                }
              },
              function () {
              }
            ); 
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
  }]);
'use strict';

angular.module('App')
	.controller('headerCtrl', ['$scope', 'User', '$location', 'AppAuth', function ($scope, User, $location, AppAuth) {
		$scope.currentUser = AppAuth.currentUser;

		$scope.logout = function () {
			AppAuth.logout(User);
		};

		$scope.$on('login', function () {
			$scope.currentUser = AppAuth.currentUser;
		});
  	}])
  	.controller('homeCtrl', ['$scope', function ($scope) {
		$scope.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];
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
            	$scope.loginResult = User.link({rememberMe: false}, $scope.formData,
					function() {
						$scope.loading = false;
						var next = $location.nextAfterLogin || '/';
						$location.nextAfterLogin = null;
						
						AppAuth.ensureHasCurrentUser(User);
						$location.path(next);
					},
					function(res) {
						$scope.loading = false;
						$scope.loginError = res.data.error;
					}
				);
            } else {
            	$scope.loginResult = User.login({rememberMe: false}, $scope.formData,
					function() {
						$scope.loading = false;
						var next = $location.nextAfterLogin || '/';
						$location.nextAfterLogin = null;
						
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
	.controller('accountCtrl', ['$scope', 'User', '$location', 'AppAuth', function ($scope, User, $location, AppAuth) {
		if (!AppAuth.currentUser && !AppAuth.currentUser.name) {
			return $location.replace('/signin');
		}
		$scope.formPass = {}; 
		$scope.currentUser = AppAuth.currentUser;

		$scope.switchDeactivateAccount = function() {
			$scope.openDeactivateAccount = $scope.openDeactivateAccount? false : true;
		};

		$scope.submit = function (type) {
			switch (type) {
				case "changepassword":
					User.prototype$updateAttributes({id: $scope.currentUser.id}, {password: $scope.formPass.newPassword});
					AppAuth.logout(User);
					break;
				case "deactivateaccount":
					User.deleteById({id: $scope.currentUser.id});
					$location.path('/home');
					break;
				case "changeSocialShare":
					console.log($scope.formSocial);
					//User.prototype$updateAttributes({id: $scope.currentUser.id}, {name:$scope.currentUser.name});
					break;
				default:
					User.prototype$updateAttributes({id: $scope.currentUser.id}, {name:$scope.currentUser.name});
			}
		}
	}]);
'use strict';

angular.module('App')
	.controller('appsCtrl', ['$scope', '$state', '$location', '$stateParams', 'AppAuth', function ($scope, $state, $location, $stateParams, AppAuth) {
		$scope.currentUser = AppAuth.currentUser;

		$scope.setup = function () {
			if (!$stateParams.app) {
	        	if (!$scope.currentUser.apps.length) {
	        		return $location.path('/newapp/');
	        	} else {
	        		return $location.path('/apps/'+ $scope.currentUser.apps[0].id +'/');
	        	}
	        } else {
	        	$scope.currentApp = $scope.currentUser.apps.filter(function(e) { return e.id === $stateParams.app; })[0];
	        	if (!$scope.currentApp) {
	        		return $location.path('/newapp/');
	        	}
	        }
		};

		if ($scope.currentUser && $scope.currentUser.id && $scope.currentUser.apps) {
			$scope.setup();
		} else {
			$scope.$watch('currentUser.apps', function () {
				if ($scope.currentUser && $scope.currentUser.id && $scope.currentUser.apps) {
					$scope.setup();
				}
			});
		}
  	}])
  	.controller('newappCtrl', ['$scope', '$location', 'User', 'AppAuth', function ($scope, $location, User, AppAuth) {
  		$scope.formData = {};

  		$scope.createSite = function () {

  			User.apps.create({id: AppAuth.currentUser.id}, $scope.formData,
				function (res) {
					$scope.loading = false;
					AppAuth.currentUser.apps.push(res);
					$location.path('/apps/'+ res.id +'/');
				},
				function (res) {
					$scope.loading = false;
					$scope.registerError = res.data.error;
				}
			);
  		};
  	}])
  	.controller('appsAnalyticsCtrl', ['$scope', function ($scope) {
  	}])
  	.controller('appsSettingsGeneralCtrl', ['$scope', 'App', function ($scope, App) {
  		$scope.submit = function () {
			App.prototype$updateAttributes({id: $scope.currentApp.id}, {name:$scope.app.name},
				function (res) {
					$scope.currentApp.name = res.name;
				});
		}
  	}])
  	.controller('appsSettingsAdvancedCtrl', ['$scope', '$location', 'User', function ($scope, $location, User) {
  		$scope.switchDeleteApp = function() {
			$scope.openDeleteApp = $scope.openDeleteApp? false : true;
		};
  		$scope.submit = function () {
			User.prototype$__destroyById__apps({id: $scope.currentUser.id, fk: $scope.currentApp.id},
				function (res) {
					for (var i = 0; i < $scope.currentUser.apps.length; i++) {
						if ($scope.currentUser.apps[i].id === $scope.currentApp.id) {
							$scope.currentUser.apps.splice(i, 1);
						}
					}

					if ($scope.currentUser.apps.length) {
						return $location.path('/apps/'+ $scope.currentUser.apps[0].id +'/');
					} else {
						return $location.path('/newapp/');
					}
				});
		}
  	}])
  	.controller('appsSettingsInstallCtrl', ['$scope', function ($scope) {
  		$scope.show = function(type) {
  			if (type === 'js') $scope.show_js = !$scope.show_js;
  		}
  	}]);