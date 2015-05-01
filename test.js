var server = require('./server')()
var client = require('./')
var tape = require('tape')

server.listen(9000, function () {
  tape('subscribe', function (t) {
    var c = client('localhost:9000', 'app')

    c.subscribe('hello').on('data', function (message) {
      t.same(message, {hello: 'world'})
      t.end()
      this.destroy()
    })

    c.broadcast('hello', {hello: 'world'})
  })

  tape('subscribe to many', function (t) {
    var c = client('localhost:9000', 'app')

    var msgs = ['stranger', 'friend']

    c.subscribe(['hello', 'goodbye']).on('data', function (message) {
      t.same(message, {msg: msgs.shift()})

      if (msgs.length === 0) {
        t.end()
        this.destroy()
      }
    })

    c.broadcast('hello', { msg: msgs[0]})
    c.broadcast('goodbye', { msg: msgs[1]})
  })

  tape('end', function (t) {
    server.close()
    t.ok(true)
    t.end()
  })
})
