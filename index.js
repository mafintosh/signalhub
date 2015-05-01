var ess = require('event-source-stream')
var nets = require('nets')

var noop = function () {}

module.exports = function (url, app) {
  if (!url) throw new Error('signalhub url required')
  if (!app) throw new Error('app name required as 2nd argument')
  var that = {}

  if (url.indexOf('://') === -1) url = 'http://' + url

  that.subscribe = function (channel) {
    var endpoint = url + '/v1/' + app + '/'

    if (channel instanceof Array) {
      endpoint += channel.join(',')
    } else {
      endpoint += channel
    }

    return ess(endpoint, {json: true})
  }

  that.broadcast = function (channel, message, cb) {
    if (!cb) cb = noop
    nets({
      method: 'POST',
      json: message,
      url: url + '/v1/' + app + '/' + channel
    }, function (err, res) {
      if (err) return cb(err)
      if (res.statusCode !== 200) return cb(new Error('Bad status: ' + res.statusCode))
      cb()
    })
  }

  return that
}
