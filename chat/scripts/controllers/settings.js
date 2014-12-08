'use strict';

angular.module('App')
	.controller('settingsCtrl', function ($scope, $window) {
		$scope.goBack = function() {
	      $window.history.back();
	    }
  	});