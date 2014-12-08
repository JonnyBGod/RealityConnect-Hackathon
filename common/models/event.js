module.exports = function(Event) {

  Event.beforeCreate = function (next, _event, a) {
    Event.app.models.chatRoom.findById(JSON.parse(JSON.stringify(_event)).chatRoom, function (err, room) {
      if (err) {
        console.error(err);
        return next(err);
      }
      
      _event.users = room.users;
      next();
    });
  }
}