module.exports = function(ChatRoom) {
  var async = require('async');

  ChatRoom.on('attached', function() {
    var app = ChatRoom.app;

    ChatRoom.prototype.addUsers = function addUsers (req, cb) {
      if (!req.accessToken || !req.accessToken.userId) {
        var err = new Error('could not find accessToken');
        err.statusCode = 401;
        return cb(err);
      }
      var chatRoom = ChatRoom.dataSource.connector.collection('chatRoom');
      var User = app.models.user;
      var self = this;

      chatRoom.update({ _id: self.id, users: req.accessToken.userId.toString() }, {
        $pullAll: { oldUsers: req.body.users },
        $addToSet: { users: { $each: req.body.users } }
      }, function (err, res) {
        if (err) console.error(err);

        if (res === 0) {
          var err = new Error('No chatRoom found for id and user');
          err.statusCode = 400;
          return cb(err);
        }

        for (var i = 0; i < req.body.users.length; i++) {
          if (self.users.indexOf(req.body.users[i].toString()) === -1) {
            self.users.push(req.body.users[i].toString());
          }
        }

        User.find({
          where: {
            id: {inq: self.users }
          },
          fields: {
            id: true,
            name: true,
            photo: true
          }
        }, function (err, users) {
          if (err) {
            console.error(err);
          } else {
            console.log(users);
            var _events = [];
            async.each(req.body.users, function (user, callback) {
              self.event.create({
                type: 'notification:addUsers',
                text: users.filter(function (e) { return e.id.toString() === user.toString() })[0].name +' joined conversation.',
                users: users,
                sender: req.accessToken.userId
              }, function (err, _event) {
                if (err) {
                  console.error(err);
                  callback(err);
                } else {
                  _events.push(_event);
                  callback();
                  //app.pub.publish('chat', JSON.stringify(_event));
                }
              });
            }, function (err) {
                if (err) {
                  console.err(err);
                } else {
                  
                  app.pub.publish('chat', JSON.stringify({
                    type: 'startConversation',
                    chatRoom: self,
                    events: _events
                  }));
                }
            });

            cb(err, users);
          }
        });
      });
    };

    app.loopback.remoteMethod(ChatRoom.prototype.addUsers, {
      description: 'Add users to ChatRoom',
      accepts: {arg: 'data', type: 'object', description: 'Model instance data', http: {source: 'req'}},
      returns: {arg: 'data', type: 'array', description: 'Array of new users', root: true},
      http: {verb: 'put', path: '/users'}
    });

    ChatRoom.prototype.removeUser = function removeUser (req, cb) {
      if (!req.accessToken || !req.accessToken.userId) {
        var err = new Error('could not find accessToken');
        err.statusCode = 401;
        return cb(err);
      }
      var chatRoom = ChatRoom.dataSource.connector.collection('chatRoom');
      var User = app.models.user;
      var self = this;

      console.log(req);

      chatRoom.update({ _id: self.id, users: req.accessToken.userId.toString() }, {
        $pull: { users: req.params.userId },
        $addToSet: { oldUsers: req.params.userId }
      }, function (err, res) {
        if (err) console.error(err);

        if (res === 0) {
          var err = new Error('No chatRoom found for id and user');
          err.statusCode = 400;
          return cb(err);
        }

        User.findOne({
          where: {
            id: req.params.userId
          },
          fields: {
            id: true,
            name: true
          }
        }, function (err, user) {
          if (err) {
            console.error(err);
          } else {
            self.users.splice(self.users.indexOf(req.params.userId), 1);

            self.event.create({
              type: 'notification:removeUser',
              text: user.name +' left conversation.',
              users: self.users,
              sender: req.accessToken.userId
            }, function (err, _event) {
              if (err) {
                console.error(err);
              } else {
                _event.removedUser = user.id.toString();
                app.pub.publish('chat', JSON.stringify(_event));
              }
            });
          }
        });

        cb(err, res);
      });
    };

    app.loopback.remoteMethod(ChatRoom.prototype.removeUser, {
      description: 'Add users to ChatRoom',
      accepts: {arg: 'userId', type: 'string', description: 'User id string to be removed', required: true, http: {source: 'req'}},
      returns: {arg: 'data', type: 'Number', description: 'Number of affacted chatRooms', root: true},
      http: {verb: 'del', path: '/user/:userId'}
    });

    ChatRoom.prototype.changeName = function changeName (req, cb) {
      if (!req.accessToken || !req.accessToken.userId) {
        var err = new Error('could not find accessToken');
        err.statusCode = 401;
        return cb(err);
      }
      var chatRoom = ChatRoom.dataSource.connector.collection('chatRoom');
      var User = app.models.user;
      var self = this;

      chatRoom.update({ _id: self.id, users: req.accessToken.userId.toString() }, {
        $set: { name: req.body.name }
      }, function (err, res) {
        if (err) console.error(err);

        if (res === 0) {
          var err = new Error('No chatRoom found for id and user');
          err.statusCode = 400;
          return cb(err);
        }

        User.findOne({
          where: {
            id: req.accessToken.userId
          },
          fields: {
            id: true,
            name: true,
            photo: true
          }
        }, function (err, user) {
          if (err) {
            console.error(err);
          } else {

            self.event.create({
              type: 'notification:changeName',
              text: user.name +' changed room name to: '+ req.body.name ,
              users: self.users,
              sender: req.accessToken.userId
            }, function (err, _event) {
              if (err) {
                console.error(err);
              } else {
                app.pub.publish('chat', JSON.stringify(_event));
              }
            });

            cb(err, {name: req.body.name});
          }
        });
      });
    };

    app.loopback.remoteMethod(ChatRoom.prototype.changeName, {
      description: 'Change chatRoom name',
      accepts: {arg: 'data', type: 'object', description: 'Model instance data', http: {source: 'req'}},
      returns: {arg: 'name', type: 'string', description: 'New chatRoom name.', root: true},
      http: {verb: 'put', path: '/name'}
    });
  });
}