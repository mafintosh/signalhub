var server = require('./server')()
var client = require('./')
var tape = require('tape')

server.listen(9000, function () {
  tape('subscribe', function (t) {
    var c = client('localhost:9000')

    c.subscribe('hello').on('data', function (message) {
      t.same(message, {hello: 'world'})
      t.end()
      this.destroy()
    })

    c.broadcast('hello', {hello: 'world'})
  })

  tape('broadcast and then subscribe', function (t) {
    var c = client('localhost:9000')

    c.broadcast('hello1', {hello: 'world'}, function () {
      c.subscribe('hello1').on('data', function (message) {
        t.same(message, {hello: 'world'})
        t.end()
        this.destroy()
      })
    })
  })

  tape('end', function (t) {
    server.close()
    t.ok(true)
    t.end()
  })
})