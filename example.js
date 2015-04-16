var server = require('./server')
var client = require('./')

server().listen(9000, function () {
  var c = client('localhost:9000')

  c.subscribe('hello').on('data', console.log)

  c.broadcast('hello', {hello: 'world'}, function () {
    console.log('??')
  })
})