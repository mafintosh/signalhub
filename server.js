var http = require('http')
var https = require('https')
var corsify = require('corsify')
var collect = require('stream-collector')
var pump = require('pump')
var iterate = require('random-iterate')
var limiter = require('size-limit-stream')
var eos = require('end-of-stream')

var flushHeaders = function (res) {
  if (res.flushHeaders) {
    res.flushHeaders()
  } else {
    if (!res._header) res._implicitHeader()
    res._send('')
  }
}

module.exports = function (opts) {
  var channels = {}
  var maxBroadcasts = (opts && opts.maxBroadcasts) || Infinity

  var get = function (channel) {
    if (channels[channel]) return channels[channel]
    channels[channel] = {name: channel, subscribers: []}
    return channels[channel]
  }

  var cors = corsify({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    "Access-Control-Allow-Headers": "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization"
  })

  var onRequest = cors(function (req, res) {
    if (req.url === '/') {
      res.end(JSON.stringify({name: 'signalhub', version: require('./package').version}, null, 2) + '\n')
      return
    }

    if (req.url.slice(0, 4) !== '/v1/') {
      res.statusCode = 404
      res.end()
      return
    }

    var name = req.url.slice(4).split('?')[0]

    if (req.method === 'POST') {
      collect(pump(req, limiter(64 * 1024)), function (err, data) {
        if (err) return res.end()
        if (!channels[name]) return res.end()
        var channel = get(name)

        server.emit('publish', channel.name, data)
        data = Buffer.concat(data).toString()

        var ite = iterate(channel.subscribers)
        var next
        var cnt = 0

        while ((next = ite()) && cnt++ < maxBroadcasts) {
          next.write('data: ' + data + '\n\n')
        }

        res.end()
      })
      return
    }

    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')

      var app = name.split('/')[0]
      var channelNames = name.slice(app.length + 1)

      channelNames.split(',').forEach(function (channelName) {
        var channel = get(app + '/' + channelName)
        server.emit('subscribe', channel.name)
        channel.subscribers.push(res)
        eos(res, function () {
          var i = channel.subscribers.indexOf(res)
          if (i > -1) channel.subscribers.splice(i, 1)
          if (!channel.subscribers.length && channel === channels[channel.name]) delete channels[channel.name]
        })
      })

      flushHeaders(res)
      return
    }

    res.statusCode = 404
    res.end()
  })

  var server = ((opts && opts.key) ? https : http).createServer(opts)
  server.on('request', onRequest)

  return server
}
