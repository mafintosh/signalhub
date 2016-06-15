#!/usr/bin/env node

var fs = require('fs')
var minimist = require('minimist')
var argv = minimist(process.argv.slice(2), {
  alias: {
    port: 'p',
    host: 'h',
    'max-broadcasts': 'm',
    key: 'k',
    cert: 'c',
    version: 'v',
    quiet: 'q'
  },
  boolean: [ 'version', 'quiet' ],
  default: {
    port: process.env.PORT || 80
  }
})

var cmd = argv._[0]

if (argv.version) {
  console.log(require('./package.json').version)
  return
}

if (cmd === 'listen') {
  var max = Number(argv['max-broadcasts']) || 0
  var server = require('./server')({
    maxBroadcasts: max,
    key: argv.key && fs.readFileSync(argv.key),
    cert: argv.cert && fs.readFileSync(argv.cert),
    host: argv.host
  })

  if (!argv.quiet) {
    server.on('subscribe', function (channel) {
      console.log('subscribe: %s', channel)
    })

    server.on('publish', function (channel, message) {
      console.log('broadcast: %s (%d)', channel, message.length)
    })
  }

  server.listen(argv.port, argv.host, function () {
    console.log('signalhub listening on port %d', server.address().port)
  })
  return
}

if (cmd === 'subscribe') {
  if (argv._.length < 3) return console.error('Usage: signalhub subscribe [app] [channel]')
  var client = require('./')(argv._[1], argv.host + ':' + argv.port || 'localhost:8080')
  client.subscribe(argv._[2]).on('data', function (data) {
    if (!argv.quiet) {
      console.log(data)
    }
  })
  return
}

if (cmd === 'broadcast') {
  if (argv._.length < 4) return console.error('Usage: signalhub broadcast [app] [channel] [json-message]')
  var client = require('./')(argv._[1], argv.host + ':' + argv.port || 'localhost:8080')
  client.broadcast(argv._[2], JSON.parse(argv._[3]))
  return
}

console.error('Usage: signalhub listen|subscribe|broadcast')
