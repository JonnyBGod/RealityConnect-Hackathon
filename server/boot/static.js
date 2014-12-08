var path = require('path');

module.exports = function(server) {
  if (process.env.NODE_ENV !== 'development') return;

  var serveDir = server.loopback.static;

  server.use('/bower_components', serveDir(projectPath('bower_components')));
  server.use('/lbclient', serveDir(projectPath('client/lbclient')));
  
  server.use('/chat/styles', serveDir(projectPath('chat/.tmp/styles')));
  server.use('/chat', serveDir(projectPath('chat')));
  server.use('/chat', function(req, res) {
    res.sendFile(projectPath('chat/index.html'));
  });
  
  server.use('/widget/styles', serveDir(projectPath('widget/.tmp/styles')));
  server.use('/widget', serveDir(projectPath('widget')));
  server.use('/widget', function(req, res) {
    res.sendFile(projectPath('widget/index.html'));
  });

  server.use('/styles', serveDir(projectPath('website/.tmp/styles')));
  server.use('/', serveDir(projectPath('website')));
  server.use('/', serveDir(projectPath('client')));
  server.use('/', function(req, res) {
    res.sendFile(projectPath('website/index.html'));
  });
};

function projectPath(relative) {
  return path.resolve(__dirname, '../..', relative);
}