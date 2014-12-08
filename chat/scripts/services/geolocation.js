angular.module('geolocation', [])
	.factory('geolocation', function($rootScope, $window, $timeout, socket, User, AppAuth) {
		return {
			sharing: false,
			watcher: false,

			shareLocation: function (cb) {
				if (typeof cb !== 'function') cb = function() {};
				if (!navigator.geolocation) return cb('Geolocation is not supported by this browser.');
				if (this.sharing) return cb(null);

				var self = this;
				
				var rooms = [];
				AppAuth.currentUser.chatRooms.forEach(function (_room, index) {
					if (_room.shareLocation && _room.shareLocation.length) {
						console.log(_room.shareLocation);
						_room.shareLocation.forEach(function (_user, index) {
							if (_user.id === AppAuth.currentUser.id) {
								if (moment().isBefore(_user.until) || _user.until === 'true') {
									rooms.push(_room.id);
								} else {
									self.stopSharing(_room.id);
									_room.splice(index, 1);
								}
							}
						});
					}
				});

				if (!rooms.length) {
					this.sharing = false;
					return cb(null);
				}

				self.watcher = navigator.geolocation.watchPosition(function (position) {
					self.sharing = true;

					var rooms = []
					var until;
					AppAuth.currentUser.chatRooms.forEach(function (_room, index) {
						if (_room.shareLocation && _room.shareLocation.length) {
							_room.shareLocation.forEach(function (_user, index) {
								if (_user.id === AppAuth.currentUser.id) {
									if (moment().isBefore(_user.until) || _user.until === 'true') {
										_user.location = [position.coords.latitude, position.coords.longitude];
										_user.date = new Date();
										until = _user.until;
										$rootScope.$apply();
										rooms.push(_room.id);
									} else {
										self.stopSharing(_room.id);
										_room.splice(index, 1);
									}
								}
							});
						}
					});

					if (!rooms.length) {
						if (navigator.geolocation) navigator.geolocation.clearWatch(self.watcher);
						this.sharing = false;
						return cb(null);
					}

					var _event = {
						chatRooms: rooms,
						type: 'shareLocation:position',
						until: until,
						location: [position.coords.latitude, position.coords.longitude],
						date: new Date()
					};

					if (socket.socket) {
						socket.emit('chat', _event);
					}

					cb(null);
				}, function (error) {
					self.sharing = false;

					var err;
					switch(error.code) {
						case error.PERMISSION_DENIED:
							err = "User denied the request for Geolocation.";
							break;
						case error.POSITION_UNAVAILABLE:
							err = "Location information is unavailable.";
							break;
						case error.TIMEOUT:
							err = "The request to get user location timed out.";
							break;
						case error.UNKNOWN_ERROR:
							err = "An unknown error occurred.";
							break;
					}

					cb(err);
				}, {
					enableHighAccuracy: true,
					timeout: 5000,
					maximumAge: 0
				});
			},

			stopSharing: function (room) {
				var _event = {
					chatRoom: room,
					type: 'shareLocation:stopSharing'
				};

				if (socket.socket) {
					socket.emit('chat', _event);
				}
			},

			sendCurrentLocation: function (currentChatRoom, cb) {
				if (typeof cb !== 'function') cb = function() {};
				if (!navigator.geolocation) return cb('Geolocation is not supported by this browser.');
				
				navigator.geolocation.getCurrentPosition(function (position) {
					var _event = {
						chatRoom: currentChatRoom.id,
						type: 'message:currentLocation',
						location: [position.coords.latitude, position.coords.longitude]
					};

					if (!currentChatRoom.events.length
						||	Math.floor((new Date() - new Date(parseInt(currentChatRoom.events[currentChatRoom.events.length -1].id.toString().slice(0,8), 16)*1000)) / 60000) > 60) {
						_event.startSession = true;
					}

					var _id = ObjectId().toString();
					User.events.create({id: AppAuth.currentUser.id}, _event,
					function (ev) {
						for (var i = 0; i < currentChatRoom.events.length; i++) {
						if (currentChatRoom.events[i].id === _id)
							currentChatRoom.events[i] = ev;
						};
					}, function (err) {
						console.error(err);
					}
					);
					$timeout(function () {
						_event.id = _id;
						currentChatRoom.events.push(_event);
						currentChatRoom.message.text = '';
						$("#chatBox").removeClass('expanded');
						cb(null);
					}, 0);
				}, function (error) {
					self.sharing = false;

					var err;
					switch(error.code) {
						case error.PERMISSION_DENIED:
							err = "User denied the request for Geolocation.";
							break;
						case error.POSITION_UNAVAILABLE:
							err = "Location information is unavailable.";
							break;
						case error.TIMEOUT:
							err = "The request to get user location timed out.";
							break;
						case error.UNKNOWN_ERROR:
							err = "An unknown error occurred.";
							break;
					}

					cb(err);
				});
			}
		}
	});