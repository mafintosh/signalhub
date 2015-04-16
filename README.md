# signalhub

Simple signalling server that can be used to coordinate handshaking with webrtc or other fun stuff.

```
npm install signalhub
```

Or to install the command line tool

```
npm install -g signalhub
```

[![build status](http://img.shields.io/travis/mafintosh/signalhub.svg?style=flat)](http://travis-ci.org/mafintosh/signalhub)

## Usage

``` js
var signalhub = require('signalhub')
var hub = signalhub('http://yourhub.com')

hub.subscribe('/my-channel')
  .on('data', function (message) {
    console.log('new message received', message)
  })

hub.broadcast('/my-channel', {hello: 'world'})
```

## API

#### `hub = signalhub(url)`

Create a new hub client

#### `stream = hub.subscribe(channel)`

Subscribe to a channel on the hub. Returns a readable stream of messages

#### `hub.broadcast(channel, message, [callback])`

Broadcast a new message to a channel on the hub

## CLI API

You can use the command line api to run a hub server

```
signalhub listen -p 8080 # starts a signalhub server on 8080
```

Or broadcast/subscribe to channels

```
signalhub broadcast my-channel '{"hello":"world"}' -p 8080 -h yourhub.com
signalhub subscribe my-channel -p 8080 -h yourhub.com
```

## Browserify

This also works in the browser using browserify :)

## License

MIT
