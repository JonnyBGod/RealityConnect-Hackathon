'use strict';

angular.module('App')
	.controller('headerCtrl', function ($scope, User, $location, AppAuth) {
		$scope.currentUser = AppAuth.currentUser;

		$scope.logout = function () {
			AppAuth.logout(User);
		};

		$scope.$on('login', function () {
			$scope.currentUser = AppAuth.currentUser;
		});
  	})
  	.controller('homeCtrl', function ($scope) {
		$scope.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];
  	});
