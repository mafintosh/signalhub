var http = require('http')
var cors = require('corsify')
var collect = require('stream-collector')
var pump = require('pump')
var limiter = require('size-limit-stream')
var eos = require('end-of-stream')

var TTL = 30 * 1000

module.exports = function () {
  var channels = {}

  var get = function (channel) {
    if (channels[channel]) return channels[channel]
    channels[channel] = {name: channel, messages: [], subscribers: []}
    return channels[channel]
  }

  var server = http.createServer(cors(function (req, res) {
    if (req.url.slice(0, 4) !== '/v1/') {
      res.statusCode = 404
      res.end()
      return
    }

    var channel = get(req.url.slice(4).split('?')[0])

    if (req.method === 'POST') {
      collect(pump(req, limiter(64 * 1024)), function (err, data) {
        if (err) return

        server.emit('publish', channel.name, data)
        data = Buffer.concat(data).toString()

        channel.messages.push([Date.now() + TTL, data])
        for (var i = 0; i < channel.subscribers.length; i++) {
          channel.subscribers[i].write('data: ' + data + '\n\n')
        }
        res.end()
      })
      return
    }

    if (req.method === 'GET') {
      server.emit('subscribe', channel.name)
      channel.subscribers.push(res)
      for (var i = channel.messages.length - 1; i >= 0; i--) {
        res.write('data: ' + channel.messages[i][1] + '\n\n')
      }
      eos(res, function () {
        channel.subscribers.splice(channel.subscribers.indexOf(res), 1)
        if (!channel.subscribers.length && !channel.messages.length) delete channels[channel.name]
      })
      return
    }

    res.statusCode = 404
    res.end()
  }))

  var interval

  server.on('listening', function () {
    interval = setInterval(function () {
      var names = Object.keys(channels)
      var now = Date.now()
      for (var i = 0; i < names.length; i++) {
        var ch = channels[names[i]]
        while (ch.messages.length && ch.messages[0][0] < now) ch.messages.shift()
        if (!ch.subscribers.length && !ch.messages.length) delete channels[ch.name]
      }
    }, 10000)
  })

  server.on('close', function () {
    if (interval) clearInterval(interval)
  })

  return server
}
