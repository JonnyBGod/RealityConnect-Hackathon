module.exports = function(server) {
	var url = require('url');
	var Cookies = require( "cookies" )
	var userIdentity = server.models.userIdentity;
	var User = server.models.user;
	var FB = require('fbgraph');
	FB.setAppSecret('4f416de47c454808da20002667469fc5');

	server.get('/auth/account/facebook', function(req, res, next) {
		var cookies = new Cookies(req, res);

		userIdentity.findOne({where: {
			provider: 'facebook-login',
			userId: cookies.get("userId")
		}}, function (err, identity) {
			if (err) {
				console.error(err);
			}
			if (identity) {
				FB.get('/me/friends', {
					access_token: identity.credentials.accessToken
				}, function(err, res) {
					if (err) {
						console.error(err);
					}

					if (res.data.length) {
						User.populateContacts(cookies.get("userId"), res.data, function (err) {
							if (err) {
								console.error(err);
							}
						});
					}
				});
			}
		});

		var referer = url.parse(req.headers.referer);

		if (referer.path.indexOf('chat') !== -1) {
			res.redirect(referer.protocol +'//'+ referer.host +'/chat/');
		} else if (referer.path.indexOf('widget') !== -1) {
			res.redirect(referer.protocol +'//'+ referer.host +'/widget/');
		} else {
			res.redirect(referer.protocol +'//'+ referer.host +'/');
		}
	});

	server.get('/widget-auth/account/facebook', function(req, res, next) {
	  //workaround for loopback-password 
	  //without this angular-loopback would make incorrect authorization header
	  /*userIdentity.findOne({where: {
	    provider: 'facebook-login',
	    userId: req.session.passport.user
	  }}, function (err, identity) {
	    if (err) {
	      return console.error(err);
	    }
	    if (identity) {
	      FB.get('/me/friends', {
	        access_token: identity.credentials.accessToken
	      }, function(err, res) {
	        if (err) {
	          return console.error(err);
	        }
	        console.log('facebook-widget-login', res);
	      });
	    }
	  });*/

		res.redirect('/widget/auth/loginSuccess.html');
	});

	server.get('/auth/account/google', function(req, res, next) {
	  res.redirect('/');
	});

	server.get('/auth/account', function(req, res, next) {
	  res.redirect('/');
	});

	server.get('/auth/failure', function(req, res, next) {
	  res.redirect('/');
	});
};
