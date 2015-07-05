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