module.exports = function(appPage) {
  var og = require('open-graph');

  appPage.scrape = function (page, cb) {
    //og(page.url.href, function(err, meta){
    og('http://ujkk8b52147e.jonnybgod.koding.io/demo.html', function(err, meta) {
      if (err) {
        return cb(err);
      }

      page.meta = meta;
      page.updated = new Date();
      page.save();

      cb(null);
    });
  }
}
