if (process.env.NODE_ENV !== 'development') require('newrelic');

var loopback = require('loopback');
var boot = require('loopback-boot');

var path = require('path'),
  fs = require("fs");

var app = module.exports = loopback();

/*
	Remove if socket.io is not needed
 */
var redis = require('redis');

app.io = require('socket.io')();
app.sub = redis.createClient(15574, 'pub-redis-15574.us-east-1-4.4.ec2.garantiadata.com', {return_buffers: true});
app.sub.auth('1q2w3e4r');
app.pub = redis.createClient(15574, 'pub-redis-15574.us-east-1-4.4.ec2.garantiadata.com', {return_buffers: true});
app.pub.auth('1q2w3e4r');
app.sub.setMaxListeners(0);
app.sub.subscribe('chat');

/* Stop remove */

app.use(loopback.token({model: app.models.AccessToken}));
app.use(loopback.json());
app.use(loopback.urlencoded({ extended: false }));
// -- Add your pre-processing middleware here --
if (process.env.NODE_ENV === 'development') {
  app.use(require('connect-livereload')({
    port: 35729
  }));
}

// Create an instance of PassportConfigurator with the app instance
var PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
app.passportConfigurator = new PassportConfigurator(app);

// boot scripts mount components like REST API
boot(app, __dirname);

var server = app.listen(function() {
  app.emit('started', app.get('url'));
  console.log('Web server listening at: %s', app.get('url'));
});

app.io.attach(server);
