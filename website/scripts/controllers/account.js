'use strict';

angular.module('App')
	.controller('accountCtrl', function ($scope, User, $location, AppAuth) {
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
	});