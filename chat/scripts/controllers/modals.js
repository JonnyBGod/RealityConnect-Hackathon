'use strict';

angular.module('App')
  .controller('addContactCtrl', function ($scope, User, ChatRoom, $window, AppAuth, Utils, $stateParams, close) {
    $scope.currentUser = AppAuth.currentUser;
    $scope.currentChatRoom = $scope.currentUser.chatRooms.filter(function (e) { return e.id === $stateParams.id })[0];
    $scope.contacts = [];
    $scope.groups = {};
    $scope._setup = false;
    $scope.selectedContacts = [];

    $scope.$on(
        "$destroy",
        function( event ) {
            $(".hoverview").html('');
            $(".hoverview").css('display', 'none');
        }
    );

    $scope.close = function(result) {
      close(result, 200);
    }

    $scope.setup = function () {
      $scope._setup = true;
      User.prototype$findContacts({id: AppAuth.currentUser.id},
              function (res) {
                $scope.contacts = res;
                $scope.groups = {};
                Utils.groupify($scope.contacts, $scope.groups);

                for (var i = 0; i < $scope.contacts.length; i++) {
                  if ($scope.currentChatRoom.users.filter(function (e) { return e.id === $scope.contacts[i].id}).length) {
                    $scope.selectedContacts.push($scope.contacts[i]);
                  } 
                }
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
      var self = this;
      if ($scope.currentChatRoom.users.filter(function (e) { return e.id === self.contact.id}).length) return;

      if ($scope.selectedContacts.indexOf(self.contact) === -1) {
        $scope.selectedContacts.push(self.contact);
      } else {
        $scope.selectedContacts.splice($scope.selectedContacts.indexOf(self.contact), 1);
      }
    }

    $scope.createRoom = function () {
      if ($scope.selectedContacts.length <= $scope.currentChatRoom.users.length-1) return $scope.close();

      var users = [];

      for (var i = 0; i < $scope.selectedContacts.length; i++) {
        if (!$scope.currentChatRoom.users.filter(function (e) { return e.id === $scope.selectedContacts[i].id}).length) {
          users.push($scope.selectedContacts[i].id);
        }
      };

      ChatRoom.prototype$addUsers({ id: $scope.currentChatRoom.id }, {
        users: users
      }, function (res) {
        for (var i = 0; i < res.length; i++) {
          if (!$scope.currentChatRoom.users.filter(function (e) { return e.id === res[i].id }).length) {
            $scope.currentChatRoom.users.push(res[i]);
          }
        };
        $scope.close();
      }, function (err) {
        if (err) console.error(err);
      });
    }

    $(".hoverview").css('display', 'block');
  });