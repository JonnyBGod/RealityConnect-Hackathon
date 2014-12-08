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

  .config(function ($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'views/home.html',
        controller: 'homeCtrl',
        resolve: {
          app: function($route, App) {
            return App.findById({id: $route.current.params.apiKey},
              function (res) {
                return res;
              },
              function () {
                return null;
              }
            );
          },
          owner: function($route, User) {
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
          }
        }
      }).
      otherwise({
        redirectTo: '/'
      });
  })

  .run(function(AppAuth, User, LoopBackAuth) {
    AppAuth.ensureHasCurrentUser(User);

    Visibility.change(function (e, state) {
      if (state === 'visible') {
        LoopBackAuth.currentUserId = localStorage['$LoopBack$currentUserId'] || sessionStorage['$LoopBack$currentUserId'] || null;
        LoopBackAuth.accessTokenId = localStorage['$LoopBack$accessTokenId'] || sessionStorage['$LoopBack$accessTokenId'] || null;
        AppAuth.ensureHasCurrentUser(User);
      }
    });
  });
