/*
Duplex streams are used to communicate with a remote service,
and they are a pair of source and sink streams `{source, sink}`

in node, you see duplex streams to connect replication or rpc protocols.
client.pipe(server).pipe(client)
or
server.pipe(client).pipe(server)
both do the same thing.

the pull function we wrote before doesn't detect this,
but if you use the pull-stream module it will.
Then we can pipe duplex pull-streams like this:

var pull = require('pull-stream')
pull(client, server, client)

Also, sometimes you'll need to interact with a regular node stream.
there are two modules for this.

stream-to-pull-stream
and
pull-stream-to-stream

*/

var net = require('net')
var toPull = require('stream-to-pull-stream')
var pull = require('pull-stream')

var server = net.createServer(function (stream) {
  //convert into a duplex pull-stream
  stream = toPull.duplex(stream)

  pull(
    stream,
    pull.map(function (b) {
      //take the input, and MAKE IT LOUD!!!
      return b.toString().toUpperCase() + '!!!'
    }),
    stream
  )

}).listen(9999, function () {

  var stream = toPull.duplex(net.connect(9999))

  pull(
    pull.values(['quiet stream']),
    stream,
    pull.drain(function (data) {
      console.log(data.toString())
    }, function (err) {
      if(err) throw err
      server.close()
    })
  )

})
