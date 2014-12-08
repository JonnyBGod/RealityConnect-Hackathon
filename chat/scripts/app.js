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

  .config(function($locationProvider) {
      $locationProvider.
          html5Mode(true).hashPrefix('!');
  })

  .config(function ($translateProvider) {
    // add translation tables
    $translateProvider.useStaticFilesLoader({
        prefix: 'locales/en.',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('en-GB');
    // remember language
    $translateProvider.useLocalStorage();

    //$translateProvider.useMissingTranslationHandler('sendMissingTranslation');
  })

  .config(function ($analyticsProvider) {
    // turn off automatic tracking
    $analyticsProvider.settings.trackRelativePath = true;
  })

  .config(function ($httpProvider) {
    $httpProvider.interceptors.push(function($q, $location, $injector) {
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
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {
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
  })
  .run(function($rootScope, $cookies, $location, AppAuth, $http, User, LoopBackAuth, $notification) {
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
  });
