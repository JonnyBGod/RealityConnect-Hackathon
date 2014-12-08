'use strict';

angular.module('services', ['lbServices'])
  .factory('AppAuth', function($rootScope, $location, LoopBackAuth, $window) {
    return {
      currentUser: {},

      // Note: we can't make the User a dependency of AppAuth
      // because that would create a circular dependency
      //   AppAuth <- $http <- $resource <- LoopBackResource <- User <- AppAuth
      ensureHasCurrentUser: function(User) {
        if (this.currentUser.id) {
          if (!LoopBackAuth.currentUserId || !LoopBackAuth.accessTokenId) {
            return this.logout(User);
          }
        } else if (LoopBackAuth.currentUserId && LoopBackAuth.accessTokenId) {
          var self = this;
          self.currentUser = User.getCurrent(function(response) {
            // success
            User.apps({id: self.currentUser.id}, 
              function (res) {
                self.currentUser.apps = res;
                if (response.username) {
                  $location.path('/signup');
                } else {
                  $rootScope.$broadcast('login');
                }
              },
              function () {
              }
            ); 
          }, function(response) {
            console.log(response);
          });
        }
      },
      logout: function (User) {
        var self = this;
        User.logout(function() {
          self.currentUser = null;

          LoopBackAuth.currentUserId = '';
          LoopBackAuth.accessTokenId = '';
          LoopBackAuth.rememberMe = true;
          LoopBackAuth.save();

          $location.path('/');
          $window.location.reload();
        }, function (err) {
          if (err && err.data.error.message === 'could not find accessToken') {
            self.currentUser = null;

            LoopBackAuth.currentUserId = '';
            LoopBackAuth.accessTokenId = '';
            LoopBackAuth.rememberMe = true;
            LoopBackAuth.save();

            $location.path('/');
            $window.location.reload();
          }
        });
      }
    };
  });