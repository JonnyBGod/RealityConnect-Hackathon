'use strict';

angular
  .module('ori', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'lbServices',
    'services',
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

    $stateProvider
      .state('auth', {
        url: '/auth/',
        abstract: true
      })
      .state('auth.signin', {
        url: '',
        views: {
          'mainview@': {
            templateUrl: 'views/signin.html',
            controller: 'signinCtrl'
          }
        }
      })
      .state('auth.signup', {
        url: 'signup/',
        views: {
          'mainview@': {
            templateUrl: 'views/signin.html',
            controller: 'signinCtrl'
          }
        }
      })
      .state('auth.verify-email', {
        url: 'verify-email/',
        views: {
          'mainview@': {
            templateUrl: 'views/signin.html',
            controller: 'signinCtrl'
          }
        }
      })
      .state('auth.reset-password', {
        url: 'reset-password/{resetPasswordToken}/',
        views: {
          'mainview@': {
            templateUrl: 'views/signin.html',
            controller: 'signinCtrl'
          }
        }
      })
      .state('auth.recover-account', {
        url: 'recover-account/',
        views: {
          'mainview@': {
            templateUrl: 'views/signin.html',
            controller: 'signinCtrl'
          }
        }
      });

      $urlRouterProvider.otherwise('/auth/');
  })
  .run(function(AppAuth, User, LoopBackAuth) {
    AppAuth.ensureHasCurrentUser(User);
  });

angular.module('ori')
  .controller('signinCtrl', function ($scope, $state, $stateParams, $location, User, AppAuth, LoopBackAuth, $timeout) {
    $scope.err = false;
    $scope.success = false;
    $scope.loading = false;

    $scope.formData = {}; 
    $scope.currentUser = AppAuth.currentUser;
    $scope.showForm = $state.current.name.replace('auth.', '');

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
        $scope.loginResult = User.link({include: '', rememberMe: true}, $scope.formData,
          function() {
            $scope.loading = false;

            LoopBackAuth = window.opener.angular.element(window.opener.document.body).injector().get('LoopBackAuth');
            
            LoopBackAuth.currentUserId = localStorage['$LoopBack$currentUserId'] || sessionStorage['$LoopBack$currentUserId'] || null;
            LoopBackAuth.accessTokenId = localStorage['$LoopBack$accessTokenId'] || sessionStorage['$LoopBack$accessTokenId'] || null;
            LoopBackAuth.rememberMe = true;
            LoopBackAuth.save();

            window.opener.angular.element(window.opener.document.body).injector().get('AppAuth').ensureHasCurrentUser(window.opener.angular.element(window.opener.document.body).injector().get('User'));
            self.close();
          },
          function(res) {
            $scope.loading = false;
            $scope.loginError = res.data.error;
          }
        );
      } else {
        $scope.loginResult = User.login({include: '', rememberMe: true}, $scope.formData,
          function() {
            $scope.loading = false;

            LoopBackAuth = window.opener.angular.element(window.opener.document.body).injector().get('LoopBackAuth');
            
            LoopBackAuth.currentUserId = localStorage['$LoopBack$currentUserId'] || sessionStorage['$LoopBack$currentUserId'] || null;
            LoopBackAuth.accessTokenId = localStorage['$LoopBack$accessTokenId'] || sessionStorage['$LoopBack$accessTokenId'] || null;
            LoopBackAuth.rememberMe = true;
            LoopBackAuth.save();

            window.opener.angular.element(window.opener.document.body).injector().get('AppAuth').ensureHasCurrentUser(window.opener.angular.element(window.opener.document.body).injector().get('User'));
            self.close();
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

    $timeout(function () {
      window.resizeTo(500, $('.log-form').height()+122);
    });
  });
