module.exports = function(User) {
  var async = require('async');
  var url = require('url');
  var og = require('open-graph');
  var gravatar = require('nodejs-gravatar');

  User.beforeCreate = function (next, _user, a) {
    console.log(_user);
    if (!_user.photo) {
      _user.photo = gravatar.imageUrl(_user.email);
      console.log(_user);
    }
    next();
  }

  User.on('attached', function() {
    var app = User.app;

     // first setup the mail datasource
    var mail = app.loopback.createDataSource({
      connector: app.loopback.Mail,
      transports: [{
        type: 'smtp',
        host: 'smtp.mandrillapp.com',
        secure: true,
        port: 465,
        auth: {
          user: 'admin@imoglobe.com',
          pass: '6LxJ21ectJ14UEGpKtsw3g'
        }
      }]
    });
     
    User.email.attachTo(mail);

    User.on('resetPasswordRequest', function (info) {
      console.log(info.user.email); // the email of the requested user
     
      var emailData = {
        user: info.user,
        accessToken: info.accessToken.id,
        resetPasswordHref: 'http://localhost:9000/reset-password/'+ info.accessToken.id
      };
      // this email should include a link to a page with a form to
      // change the password using the access token in the email
      User.email.send({
        to: info.user.email,
        from: 'noreply@caas.com',
        subject: 'Reset Your Password',
        text: app.loopback.template(__dirname + '/../templates/emails/resetPassword.txt.ejs')(emailData),
        html: app.loopback.template(__dirname + '/../templates/emails/resetPassword.html.ejs')(emailData)
      });
    });

    User.afterRemote('prototype.__create__events', function(ctx, _event, next) {
      User.app.pub.publish('chat', JSON.stringify(_event));

      next()
    });

    User.createAndLink = function(req, fn) {
      var userIdentity = app.models.userIdentity;

      var accessToken = req && req.accessToken;
      var credentials = req.body;

      User.findById(accessToken.userId, function (err, user) {
        if(err) {
          fn(err);
        } else {
          if (user) {
            credentials.photo = user.photo;
            credentials.contacts = user.contacts;
          }
          userIdentity.findOne({userId: accessToken.userId}, function (err, identity) {
            if(err) {
              fn(err);
            } else {
              User.deleteById(accessToken.userId, function (err) {
                if(err) {
                  fn(err);
                } else {
                  User.create(credentials, function (err, user) {
                    if(err) {
                      fn(err);
                    } else {
                      identity.userId = user.id;
                      identity.save(function (err) {
                        if(err) {
                          fn(err);
                        } else {
                          var options = {
                            type: 'email',
                            to: user.email,
                            from: 'noreply@caas.com',
                            subject: 'Thanks for Registering at CaaS',
                            text: 'Please verify your email address!',
                            template: __dirname + '/../templates/emails/verify.html.ejs',
                            redirect: 'http://localhost:9000/',
                            host: 'localhost:3000/api'
                          };
                         
                          user.verify(options, function () {
                            fn(err, user);
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }

    User.link = function(req, include, fn) {
      var userIdentity = app.models.userIdentity;

      var accessToken = req && req.accessToken;
      var credentials = req.body;

      User.findById(accessToken.userId, function (err, user) {
        if(err) {
          fn(err);
        } else {
          userIdentity.findOne({userId: accessToken.userId}, function (err, identity) {
            if(err) {
              fn(err);
            } else {
              User.deleteById(accessToken.userId, function (err) {
                if(err) {
                  fn(err);
                } else {
                  User.login(credentials, include, function (err, token) {
                    if(err) {
                      fn(err);
                    } else {
                      identity.userId = token.userId;
                      identity.save(function (err) {
                        if(err) {
                          fn(err);
                        } else {
                          fn(err, token);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }

    app.loopback.remoteMethod(
      User.createAndLink,
      {
        description: 'Create a new Account and link with current social login.',
        accepts: [
          {arg: 'credentials', type: 'object', required: true, http: {source: 'req'}}
        ],
        returns: {
          arg: 'accessToken', type: 'object', root: true, description:
            'The response body contains properties of the AccessToken created on login.\n' +
              'Depending on the value of `include` parameter, the body may contain ' +
              'additional properties:\n\n' +
              '  - `user` - `{User}` - Data of the currently logged in user. (`include=user`)\n\n'
        },
        http: {verb: 'POST', path: '/link'}
      }
    );

    app.loopback.remoteMethod(
      User.link,
      {
        description: 'Link Existing account with current social login.',
        accepts: [
          {arg: 'credentials', type: 'object', required: true, http: {source: 'req'}},
          {arg: 'include', type: 'string', http: {source: 'query' }, description:
            'Related objects to include in the response. ' +
              'See the description of return value for more details.'}
        ],
        returns: {
          arg: 'accessToken', type: 'object', root: true, description:
            'The response body contains properties of the AccessToken created on login.\n' +
              'Depending on the value of `include` parameter, the body may contain ' +
              'additional properties:\n\n' +
              '  - `user` - `{User}` - Data of the currently logged in user. (`include=user`)\n\n'
        },
        http: {verb: 'PUT', path: '/link'}
      }
    );

    User.prototype.createContact = function createContact (data, cb) {
      var self = this;

      if (self.contacts && self.contacts.indexOf(data.contactId) !== -1) {
        return cb(null, self.contacts);
      } else {
        if (!self.contacts) {
          self.contacts = [];
        }

        self.contacts.push(data.contactId);
        self.save(function (err) {
          if (err) {
            return cb(err);
          }
          return cb(err, self.contacts);
        });
      }
    };

    app.loopback.remoteMethod(User.prototype.createContact, {
      description: 'Create a new instance of the model and persist it into the data source',
      accepts: {arg: 'data', type: 'object', description: 'Model instance data', http: {source: 'body'}},
      returns: {arg: 'data', type: 'object', root: true},
      http: {verb: 'post', path: '/contacts'}
    });

    User.prototype.findContacts = function find (params, cb) {
      User.find({
        where: {
          id: {inq: this.contacts }
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
          return cb(err);
        }
        cb(err, res);
      });

    };

    // all ~ remoting attributes
    app.loopback.remoteMethod(User.prototype.findContacts, {
      description: 'Find all instances of the model matched by filter from the data source',
      accepts: {arg: 'filter', type: 'object', description: 'Filter defining fields, where, orderBy, offset, and limit'},
      returns: {arg: 'data', type: 'array', root: true},
      http: {verb: 'get', path: '/contacts'}
    });

    User.prototype.deleteContactById = function deleteById (id, cb) {
      console.log(id);
    };

    // deleteById ~ remoting attributes
    app.loopback.remoteMethod(User.prototype.deleteContactById, {
      description: 'Delete a model instance by id from the data source',
      accepts: {arg: 'contactId', type: 'any', description: 'Contact id', required: true},
      http: {verb: 'del', path: '/contacts/:contactId'}
    });

    User.prototype.getChatRoom = function getChatRoom (filter, cb) {
      var chatRoom = app.models.chatRoom;
      var Event = chatRoom.dataSource.connector.collection('event');
      var appPage = app.models.appPage;
      var self = this;

      appPage.findOne({
        where: {
          appId: filter.appId,
          'url.path': filter.appUrl
        }
      }, function (err, page) {
        if (err) {
          return cb(err);
        }

        if (page) {
          chatRoom.findOne({
            where: {
              and: [
                { users: { all: [self.id.toString(), filter.owner] }},
                { users: { size: 2 } },
                { appId: filter.appId },
                { appPageId: page.id }
              ]
            },
            include: ['app', 'appPage']
          }, function (err, room) {
            if (err) {
              return cb(err);
            }

            if (!room) {
              return cb(err, false);
            }
            var users = [];
            var roomsIds = [];

            for (var y = 0; y < room.users.length; y++) {
              if (users.indexOf(room.users[y]) === -1) {
                users.push(room.users[y]);
              }
            }
            roomsIds.push(room.id);

            async.parallel([
              function(callback){
                Event.aggregate([
                  { $match: { chatRoom: { "$in": roomsIds }, users: self.id.toString() } },
                  { $sort: { _id: 1 } },
                  { $group: {
                    _id: '$chatRoom',
                    events: { $last: { id: "$_id", sender: "$sender", chatRoom: "$chatRoom", type: "$type", text: "$text", url: "$url" } }
                  }}
                ], function (err, res) {
                  if (err) {
                    return callback(err, res);
                  }

                  if (!room.events) {
                    room.events = [];
                  }

                  for (var y = 0; y < res.length; y++) {
                    if (room.id.equals(res[y]._id)) {
                      room.events.push(res[y].events);
                    }
                  };

                  callback(err, null);
                });
              },
              function(callback){
                User.find({
                  where: {
                    id: {inq: users }
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
                    return callback(err, res);
                  }

                  for (var y = 0; y < room.users.length; y++) {
                    room.users[y] = res.filter(function (e) { return e.id.equals(room.users[y]) })[0];
                  };

                  callback(err, null);
                });
              }
            ], function(err, results) {
              if (err) {
                return cb(err);
              }

              var eventIds = [];

              for (var z = 0; z < room.events.length; z++) {
                eventIds.push(room.events[z].id);
              };

              cb(err, {chatRoom: room});
            });
          });
        } else {
          return cb(err, false);
        }
      });
    };

    app.loopback.remoteMethod(User.prototype.getChatRoom, {
      description: 'Find one instance of the model from the data source',
      accepts: {arg: 'filter', type: 'object', description: 'Filter defining fields, where, orderBy, offset, and limit', http: {source: 'query'}},
      returns: {arg: 'data', type: 'object', root: true},
      http: {verb: 'get', path: '/chatRoom'}
    });

    User.prototype.getChatRooms = function getChatRooms (cb) {
      var chatRoom = app.models.chatRoom;
      var Event = chatRoom.dataSource.connector.collection('event');
      var self = this;

      chatRoom.find({
        where: {
          $or: [
            { users: self.id.toString() },
            { oldUsers: self.id.toString() }
          ]
        },
        include: ['app', 'appPage']
      }, function (err, rooms) {
        if (err) {
          return cb(err);
        }

        var users = [];
        var roomsIds = [];
        for (var i = 0; i < rooms.length; i++) {
          //rooms[i].users.splice(rooms[i].users.indexOf(self.id.toString()), 1);
          for (var y = 0; y < rooms[i].users.length; y++) {
            if (users.indexOf(rooms[i].users[y]) === -1) {
              users.push(rooms[i].users[y]);
            }
          }
          if (rooms[i].oldUsers) {
            for (var y = 0; y < rooms[i].oldUsers.length; y++) {
              if (users.indexOf(rooms[i].oldUsers[y]) === -1) {
                users.push(rooms[i].oldUsers[y]);
              }
            }
          }
          roomsIds.push(rooms[i].id);
        };

        async.parallel([
          function(callback){
            Event.aggregate([
              { $match: { chatRoom: { "$in": roomsIds }, users: self.id.toString() } },
              { $sort: { _id: 1 } },
              { $group: {
                _id: '$chatRoom',
                events: { $last: { id: "$_id", sender: "$sender", chatRoom: "$chatRoom", type: "$type", text: "$text", url: "$url" } }
              }}
            ], function (err, res) {
              if (err) {
                return callback(err, res);
              }

              for (var i = 0; i < rooms.length; i++) {
                if (!rooms[i].events) {
                  rooms[i].events = [];
                }

                for (var y = 0; y < res.length; y++) {
                  if (rooms[i].id.equals(res[y]._id)) {
                    rooms[i].events.push(res[y].events);
                  }
                };
              };

              callback(err, null);
            });
          },
          function(callback){
            User.find({
              where: {
                id: {inq: users }
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
                return callback(err, res);
              }

              for (var i = 0; i < rooms.length; i++) {
                for (var y = 0; y < rooms[i].users.length; y++) {
                  rooms[i].users[y] = res.filter(function (e) { return e.id.equals(rooms[i].users[y]) })[0];
                };
                if (rooms[i].oldUsers) {
                  for (var y = 0; y < rooms[i].oldUsers.length; y++) {
                    rooms[i].oldUsers[y] = res.filter(function (e) { return e.id.equals(rooms[i].oldUsers[y]) })[0];
                  };
                }
              };

              callback(err, null);
            });
          }
        ], function(err, results) {
          if (err) {
            return cb(err);
          }

          var eventIds = [];
          for (var i = 0; i < rooms.length; i++) {
            for (var z = 0; z < rooms[i].events.length; z++) {
              eventIds.push(rooms[i].events[z].id);
            };
          };

          cb(err, {chatRooms: rooms});
        });
      });
    };

    app.loopback.remoteMethod(User.prototype.getChatRooms, {
      description: 'Find all instances of the model from the data source',
      returns: {arg: 'data', type: 'object', root: true},
      http: {verb: 'get', path: '/chatRooms'}
    });

    User.prototype.createChatRoom = function createChatRoom (data, cb) {
      var chatRoom = app.models.chatRoom;

      var self = this;
      
      if (data.users.indexOf(self.id.toString()) === -1) {
        data.users.push(self.id.toString());
      }

      chatRoom.find({
        where: {
          and: [
            { users: { all: data.users } }, 
            { users: { size: data.users.length } },
            { appId: null }
          ]
        }
      }, function (err, res) {
        if (err) {
          return cb(err);
        }

        if (res.length) {
          cb(err, res[0]);
        } else {
          chatRoom.create({
            users: data.users
          }, function (err, room) {
            if (err) {
              return cb(err);
            }

            room.users.splice(room.users.indexOf(self.id.toString()), 1);
            
            User.find({
              where: {
                id: {inq: room.users }
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
                return cb(err);
              }

              for (var y = 0; y < room.users.length; y++) {
                room.users[y] = res.filter(function (e) { return e.id.equals(room.users[y]) })[0];
              };

              cb(err, {chatRooms: room});
            });
          });
        }
      });
    };

    app.loopback.remoteMethod(User.prototype.createChatRoom, {
      description: 'Create a new instance of the model and persist it into the data source',
      accepts: {arg: 'data', type: 'object', description: 'Model instance data', http: {source: 'body'}},
      returns: {arg: 'data', type: 'object', root: true},
      http: {verb: 'post', path: '/chatRoom'}
    });

    User.prototype.startConversation = function startConversation (data, cb) {
      var chatRoom = app.models.chatRoom;
      var Event = app.models.Event;
      var appPage = app.models.appPage;

      var self = this;
      
      data.appUrl = url.parse(data.appUrl);

      if (data.users.indexOf(self.id.toString()) === -1) {
        data.users.push(self.id.toString());
      }

      appPage.findOne({
        where: {
          appId: data.appId,
          'url.path': data.appUrl.path
        }
      }, function (err, page) {
        if (err) {
          return cb(err);
        }

        if (page) {
          data.appPageId = page.id;

          if (!page.meta || !page.updated || (new Date().getTime() - page.updated.getTime())/(1000*60*60*24) > 1) {
            appPage.scrape(page, function (err) {
              if (err) {
                console.error(err);
              }
            });
          }

          chatRoom.create({
            users: data.users,
            appId: data.appId,
            appPageId: data.appPageId
          }, function (err, room) {
            if (err) {
              return cb(err);
            }

            if (!data.event.sender) {
              data.event.sender = self.id;
            }

            if (!data.event.chatRoom) {
              data.event.chatRoom = room.id;
            }

            Event.create(data.event, function (err, _event) {
              if (err) {
                return cb(err);
              }

              room.app(function (err, _app) {
                var _room = {
                  users: room.users,
                  id: room.id,
                  appId: room.appId,
                  appPageId: room.appPageId,
                  events: [],
                  app: _app,
                  appPage: page
                };
                app.pub.publish('chat', JSON.stringify({
                  type: 'startConversation',
                  chatRoom: _room,
                  event: _event
                }));
              });

              cb(err, {chatRoom: room});
            });
          });
        } else {
          appPage.create({
            appId: data.appId,
            url: data.appUrl
          }, function (err, page) {
            if (err) {
              return cb(err);
            }

            data.appPageId = page.id;

            appPage.scrape(page, function (err) {
              if (err) {
                console.error(err);
              }
            });

            chatRoom.create({
              users: data.users,
              appId: data.appId,
              appPageId: data.appPageId
            }, function (err, room) {
              if (err) {
                return cb(err);
              }

              if (!data.event.sender) {
                data.event.sender = self.id;
              }

              if (!data.event.chatRoom) {
                data.event.chatRoom = room.id;
              }

              Event.create(data.event, function (err, _event) {
                if (err) {
                  return cb(err);
                }

                room.app(function (err, _app) {
                  var _room = {
                    users: room.users,
                    id: room.id,
                    appId: room.appId,
                    appPageId: room.appPageId,
                    events: [],
                    app: _app,
                    appPage: page
                  };
                  app.pub.publish('chat', JSON.stringify({
                    type: 'startConversation',
                    chatRoom: _room,
                    event: _event
                  }));
                });

                cb(err, {chatRoom: room});
              });
            });
          });
        }
      });
    };

    app.loopback.remoteMethod(User.prototype.startConversation, {
      description: 'Create a new instance of the model and persist it into the data source',
      accepts: {arg: 'data', type: 'object', description: 'Model instance data', http: {source: 'body'}},
      returns: {arg: 'data', type: 'object', root: true},
      http: {verb: 'post', path: '/startConversation'}
    });

    User.populateContacts = function (userId, newContacts, cb) {
      var userIdentity = app.models.userIdentity;

      var newContactsIds = [];
      for (var i = newContacts.length - 1; i >= 0; i--) {
        newContactsIds.push(newContacts[i].id);
      };

      userIdentity.find({
        where: {
          externalId: {inq: newContactsIds }
        },
        fields: {
          id: true,
          userId: true
        },
        include: ['user']
      }, function (err, res) {
        if (err) {
          return cb(err);
        }

        User.findById(userId, function (err, user) {
          if (err) {
            return cb(err);
          }

          if (user.contacts === undefined) {
            user.contacts = [];
          }

          var contactsToAdd = res.filter(function (e) { return user.contacts.indexOf(e.userId.toString()) === -1 });

          for (var i = contactsToAdd.length - 1; i >= 0; i--) {
            user.contacts.push(contactsToAdd[i].userId.toString());

            if (contactsToAdd.user.contacts === undefined) {
              contactsToAdd.user.contacts = [];
            }
            contactsToAdd.user.contacts.push(userId.toString());
            contactsToAdd.user.save();
          };

          user.save();

          cb(null);
        });
      });
    }

    User.prototype.getParseUrl = function getParseUrl (_url, cb) {
      og(_url, function(err, meta) {
        if (err) {
          return cb(err);
        }
        cb(null, meta);
      });
    };

    app.loopback.remoteMethod(User.prototype.getParseUrl, {
      description: 'Find all instances of the model from the data source',
      accepts: {arg: 'url', type: 'string', description: 'Url to be scraped.', http: {source: 'query'}},
      returns: {arg: 'data', type: 'object', root: true},
      http: {verb: 'get', path: '/parseUrl'}
    });
  });
}
