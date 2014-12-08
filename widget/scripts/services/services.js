'use strict';

angular.module('services', ['lbServices'])
  .factory('AppAuth', function($rootScope, $location, LoopBackAuth, $window) {
    return {
      currentUser: {},

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
          self.currentUser = User.getCurrent(function(response) {
            // success
            self.currentUser.chatRooms = [];
            $rootScope.$broadcast('login', response.username);
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
  })
  .factory('iframe', function($rootScope) {
    function d(a) {
        return a.hash.slice(1).replace(/(^\d+).*/, "$1")
    }

    function e(a) {
        var b = a.split("/");
        return b[0] + "//" + b[2]
    }
    var f = d(window.location),
        g = window.opener || window.parent,
        h = document.referrer,
        i = {};
    i.client = e(document.location.href), i.host = h ? e(h) : i.client;

    var j = {
        getUID: d,
        origins: i,
        messageHandler: function (a) {
            a = a.originalEvent;
            var b;
            try {
                b = JSON.parse(a.data)
            } catch (c) {
                return
            }
            //console.log(b);
            if (!b.name || "!" !== b.name[0] || a.origin === i.client) switch (b.scope) {
            case "host":
                break;
            case "client":
                $rootScope.$broadcast(b.name, b.data)
            }
        },
        postMessage: function (a) {
            a.sender = f, a = JSON.stringify(a), g.postMessage(a, "*")
        },
        sendHostMessage: function (a, b) {
            b = b || [], j.postMessage({
                scope: "host",
                name: a,
                data: b
            })
        }
    };

    $(window).on("message", j.messageHandler);
    $(window).on("unload", function () {
      j.sendHostMessage("die")
    });

    return j;
  })
  .factory('socket', function($rootScope, LoopBackAuth, AppAuth) {
    return {
      socket: false,
      connect: function (token) {
        var self = this;
        if (!self.socket) {
          self.socket = io('/', {
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
                    AppAuth.currentUser.chatRooms[i].events.push(data[d]);
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
  });