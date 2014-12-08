exports.config = {
  app_name : ['ori'],
  license_key : 'fc8201bbacbd2865d46d6a6cd53a5274b470b43d',
  logging : {
    level : 'info'
  },
  rules : {
    ignore : [
      '^/socket.io/.*/xhr-polling',
      '^/heartbeat.html'
    ]
  }
};