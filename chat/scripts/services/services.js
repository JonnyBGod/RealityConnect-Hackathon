'use strict';

// load lbclient via browserify's require
/*var client = (function() {
  //global require:true
  return require('lbclient');
})();*/

angular.module('services', ['lbServices'])
  //.value('Todo', client.models.LocalTodo)
  //.value('RemoteTodo', client.models.Todo)
  //.value('sync', client.sync)
  //.value('network', client.network)

  .factory('AppAuth', function($location, LoopBackAuth, $window) {
    return {
      currentUser: {},
      imagesLoading: 0,

      // Note: we can't make the User a dependency of AppAuth
      // because that would create a circular dependency
      //   AppAuth <- $http <- $resource <- LoopBackResource <- User <- AppAuth
      ensureHasCurrentUser: function(User) {
        if (this.currentUser && this.currentUser.id) {
          if (!LoopBackAuth.currentUserId || !LoopBackAuth.accessTokenId) {
            return this.logout(User);
          }
        } else if (LoopBackAuth.currentUserId && LoopBackAuth.accessTokenId) {
          var self = this;
          console.log(self.currentUser);
          self.currentUser = User.getCurrent(function(response) {
            if (!self.currentUser.queue)
              self.currentUser.queue = {};
            if (!self.currentUser.queueEvents)
              self.currentUser.queueEvents = {};
            // success
            User.prototype$getChatRooms({id: self.currentUser.id},
              function (res) {
                console.log(res);
                self.currentUser.chatRooms = res.chatRooms;
                if (response.username) {
                  $location.path('/signup');
                } else if ($location.path() === '/signin/') {
                  $location.path('/');
                }
              },
              function () {
              }
            );
          }, function(err) {
            if (err.status === 404) {
              return self.logout(User);
            }
          });
        } else {
          $location.path('/signin');
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
  })
  .factory('socket', function($rootScope, LoopBackAuth, AppAuth, $notification) {
    return {
      socket: false,
      connect: function (token) {
        var self = this;
        if (!self.socket) {
          self.socket = io('/websocket/', {
            'query': 'access_token=' + LoopBackAuth.accessTokenId
          });

          self.on('connection', function(data) {
            console.log('connect');
          });

          self.on('connection_error', function(data) {
            console.log('connect_error');
          });

          self.on('chat', function(data) {
            console.log('chat', data);
            if (data.type === 'startConversation') {
              var room = AppAuth.currentUser.chatRooms.filter(function (e) { return e.id === data.chatRoom.id });
              if (!room.length) {
                data.chatRoom.noMore = true;
                if (!data.chatRoom.events) {
                  data.chatRoom.events = [];
                }
                AppAuth.currentUser.chatRooms.push(data.chatRoom);
              } else {
                for (var y = 0; y < data.chatRoom.users.length; y++) {
                  if (!room[0].users.filter(function (e) { return e.id === data.chatRoom.users[y].id }).length) {
                    room[0].users.push(data.chatRoom.users[y]);
                  }
                }
              }
              data = data.event || data.events;
            }

            if (!Array.isArray(data)) {
              data = [data];
            }

            for (var d = 0; d < data.length; d++) {
              for (var i = AppAuth.currentUser.chatRooms.length - 1; i >= 0; i--) {
                if (AppAuth.currentUser.chatRooms[i].id === data[d].chatRoom
                  || (data[d].chatRooms && data[d].chatRooms.indexOf(AppAuth.currentUser.chatRooms[i].id) !== -1)) {
                  if (data[d].type.indexOf('update') !== -1) {
                    if (data[d].type === 'update:seen') {
                      if (!AppAuth.currentUser.chatRooms[i].seen) {
                        AppAuth.currentUser.chatRooms[i].seen = [data[d].seen];
                      } else if (AppAuth.currentUser.chatRooms[i].seen.filter(function (e) { return e.user === data[d].seen.user }).length) {
                        AppAuth.currentUser.chatRooms[i].seen.filter(function (e) { return e.user === data[d].seen.user })[0].date = data[d].seen.date;
                      } else {
                        AppAuth.currentUser.chatRooms[i].seen.push(data[d].seen);
                      }
                    } else {
                      for (var y = AppAuth.currentUser.chatRooms[i].users.length - 1; y >= 0; y--) {
                        if (AppAuth.currentUser.chatRooms[i].users[y].id === data[d].sender) {
                          if (data[d].type === 'update:writting') {
                            AppAuth.currentUser.chatRooms[i].users[y].writting = true;
                          } else if (data[d].type === 'update:stoppedWritting') {
                            AppAuth.currentUser.chatRooms[i].users[y].writting = false;
                          }
                        }
                      }
                    }
                  } else {
                    if (data[d].type === 'notification:changeName') {
                      AppAuth.currentUser.chatRooms[i].name = data[d].text.substring(data[d].text.indexOf('to: ') + 4, data[d].text.length);
                    } else if (data[d].type === 'notification:removeUser') {
                      for (var y = 0; y < AppAuth.currentUser.chatRooms[i].users.length; y++) {
                        if (AppAuth.currentUser.chatRooms[i].users[y].id === data[d].removedUser) {
                          AppAuth.currentUser.chatRooms[i].users.splice(y, 1);
                        }
                      }
                      if (!AppAuth.currentUser.chatRooms[i].oldUsers) {
                        AppAuth.currentUser.chatRooms[i].oldUsers = [];
                      }
                      AppAuth.currentUser.chatRooms[i].oldUsers.push(data[d].removedUser);
                    } /*else if (data[d].type === 'notification:addUsers') {
                      console.log(data[d]);
                      for (var y = 0; y < data[d].users.length; y++) {
                        if (AppAuth.currentUser.chatRooms[i].users.filter(function (e) { return e.id === data[d].users[y].id }).length) {
                          AppAuth.currentUser.chatRooms[i].users.push(data[d].users[y]);
                        }
                      }
                    }*/

                    AppAuth.currentUser.chatRooms[i].events.push(data[d]);
                    if (!AppAuth.currentUser.chatRooms[i].doNotDisturb && data[d].sender !== AppAuth.currentUser.id) {
                      $notification.notify('custom', '', AppAuth.currentUser.chatRooms[i].users.filter(function (e) { return e.id === data[d].sender })[0].name, data[d].text, AppAuth.currentUser.chatRooms[i].id, 2000);
                    }
                  }
                }
              };
            };
          });
        }
      },
      on: function(eventName, callback) {
        var self = this;
        self.socket.on(eventName, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            callback.apply(self.socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        var self = this;
        self.socket.emit(eventName, data, function() {
          var args = arguments;
          $rootScope.$apply(function() {
            if(callback) {
              callback.apply(self.socket, args);
            }
          });
        });
      },
      json: {
        send: function(data, callback) {
          var self = this;
          self.socket.json.send(data, function() {
            var args = arguments;
            $rootScope.$apply(function() {
              if(callback) {
                callback.apply(self.socket, args);
              }
            });
          });
        }
      }
    };
  })
  .factory('Utils', function() {
    return {
      groupify : function(source, into) {
        var i, ch;
        for (var i = 0; i < source.length; i++) {
          ch = source[i].name.charAt(0);
          into[ch] || (into[ch] = {
            label: ch,
            contacts: []
          });
          into[ch].contacts.push(source[i]);
        };
      }
    }
  })
  .service('computeSlideStyle', function(DeviceCapabilities) {
        // compute transition transform properties for a given slide and global offset
        return function(absoluteLeft, transitionType) {
            var style = {},
                slideTransformValue = DeviceCapabilities.has3d ? 'translate3d(' + absoluteLeft + 'px, 0, 0)' : 'translate3d(' + absoluteLeft + 'px, 0)';

            if (!DeviceCapabilities.transformProperty) {
                // fallback to default slide if transformProperty is not available
                style['margin-left'] = absoluteLeft + 'px';
            } else {
                style[DeviceCapabilities.transformProperty] = slideTransformValue;
            }
            return style;
        };
    });
