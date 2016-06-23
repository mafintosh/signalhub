var server = require('./server')()
var client = require('./')
var tape = require('tape')

server.listen(9000, function () {
  tape('subscribe', function (t) {
    var c = client('app', ['localhost:9000'])

    c.subscribe('hello').on('data', function (message) {
      t.same(message, {hello: 'world'})
      t.end()
      c.close()
    }).on('open', function () {
      c.broadcast('hello', {hello: 'world'})
    })

  })

  tape('subscribe with trailing /', function (t) {
    var c = client('app', ['localhost:9000/'])

    c.subscribe('hello').on('data', function (message) {
      t.same(message, {hello: 'world'})
      t.end()
      c.close()
    }).on('open', function () {
      c.broadcast('hello', {hello: 'world'})
    })

  })

  tape('subscribe to many', function (t) {
    var c = client('app', ['localhost:9000'])
    var msgs = ['stranger', 'friend']

    c.subscribe(['hello', 'goodbye']).on('data', function (message) {
      t.same(message, {msg: msgs.shift()})
      if (msgs.length === 0) {
        c.close(function () {
          t.equal(c.subscribers.length, 0, 'all subscribers closed')
          t.end()
        })
      }
    }).on('open', function () {
      c.broadcast('hello', { msg: 'stranger'}, function () {
        c.broadcast('goodbye', { msg: 'friend'})
      })
    })
  })

  tape('close multiple', function (t) {
    var c = client('app', ['localhost:9000'])
    var msgs = ['stranger', 'friend']

    c.subscribe(['hello', 'goodbye'])
    c.subscribe(['hi', 'bye'])
    c.close(function () {
      t.equal(c.subscribers.length, 0, 'all subscribers closed')
      t.end()
    })
  })

  tape('subscribe to channels with slash in the name', function (t) {
    var c = client('app', ['localhost:9000'])

    c.subscribe('hello/people').on('data', function (message) {
      t.same(message, [1, 2, 3])
      t.end()
      c.close()
    }).on('open', function () {
      c.broadcast('hello/people', [1, 2, 3])
    })
  })

  tape('open emitted with multiple hubs', function (t) {
    var c = client('app', [
      'localhost:9000',
      'localhost:9000'
    ])
    c.subscribe('hello').on('open', function () {
      t.ok(true, 'got an open event')
      c.close()
      t.end()
    })
  })

  tape('end', function (t) {
    server.close()
    t.ok(true)
    t.end()
  })
})
