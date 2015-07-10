
/*
Now here is a non contrived example.

This is a content addressable store - it's CA store
is like a KeyValue store, except you do not get to
choose the key, the key is always the hash of the value.

This is a really good idea for a bunch of reasons.
You data becomes immutable (cannot change), which means
caching works perfectly (no cache invalidation).
Also, if you know the hash you want, you can verify
you have the correct data no matter who give it to you.

These features make building a distributed system very
easy, and is why you see this pattern in git, bittorrent,
and bitcoin.

(try: ls .git/objects/*/* to look inside git's CA store)
*/

var fs = require('fs')
var pull = require('pull-stream')
var toPull = require('stream-to-pull-stream')

//pass in the directory you want the CA store to be in.
module.exports = function (dir) {

  /*
    first we need a function that turns

  */
  //we'll use the hash of the file as it's filename.
  function toFile (hash) {
    return path.join(dir, hash.substring(0, 2), hash.substring(2))
  }

  function sha256 () {
    var hash = createHash('sha256'), stream
    return stream = pull.through(function (data) {
      hash.update(data)
    }, function () {
      stream.digest = hash.digest('hex')
    })
  }

  function read(hash) {
    return toPull.source(fs.createReadStream(toFile(hash)))
  }

  function write (expected, cb) {
    if('function' === typeof expected)
      cb = hash, expected = null

    cb = cb || function (err) { if(err) throw err }

    var tmpfile = getTemp(), hash = sha256()
    return pull(
      hash,
      toPull.sink(fs.createWriteStream(filename), function (err, data) {
        //if there was an error, delete the file.
        if(err) fs.unlink(tmpfile, cb)
        else if (expected && expected != hash.digest)
          fs.unlink(tmpfile, function () {
            cb(new Error(
              'did not receive file:'+hash.digest
            } ' expected:'+expected
            ))
          })
        else    fs.rename(tmpfile, toFile(hash.digest), cb)
      })
  }

  return {
    read: read,
    write: write
  }
}
