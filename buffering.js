var pull = require('pull-stream')

/*
 *** 1:1 read-callback ratio

A pull stream source (and thus transform) returns *exactly one value* per read.
This differs from node streams, which can use `this.push(value)` and in internal
buffer to create transforms that write many values from a single read value.
Pull streams don't come with their own buffering mechanism -- wisely so.

This means you need to think a bit more about returning more than 1 value from a
single `read`. Let's say you had a pull stream source that provides strings that
contain newlines, and want a transform to split them by newlines before passing
them on. Some string may be split into several lines, so the transform will need
to buffer them before passing them on.
*/


var src = pull.values([
  'hello\nworld',
  'guten\ntag\nmeine\nfreunde'
])

// var trans = ???

var snk = pull.drain(console.log)

// pull(src, trans, snk)


/*
There are a few ways to do this:

1. use https://github.com/pull-stream/pull-through

   This module wraps a pull stream transform to provide its own queuing
   mechanism, so that subsequent reads empty the queue. Its node stream analogy
   is https://github.com/dominictarr/through
*/

var through = require('pull-through')

var trans = through(function (data) {
  data.split('\n').forEach(this.queue.bind(this))
})


/*
2. return an array, then flatten it

   pull.flatten (https://github.com/pull-stream/pull-stream/blob/2201ddda56ce5739266a7c0044e983ade47443ac/docs/throughs.md#flatten-)
   returns a transform stream that performs the buffering by holding onto
   arrays passed to it and draining those values to the reader until they're
   all gone
*/

var trans = pull(
  pull.map(function (value) {
    return value.split('\n')
  }),
  pull.flatten()
)


// finally, connect them all together
pull(src, trans, snk)

