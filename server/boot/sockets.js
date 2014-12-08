module.exports = function startSocket(server) {
	function findForRequest (req, options, cb) {
		var id = tokenIdForRequest(req, options);

		if(id) {
			server.models.AccessToken.findById(id, function(err, token) {
				if(err) {
				    cb(err);
				} else if(token) {
				    token.validate(function(err, isValid) {
				      	if(err) {
				        	cb(err);
				      	} else if(isValid) {
				        	cb(null, token);
				      	} else {
					        var e = new Error('Invalid Access Token');
					        e.status = e.statusCode = 401;
					        cb(e);
				      	}
				    });
				} else {
					var e = new Error('Missing Access Token');
			        e.status = e.statusCode = 401;
			        cb(e);
				}
			});
		} else {
			process.nextTick(function() {
			  	var e = new Error('Missing Access Token');
		        e.status = e.statusCode = 401;
		        cb(e);
			});
		}
	}

	function tokenIdForRequest(req, options) {
	  var query = options.query || [];
	  var headers = options.headers || [];
	  var i = 0;
	  var length;
	  var id;

	  query = query.concat(['access_token']);
	  headers = headers.concat(['X-Access-Token', 'authorization']);

	  for(length = query.length; i < length; i++) {
	    id = req.query[query[i]];

	    if(typeof id === 'string') {
	      return id;
	    }
	  }

	  for(i = 0, length = headers.length; i < length; i++) {
	    id = req.headers[headers[i]];

	    if(typeof id === 'string') {
	      // Add support for oAuth 2.0 bearer token
	      // http://tools.ietf.org/html/rfc6750
	      if (id.indexOf('Bearer ') === 0) {
	        id = id.substring(7);
	        // Decode from base64
	        var buf = new Buffer(id, 'base64');
	        id = buf.toString('utf8');
	      }
	      return id;
	    }
	  }
	  return null;
	}

	server.io.use(function (socket, next) {
	  	if (socket.handshake.accessToken !== undefined) return next();
		findForRequest(socket.handshake, {params: []}, function(err, token) {
		  socket.handshake.accessToken = token || null;
		  next(err);
		});
	});

	var chatRoom = server.models.chatRoom;
	var User = server.models.user;
	var Event = server.models.Event;
	var ObjectID = Event.dataSource.ObjectID;

	server.io.on('connection', function (socket) {
		socket.userId = socket.handshake.accessToken.userId;
	    //if(!socket.client.request.user) return;

	    /*
	     When the user sends a chat message, publish it to everyone (including myself) using
	     Redis' 'pub' client we created earlier.
	     Notice that we are getting user's name from session.
	     */
	    socket.on('chat', function (data) {
	    	//console.log(server.io.sockets.adapter.nsp.sockets);
	    	try {
			  var _data = JSON.parse(data);
			} catch (e) {
			  var _data = data;
			}
			_data.sender = socket.handshake.accessToken.userId;

			server.pub.publish('chat', JSON.stringify(_data));
	    });

	    /*
	     When a user joins the channel, publish it to everyone (including myself) using
	     Redis' 'pub' client we created earlier.
	     Notice that we are getting user's name from session.
	     */
	    socket.on('join', function () {	
	        var reply = JSON.stringify({action: 'control', user: socket.handshake.accessToken.userId, msg: ' joined the channel' });
	        server.pub.publish('chat', reply);
	    });

	    socket.on('disconnect', function () {
		});
	});

	/*
     Use Redis' 'sub' (subscriber) client to listen to any message from Redis to server.
     When a message arrives, send it back to browser using socket.io
     */
    server.sub.on('message', function (channel, message) {
    	var data = JSON.parse(message.toString());
    	
		if (channel === 'chat') {
			if (data.type !== 'startConversation') {
				chatRoom.findById(data.chatRoom, function (err, room) {
					if (err) {
						return console.error(err);
					}

					if (room) {
						if (data.seen) {
							if (!room.seen) {
								room.seen = [data.seen];
							} else if (room.seen.filter(function (e) { return e.user === data.seen.user }).length) {
								room.seen.filter(function (e) { return e.user === data.seen.user })[0].date = data.seen.date;
							} else {
								room.seen.push(data.seen);
							}
							room.save();
						}

						if (data.type.indexOf('update') === -1 && !data.users) {
							data.users = room.users
							// HACK fix for json.parse unicode escaping
							if (data.text) {
								data.text = decodeURIComponent(escape(data.text));
							}
							
							Event.create(data, function (err, _event) {
				              	if (err) {
				                	return console.log(err);
				              	}

				              	room.users.splice(room.users.indexOf(data.sender), 1);
				              	data = _event;

								var sockets = server.io.sockets.adapter.nsp.sockets.filter(function (e) { return room.users.indexOf(e.userId.toString()) !== -1 });
								
								for (var i = 0; i < sockets.length; i++) {
									sockets[i].emit(channel, data);
								};
				            });
						} else if (data.type.indexOf('notification') !== -1) {
							var sockets = server.io.sockets.adapter.nsp.sockets.filter(function (e) { return room.users.indexOf(e.userId.toString()) !== -1 });
							
							if (data.removedUser) {
								sockets = sockets.concat(server.io.sockets.adapter.nsp.sockets.filter(function (e) { return e.userId.toString() === data.removedUser }));
							}
							
							for (var i = 0; i < sockets.length; i++) {
								sockets[i].emit(channel, data);
							};
						} else {
							room.users.splice(room.users.indexOf(data.sender), 1);

							var sockets = server.io.sockets.adapter.nsp.sockets.filter(function (e) { return room.users.indexOf(e.userId.toString()) !== -1 });
							
							for (var i = 0; i < sockets.length; i++) {
								sockets[i].emit(channel, data);
							};
						}
					}
				});
			} else {
				var sockets = server.io.sockets.adapter.nsp.sockets.filter(function (e) { return data.chatRoom.users.indexOf(e.userId.toString()) !== -1 });
				
				//data.chatRoom.users.splice(data.chatRoom.users.indexOf(data.event.sender), 1);

				User.find({
	              where: {
	                id: {inq: data.chatRoom.users }
	              },
	              fields: {
	                id: true,
	                name: true,
	                photo: true,
	                password: false,
	                verificationToken: false,
	                contacts: false
	              }
	            }, function (err, res) {
					if (err) {
						return console.error(err, res);
					}

					for (var y = 0; y < data.chatRoom.users.length; y++) {
						data.chatRoom.users[y] = res.filter(function (e) { return e.id.equals(data.chatRoom.users[y]) })[0];
					};

	              	for (var i = 0; i < sockets.length; i++) {
						sockets[i].emit(channel, data);
					};
	            });
			}
		}
    });
};