'use strict';

angular.module('App')
	.controller('profileCtrl', function ($scope, User, $stateParams, AppAuth, $location) {
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
  });