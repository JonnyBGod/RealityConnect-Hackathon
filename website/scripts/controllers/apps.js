'use strict';

angular.module('App')
	.controller('appsCtrl', function ($scope, $state, $location, $stateParams, AppAuth) {
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
  	})
  	.controller('newappCtrl', function ($scope, $location, User, AppAuth) {
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
  	})
  	.controller('appsAnalyticsCtrl', function ($scope) {
  	})
  	.controller('appsSettingsGeneralCtrl', function ($scope, App) {
  		$scope.submit = function () {
			App.prototype$updateAttributes({id: $scope.currentApp.id}, {name:$scope.app.name},
				function (res) {
					$scope.currentApp.name = res.name;
				});
		}
  	})
  	.controller('appsSettingsAdvancedCtrl', function ($scope, $location, User) {
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
  	})
  	.controller('appsSettingsInstallCtrl', function ($scope) {
  		$scope.show = function(type) {
  			if (type === 'js') $scope.show_js = !$scope.show_js;
  		}
  	});