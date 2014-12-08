'use strict';

angular.module('App')
	.controller('contactsCtrl', function ($scope, User, $location, $window, AppAuth, Utils) {
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
  	})
  	.controller('contactsAddCtrl', function ($scope, User, $location, $window, AppAuth, $timeout) {
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
  	})
  	.controller('contactsAddFacebookCtrl', function ($scope, User, $location, $window, AppAuth) {

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

  	})
  	.controller('contactsAddGoogleCtrl', function ($scope, User, $location, $window, AppAuth) {

  	})
  	.controller('newRoomCtrl', function ($scope, User, $location, $window, AppAuth, Utils) {
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
  	});