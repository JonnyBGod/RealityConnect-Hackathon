'use strict';

angular.module('ori')
	.controller('homeCtrl', function ($scope, User, ChatRoom, $location, AppAuth, app, owner, iframe, $routeParams, $timeout, $q) {
		$scope.currentUser = AppAuth.currentUser;
    $scope.params = $routeParams;
    $scope.showForm = false;
    $scope.ShowRegisterForm = false;
    $scope.data = {};
    $scope.success = false;
    $scope.error = false;
    $scope.formData = {};

		$scope.logout = function () {
      AppAuth.logout(User)
    };

    $q.all([app, owner]).then(function(results) {
        $scope.app = results[0];
        $scope.owner = results[1];

        if ($scope.currentUser.id && !$scope.currentChatRoom) {
          $scope.getChatRoom();
        }

        $timeout(function () {
          if ($scope.owner.email && $scope.owner.email === $scope.params.o_e && $scope.app) {
            iframe.sendHostMessage("ready");
            iframe.sendHostMessage("mainViewRendered", {
                height: $("body").height()
            })
          } else {
            iframe.sendHostMessage("fail");
            iframe.sendHostMessage("mainViewRendered", {
                height: $("body").height()
            })
          }
        }, 0);
    });

    $scope.getChatRoom = function () {
      var parser = document.createElement('a');
      parser.href = $scope.params.t_u;

      User.prototype$getChatRoom({
        id: $scope.currentUser.id,
        filter: {
          owner: $scope.owner.id,
          appId: $scope.app.id,
          appUrl: parser.pathname + parser.search
      }},
        function (res) {
          AppAuth.currentUser.chatRooms = [res.chatRoom];
          $scope.currentChatRoom = AppAuth.currentUser.chatRooms[0];
          $timeout(function () {
            iframe.sendHostMessage("resize", {
              height: $("body").height()
            });
          }, 100);
        },
        function (err) {
          AppAuth.currentUser.chatRooms = [];
          $scope.currentChatRoom = false;
          $timeout(function () {
            iframe.sendHostMessage("resize", {
              height: $("body").height()
            });
          }, 100);
        }
      );
    }

		$scope.$on('login', function (event, username) {
      $scope.currentUser = AppAuth.currentUser;

      if (username) {
        var top = screen.availHeight/2 - 242;
        var left = screen.availWidth/2 - 410;
        return AppAuth.popupWin = window.open('/widget/auth/','imoglobe','toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=500, height=420, top='+ top +', left='+ left);
      } else if (AppAuth.popupWin) {
        AppAuth.popupWin.close();
      }

      $scope.$watchCollection('currentUser.chatRooms', function () {
        if (AppAuth.currentUser.chatRooms.length) {
          $scope.currentChatRoom = AppAuth.currentUser.chatRooms[0];
        }
      });

      if ($scope.owner.id && $scope.app.id) {
        $scope.getChatRoom();
      } else {
        $q.all([app, owner]).then(function(results) {
          $timeout(function () {
            if ($scope.owner.id && $scope.app.id) {
              $scope.getChatRoom();
            }
          }, 100);
        });
      }
		});

    $scope.openAuth = function (provider) {
      if (provider.length) {
        var top = screen.availHeight/2 - 242;
        var left = screen.availWidth/2 - 410;
        if( !AppAuth.popupWin || AppAuth.popupWin.closed ) {
            AppAuth.popupWin = window.open('/../widget-auth/'+ provider,'imoglobe','toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=800, height=600, top='+ top +', left='+ left);
        } else AppAuth.popupWin.focus();
      } else {
        var top = screen.availHeight/2 - 242;
        var left = screen.availWidth/2 - 410;
        if( !AppAuth.popupWin || AppAuth.popupWin.closed ) {
            AppAuth.popupWin = window.open('/widget/auth/','imoglobe','toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=500, height=420, top='+ top +', left='+ left);
        } else AppAuth.popupWin.focus();
      };
    }

    /*iframe.sendHostMessage("resize", {
        height: $("body").height()
    })*/

    $scope.toggleShowForm = function () {
      $scope.showForm = true;
      setTimeout(function () {
        iframe.sendHostMessage("resize", {
            height: $("body").height()
        })
      });
    }

    $scope.toggleShowRegisterForm = function () {
      $scope.ShowRegisterForm = true;
      setTimeout(function () {
        iframe.sendHostMessage("resize", {
            height: $("body").height()
        })
      });
    }

    $scope.startConversation = function () {
      User.prototype$startConversation({
        id: AppAuth.currentUser.id},
        {
          users: [$scope.owner.id],
          appId: app.id,
          appUrl: $scope.params.t_u,
          event: { 
            type: 'message',
            text: $scope.data.message
          }
        },
        function (res) {
          //$scope.currentChatRoom = res.chatRoom;
          $scope.getChatRoom();
        },
        function () {

        }
      );
    }

    $scope.login = function () {
      $scope.loading = true;

      $scope.loginResult = User.login({include: 'user apps', rememberMe: true}, $scope.formData,
        function() {
          $scope.loading = false;

          AppAuth.currentUser = $scope.loginResult.user;
        },
        function(res) {
          $scope.loading = false;
          $scope.loginError = res.data.error;
        }
      );
    };

    $scope.register = function() {
      $scope.loading = true;

      $scope.user = User.save($scope.formData,
        function () {
          $scope.loading = false;
          $scope.login();
        },
        function (res) {
          $scope.loading = false;
          $scope.registerError = res.data.error;
        }
      );
    };
	})
  .controller('chatCtrl', function ($scope, socket, $timeout, $window, User, $q, ChatRoom) {
    socket.connect();
    $scope.forceScrollReset = true;

    $scope.getChatRoomEvents = function () {
      var deferred = $q.defer();
      if (!$scope.currentChatRoom.loading && $scope.currentChatRoom && !$scope.currentChatRoom.noMore) {
        $scope.currentChatRoom.loading = true;
        var id = $scope.currentChatRoom.id;
        ChatRoom.prototype$__get__event({ id: id,
          filter: {
            where: {
              users: $scope.currentUser.id
            },
            order: 'id DESC',
            skip: $scope.currentChatRoom.events.length,
            limit: 10 }
          }, function (res) {
            var room = $scope.currentUser.chatRooms.filter(function (e) { return e.id === id })[0];
            room.loading = false;

            if (res.length < 10) {
              room.noMore = true;
            }

            if (res.length && !room.events.filter(function (e) { return e.id === res[0].id }).length) {
              [].push.apply( res.reverse(), room.events );
              room.events = res;
            }

            deferred.resolve();
          }, function (err) {
            var room = $scope.currentUser.chatRooms.filter(function (e) { return e.id === id })[0];
            room.loading = false;
        });
      } else {
        deferred.reject();
      }
      return deferred.promise;
    }

    /*$scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
      $timeout(function () {
        if ($scope.currentChatRoom) {
          if (!$scope.currentChatRoom.seen
            || !$scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id }).length
            || $scope.currentChatRoom.events.length && new Date($scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id })[0].date) < new Date(parseInt($scope.currentChatRoom.events[$scope.currentChatRoom.events.length -1].id.toString().slice(0,8), 16)*1000)
            ) {

            $scope.updateSeen();
          }
        }
      });
    });*/

    $scope.$watchCollection('currentChatRoom.events', function (newValue, oldValue) {
      if (!newValue || !oldValue) {
        return;
      }
      
      $timeout(function () {
        var objDiv = document.getElementById("chat");
        if (newValue.length > oldValue.length && (objDiv.style.top === 'auto' || objDiv.scrollTop + objDiv.clientHeight === objDiv.scrollHeight)) {
          if ($scope.currentChatRoom) {
            if (!$scope.currentChatRoom.seen
              || !$scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id }).length
              || new Date($scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id })[0].date) < new Date(parseInt($scope.currentChatRoom.events[$scope.currentChatRoom.events.length -1].id.toString().slice(0,8), 16)*1000)
              ) {

              $scope.updateSeen();
              $scope.$apply();
            }
          }
        }

        $scope.checkSize();
        if (oldValue && oldValue.length < 2
          || $scope.forceScrollReset
          || objDiv.clientHeight + objDiv.scrollTop + 60 >= objDiv.scrollHeight || !newValue[newValue.length -1].sender) {
          
          $timeout(function () {
            objDiv.scrollTop = objDiv.scrollHeight;
          });
          if ($scope.forceScrollReset) {
            $timeout(function () {
              $scope.forceScrollReset = false;
            }, 100);
          }
        }
      }, 0);
    });

    $scope.checkSize = function () {
      var objDiv = document.getElementById("chat");
      if (objDiv.scrollHeight <= objDiv.clientHeight && objDiv.clientHeight <= $('body').innerHeight() - 146) {
        objDiv.style.top = 'auto';

        if (!$scope.currentChatRoom.noMore) {
          $scope.getChatRoomEvents().then(function () {
            $timeout(function () {
              $scope.forceScrollReset = true;
            });
          });
        }
      } else {
        objDiv.style.top = 0;
        $scope.currentChatRoom.initialLoading = true;
      }
    }

    $scope.$watch('currentChatRoom.seen', function (newValue, oldValue) {
      if (!newValue) {
        return;
      }

      for (var i = 0; i < $scope.currentChatRoom.events.length; i++) {
        if ($scope.currentChatRoom.events[i].seen) {
          $scope.currentChatRoom.events[i].seen = null;
        }
      };

      for (var i = 0; i < newValue.length; i++) {
        if (newValue[i].user !== $scope.currentUser.id) {
          var plugged = false;
          for (var y = $scope.currentChatRoom.events.length -1; y >= 0; y--) {
            if (!plugged && new Date(newValue[i].date) > new Date(parseInt($scope.currentChatRoom.events[y].id.toString().slice(0,8), 16)*1000)) {
              if (!$scope.currentChatRoom.events[y].seen) {
                $scope.currentChatRoom.events[y].seen = [newValue[i]];
              } else {
                $scope.currentChatRoom.events[y].seen.push(newValue[i]);
              }
              plugged = true;
            }
          };
        }
      };
    }, true);

    $window.onfocus = function () {
      var objDiv = document.getElementById("chat");

      if (objDiv.style.top === 'auto' || objDiv.scrollTop + objDiv.clientHeight === objDiv.scrollHeight) {
        if ($scope.currentChatRoom) {
          if (!$scope.currentChatRoom.seen
            || !$scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id }).length
            || $scope.currentChatRoom.events.length && new Date($scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id })[0].date) < new Date(parseInt($scope.currentChatRoom.events[$scope.currentChatRoom.events.length -1].id.toString().slice(0,8), 16)*1000)
            ) {

            $scope.updateSeen();
            $scope.$apply();
          }
        }
      }
    }

    $(".home > .view").addClass('chatRoom');

    $scope.$on(
        "$destroy",
        function( event ) {
            $(".home > .view").removeClass('chatRoom');
            $window.onfocus = function () {};
        }
    );

    $scope.updateSeen = function () {
      if (!$scope.currentChatRoom.seen) {
        var seen = {user: $scope.currentUser.id, date: new Date() };
        $scope.currentChatRoom.seen = [seen];
      } else {
        var seen = $scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id });
        if (seen.length) {
          seen = seen[0];
          seen.date = new Date();
        } else {
          var seen = {user: $scope.currentUser.id, date: new Date() };
          $scope.currentChatRoom.seen.push(seen);
        }
      }

      socket.emit('chat', {
          chatRoom: $scope.currentChatRoom.id,
          seen: seen,
          type: 'update:seen'
        });
    }

    $scope.chatBoxFocus = function () {
      console.log('focus');
      //$scope.updateSeen();
    }

    $scope.chatDblClick = function () {
      console.log('dblClick');
    }

    $timeout(function () {
      var objDiv = document.getElementById("chat");
      objDiv.scrollTop = objDiv.scrollHeight;
    });
  })
  .controller('chatFooterCtrl', function ($scope, socket, $timeout, $window, User, ChatRoom) {
    $scope.menu = false;
    $scope.menuPhoto = false;
    $scope.menuVideo = false;
    $scope.menuLocation = false;
    $scope.menuAttach = false;

    $scope.sendMessage = function () {
      var _event = {
        chatRoom: $scope.currentChatRoom.id,
        type: 'message',
        text: $scope.currentChatRoom.message.text
      };

      if (!$scope.currentChatRoom.events.length
        ||  Math.floor((new Date() - new Date(parseInt($scope.currentChatRoom.events[$scope.currentChatRoom.events.length -1].id.toString().slice(0,8), 16)*1000)) / 60000) > 60) {
        _event.startSession = true;
      }

      var _id = ObjectId().toString();
      User.events.create({id: $scope.currentUser.id}, _event,
        function (ev) {
          for (var i = 0; i < $scope.currentChatRoom.events.length; i++) {
            if ($scope.currentChatRoom.events[i].id === _id) {
              $scope.currentChatRoom.events[i] = ev;
            }
          };
        }, function (err) {
          console.error(err);
        }
      );
      $timeout(function () {
        _event.id = _id;
        $scope.currentChatRoom.events.push(_event);
        $scope.currentChatRoom.message.text = '';
        $scope.currentChatRoom.message.url = false;
        $("#chatBox").removeClass('expanded');
      }, 0);
    }

    $scope.updateChatBox = function () {
      var result = $.countLines("#chatBox");
      if (result.actual > 1) {
        $("#chatView").addClass('expandedChatBox');

        var objDiv = document.getElementById("chat");
        if (objDiv.scrollHeight <= objDiv.clientHeight && objDiv.clientHeight <= $('body').innerHeight() - 146) {
          objDiv.style.top = 'auto';
        } else {
          objDiv.style.top = 0;
        }

        if (objDiv.clientHeight + objDiv.scrollTop + 16 === objDiv.scrollHeight) {
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      } else {
        $("#chatView").removeClass('expandedChatBox');
      }

      if (!$scope.writting && $scope.currentChatRoom.message.text.length) {
        $scope.writting = true;
        socket.emit('chat', {
          chatRoom: $scope.currentChatRoom.id,
          type: 'update:writting'
        });
      } else if ($scope.writting && !$scope.currentChatRoom.message.text.length) {
        $scope.writting = false;
        socket.emit('chat', {
          chatRoom: $scope.currentChatRoom.id,
          type: 'update:stoppedWritting'
        });
      }
    }

    $scope.clearMessageUrl = function () {
      $scope.currentChatRoom.message.url = false;
    }

    $scope.send = function () {
      if ($scope.currentChatRoom.message.text.length) {
        $scope.sendMessage();
      }
    }

    $scope.chatBoxKeydown = function (e) {
      if (e.which === 13 && !e.shiftKey) {
        $scope.send();
        e.preventDefault();
      } else if (e.which === 13 && e.shiftKey) {
        var result = $.countLines("#chatBox");
        if (result.actual = 1) {
          $("#chatView").addClass('expandedChatBox');
        }
      }
    }
  });
