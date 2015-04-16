var ess = require('event-source-stream')
var nets = require('nets')

var noop = function () {}

module.exports = function (lobby) {
  var that = {}

  if (lobby.indexOf('://') === -1) lobby = 'http://' + lobby

  that.subscribe = function (channel) {
    return ess(lobby + '/v1/' + channel, {json: true})
  }

  that.broadcast = function (channel, message, cb) {
    if (!cb) cb = noop
    nets({
      method: 'POST',
      json: message,
      url: lobby + '/v1/' + channel
    }, function (err, res) {
      if (err) return cb(err)
      if (res.statusCode !== 200) return cb(new Error('Bad status: ' + res.statusCode))
      cb()
    })
  }

  return that
}
