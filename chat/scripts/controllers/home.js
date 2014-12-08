'use strict';

angular.module('App')
	.controller('navigationCtrl', function ($scope, AppAuth, User) {
    $scope.toggleMenu = function (e) {
      $(".navigation").toggleClass('open');
      e.stopPropagation();
    }

    $scope.logout = function () {
      AppAuth.logout(User);
    };

    $scope.stopPropagation = function (e) {
      e.stopPropagation();
    }
  })
  .controller('headerCtrl', function ($scope, $location, $window, ChatRoom) {
    $scope.details = false;
    $scope.loading = false;
    $scope.from = '/_chat/';

    if ($location.path().indexOf('details') != -1) {
      $scope.details = true;
    }

    $scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
      if (to.name.indexOf('details') !== -1) {
        $scope.details = true;
      } else {
        $scope.details = false;
      }
    });

    $scope.goBack = function() {
      $window.history.back();
    }

    $scope.toggleMenu = function (e) {
      $(".navigation").toggleClass('open');
      e.stopPropagation();
    }

    $scope.toggleEditName = function () {
      if ($scope.currentChatRoom.appPage || !$scope.isActiveUser()) return;

      $scope.editingName = !$scope.editingName;
      $scope.currentChatRoom.newChatRoomName = $scope.currentChatRoom.name ? angular.copy($scope.currentChatRoom.name) : '';
    }

    $scope.editNameKeydown = function (e) {
      if (e.which === 13) {
        e.preventDefault();
        console.log($scope.currentChatRoom.newChatRoomName);
        if ($scope.currentChatRoom.newChatRoomName !== $scope.currentChatRoom.name) {
          ChatRoom.prototype$changeName({ id: $scope.currentChatRoom.id }, {
            name: $scope.currentChatRoom.newChatRoomName
          }, function (res) {
            console.log(res);
          }, function (err) {
            console.log(err);
          });
        }

        $scope.toggleEditName();
      }
    }

    $(".content").removeClass('reverse');
  })
	.controller('homeCtrl', function ($scope, AppAuth, $state, socket, ChatRoom, $q, $window, $location) {
		$scope.currentUser = AppAuth.currentUser;
		$scope.currentChatRoom = false;
    $scope.roomList = 'personal';
    $scope.windowWidth = $window.innerWidth;

    $scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
      $scope.windowWidth = $window.innerWidth;

      if ($scope.currentUser && $scope.currentUser.chatRooms && $scope.currentUser.chatRooms.length) {
        $scope.currentChatRoom = $scope.currentUser.chatRooms.filter(function (e) { return e.id === toParams.id })[0];
        if ($scope.currentChatRoom && !$scope.currentChatRoom.imagesLoading)
          $scope.currentChatRoom.imagesLoading = 0;

        if (to.name.indexOf('home.rooms.chat') !== -1 && !$scope.currentChatRoom) {
          return $location.path('/');
        }

        if ($scope.currentChatRoom && !$scope.currentChatRoom.message)
          $scope.currentChatRoom.message = {
            text: '',
            url: false
          };

        if ($scope.currentChatRoom && $scope.currentChatRoom.events.length < 2) {
          $scope.getChatRoomEvents();
        }
      } else {
        $scope.currentChatRoom = false;
      }
    });

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

    $window.onresize = function () {
      $scope.windowWidth = $window.innerWidth;
      var objDiv = document.getElementById("chat");

      if (objDiv.scrollHeight <= objDiv.clientHeight && objDiv.clientHeight <= $('body').innerHeight() - 40) {
        objDiv.style.top = 'auto';
      } else {
        objDiv.style.top = 0;
      }
      $scope.$apply();
    };

    $scope.setup = function () {
      socket.connect();

      if ($state.params && $scope.currentUser && $scope.currentUser.chatRooms && $scope.currentUser.chatRooms.length) {
        $scope.currentChatRoom = $scope.currentUser.chatRooms.filter(function (e) { return e.id === $state.params.id })[0];
        if ($scope.currentChatRoom && !$scope.currentChatRoom.imagesLoading)
          $scope.currentChatRoom.imagesLoading = 0;

        if ($scope.currentChatRoom && $scope.currentChatRoom.events && $scope.currentChatRoom.events.length < 2) {
          $scope.getChatRoomEvents();
        }

        if ($scope.currentChatRoom && $scope.currentChatRoom.appPageId) {
          $scope.roomList = 'business';
        }
      } else if ($state.current.name.indexOf('home.rooms.chat') !== -1 && !$scope.currentChatRoom) {
        return $location.path('/');
      }

      $scope.$watchCollection('currentUser.chatRooms', function () {
        $scope.currentUser = AppAuth.currentUser;
        if ($state.params && $scope.currentUser && $scope.currentUser.chatRooms && $scope.currentUser.chatRooms.length) {
          $scope.currentChatRoom = $scope.currentUser.chatRooms.filter(function (e) { return e.id === $state.params.id })[0];
          if ($scope.currentChatRoom && !$scope.currentChatRoom.imagesLoading)
            $scope.currentChatRoom.imagesLoading = 0;

          if ($state.current.name.indexOf('home.rooms.chat') !== -1 && !$scope.currentChatRoom) {
            $location.path('/');
          }

          if ($scope.currentChatRoom && !$scope.currentChatRoom.message)
            $scope.currentChatRoom.message = {
              text: '',
              url: false
            };

          $scope.currentUser.chatRooms.sort(function (a, b) {
            if (a.events.length) {
              a = a.events[a.events.length -1];
            }

            if (b.events.length) {
              b = b.events[b.events.length -1];
            }

            return new Date(parseInt(b.id.toString().slice(0,8), 16)*1000) - new Date(parseInt(a.id.toString().slice(0,8), 16)*1000);
          });
        }
      });
    };

    $scope.isActiveUser = function () {
      return $scope.currentUser && $scope.currentChatRoom && $scope.currentChatRoom.users.filter(function (e) { return e.id === $scope.currentUser.id }).length;
    }

    if ($scope.currentUser && $scope.currentUser.id) {
      $scope.setup();
    } else {
      var listener = $scope.$watch('currentUser', function () {
        if ($scope.currentUser && $scope.currentUser.id && $scope.currentUser.chatRooms && !socket.socket) {
          $scope.setup();
          listener();
        }
      }, true);
    }
	})
	.controller('roomsCtrl', function ($scope, $location) {
    
    $scope.openChatRoom = function () {
      $location.path('/'+ this.chatRoom.id);
    }

    $scope.changeRoomList = function (room) {
       $scope.roomList = room;
       $scope.searchFilter = "";
    }

    $scope.checkUnseen = function () {
      if (this.chatRoom.events.length && this.chatRoom.events[this.chatRoom.events.length -1].sender !== $scope.currentUser.id) {
        return new Date(this.chatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id })[0].date) < new Date(parseInt(this.chatRoom.events[this.chatRoom.events.length -1].id.toString().slice(0,8), 16)*1000);
      } else {
        return false;
      }
    }
	})
	.controller('chatCtrl', function ($scope, socket, $timeout, $window, User) {
    $scope.forceScrollReset = true;

    $scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
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
    });

    $scope.$watchCollection('currentChatRoom.events', function (newValue, oldValue) {
      /*if (!newValue) {
        return;
      }

      if (!$scope.currentChatRoom.seen
        || !$scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id }).length
        || (newValue.id !== oldValue.id && new Date($scope.currentChatRoom.seen.filter(function (e) { return e.user === $scope.currentUser.id })[0].date) < new Date(parseInt($scope.currentChatRoom.events[$scope.currentChatRoom.events.length -1].id.toString().slice(0,8), 16)*1000))
        ) {

        $scope.updateSeen();
      }*/

      /*if (!newValue || newValue.id !== oldValue.id) {
        if ($scope.currentChatRoom && $scope.currentChatRoom.queue)
          $scope.currentChatRoom.queue.length = 0;
      }*/

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

      if (objDiv.scrollHeight <= objDiv.clientHeight && objDiv.clientHeight <= $('body').innerHeight() - 40) {
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
        if (objDiv.scrollHeight <= objDiv.clientHeight && objDiv.clientHeight <= $('body').innerHeight() - 40) {
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

      if (!$scope.currentChatRoom.message.url) {
        $scope.currentChatRoom.message.url = $scope.currentChatRoom.message.text.match(/((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi);
        
        if ($scope.currentChatRoom.message.url) {
          $scope.currentChatRoom.message.url = $scope.currentChatRoom.message.url[0];
          User.prototype$getParseUrl({id: $scope.currentUser.id, url: $scope.currentChatRoom.message.url},
            function (res) {
              if (res.site_name || res.image) {
                $scope.currentChatRoom.message.url = res;
              } else {
                $scope.currentChatRoom.message.url = false;
              }
            },
            function (err) {
              console.log(err);
              $scope.currentChatRoom.message.url = false;
            }
          );
        }
      }
    }

    $scope.clearMessageUrl = function () {
      $scope.currentChatRoom.message.url = false;
    }

    $scope.send = function () {
      if ($scope.currentChatRoom.message.text.length || $scope.currentChatRoom.message.url || $scope.currentChatRoom.queue) {
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
  })
	.controller('chatDetailsCtrl', function ($scope, User, $timeout, ChatRoom, ModalService) {
		$(".home > .view").addClass('details');

		$scope.$on(
        "$destroy",
        function( event ) {
            $(".home > .view").removeClass('details');
        }
    );

    $scope.menuLocation = false;

    $scope.doNotDisturb = function () {
      ChatRoom.update({ 
        where: { id: $scope.currentChatRoom.id }
      }, {
        doNotDisturb: $scope.currentChatRoom.doNotDisturb
      }, function () {

      }, function (err) {
        if (err) console.error(err);
      });
    }

    $scope.leaveConversation = function () {
      $scope.menuLeaveConversation = !$scope.menuLeaveConversation;
    }

    $scope.leaveChatRoom = function () {
      ChatRoom.prototype$removeUser({ 
        id: $scope.currentChatRoom.id,
        userId: $scope.currentUser.id
      }, function (res) {
        for (var i = 0; i < $scope.currentUser.chatRooms.length; i++) {
          if ($scope.currentUser.chatRooms[i].id === $scope.currentChatRoom.id) {
            $scope.currentUser.chatRooms.splice(i, 1);
          }
        }
        $location.path('/');
      }, function (err) {
        if (err) console.error(err);
      });
    }

    $scope.removeFromChatRoom = function () {
      var self = this;
      ChatRoom.prototype$removeUser({ 
        id: $scope.currentChatRoom.id,
        userId: self.$parent.user.id
      }, function (res) {
        for (var i = 0; i < $scope.currentChatRoom.users.length; i++) {
          if ($scope.currentChatRoom.users[i].id === self.$parent.user.id) {
            $scope.currentChatRoom.users.splice(i, 1);
          }
        }
      }, function (err) {
        if (err) console.error(err);
      });
    }

    $scope.addContact = function (id) {
      ModalService.showModal({
        templateUrl: "views/home.addContact.html",
        controller: "addContactCtrl",
        appendElement: angular.element('.hoverview')
      }).then(function(modal) {

      });
    }
	});
