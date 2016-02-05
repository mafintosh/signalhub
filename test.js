var server = require('./server')()
var client = require('./')
var tape = require('tape')

server.listen(9000, function () {
  tape('subscribe', function (t) {
    var c = client('app', ['localhost:9000'])

    c.subscribe('hello').on('data', function (message) {
      t.same(message, {hello: 'world'})
      t.end()
      this.destroy()
    }).on('open', function () {
      c.broadcast('hello', {hello: 'world'})
    })

  })

  tape('subscribe with trailing /', function (t) {
    var c = client('app', ['localhost:9000/'])

    c.subscribe('hello').on('data', function (message) {
      t.same(message, {hello: 'world'})
      t.end()
      this.destroy()
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
        t.end()
        this.destroy()
      }
    }).on('open', function () {
      c.broadcast('hello', { msg: 'stranger'}, function () {
        c.broadcast('goodbye', { msg: 'friend'})
      })
    })
  })

  tape('subscribe to channels with slash in the name', function (t) {
    var c = client('app', ['localhost:9000'])

    c.subscribe('hello/people').on('data', function (message) {
      t.same(message, [1, 2, 3])
      t.end()
      this.destroy()
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
      this.destroy()
      t.end()
    })
  })

  tape('end', function (t) {
    server.close()
    t.ok(true)
    t.end()
  })
})
