/*

create a simple source stream that reads from an array.

A pull stream is just an async stream that is called repeatedly.
note that when every item in the array has been called back,
it returns true in the error slot. This indicates the end of the stream.
both err and end mean the stream is over! but there are many possible
ways an error can occur (err && err !== true), and only one way a stream can correctly end (true)

in pull-streams i like to call streams that data comes out of "sources",
(in node they are usually called readables)

*/
function values (ary) {
  var i = 0
  return function read(abort, cb) {
    if(i===ary.length || abort) return cb(true)
    cb(null, ary[i++])
  }
}

/*

pull-streams don't really have a writable stream per se. "writable" implys that
the writer is the active partner, and the stream which is written to is passive.
(like you are when you watch TV. the TV writes it's lies into neocortex via your retinas)

instead of a writable, pull streams have a "sink", that is a reader.
here the reader is the active party, actively consuming more data.
When you read a book, you are in control, and must actively turn the pages to get more information.

so, a sink is a function that you pass a source to,
which then reads from that function until it gets to the end or decides to stop.
*/

function sink (read) {
  read(null, function next (err, data) {
    if(err) return console.log(err)
    console.log(data)
    //recursively call read again!
    read(null, next)
  })
}

/*

we could now consume the source with just these two functions.

sink(values([1,2,3]))

so simple. we didn't use any librarys, yet, we have streams with 2 way back pressure.
since the pattern is async, the source can slow down by cb'ing slower,
and the sink can slow down by waiting longer before calling read again!
*/

/*
okay, to be useful, we also need a way to transform inputs into different outputs.
i.e. a transform stream.

in pull-streams a transform is implemented as a sink that returns a source.

*/

function map (mapper) {
  //a sink function: accept a source
  return function (read) {
    //but return another source!
    return function (abort, cb) {
      read(abort, function (err, data) {
        //if the stream has ended, pass that on.
        if(err) return cb(err)
        //apply a mapping to that data
        cb(null, mapper(data))
      })
    }
  }
}
/*
right now, we could combine these 3 streams by passing them to each other.

var source = values([1,2,3])
var mapper = map(function (e) { return e*e })

and then combine these with function composition:

sink(mapper(source))

this would be equavalent to node's .pipe
except with node streams it would look like

source.pipe(mapper).pipe(sink)

to be honest, it's easier to read if it does left to right.
because the direction the data flows is the same as you read.

lets write a quick function that allows us to compose pull streams left-to-right

pull(source, mapper, sink)
*/

function pull () {
  var args = [].slice.call(arguments)
  var s = args.shift()
  while(args.length) s = args.shift()(s)
  return s
}

/*
thats it! just call the next thing with the previous thing until there are no things left.
if we return the last thing, then we can even do this:

pull(pull(source, mapper), sink)

*/

/*
Infinite streams. here is a stream that never ends.
*/

function infinite () {
  var i = 0
  return function (abort, cb) {
    if(abort) return cb(abort)
    cb(null, i++)
  }
}

/*
Now, reading all of an infinite stream will take forever...
BUT! the cool thing about pull streams is that they are LAZY.
that means it only gives us the next thing when we ask for it.

Also, you can ABORT a pull stream when you don't want any more.

here is a take(n) stream that reads n items from a source and then stops.
it's a transform stream like map, except it will stop early.
*/

function take (n) {
  return function (read) {
    return function (abort, cb) {
      //after n reads, tell the source to abort!
      if(!--n) return read(true, cb)
      read(null, cb)
    }
  }
}

/*
now we can pipe the infinite stream through this,
and it will stop after 101 items!
*/

pull(infinite(), mapper, take(101), sink)

/*

That covers 3 types of pull streams. Source, Transform, & Sink.
There is one more important type, although it's not used as much.

Duplex streams.

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
*/

