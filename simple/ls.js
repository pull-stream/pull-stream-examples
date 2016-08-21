
var fs = require('fs')
var path = require('path')

var pull = require('pull-stream')
var Defer = require('pull-defer')
var Paramap = require('pull-paramap')

//list the files in a directory.
//since fs.readdir is an async function
//but we want to return a new stream immeditaly
//we use pull-defer

function ls (dir) {

  var stream = Defer.source()

  fs.readdir(dir, function (err, ls) {
    stream.resolve(pull.values(ls))
  })

  return stream

}

//list the files in a directory
/*
pull(
  ls(process.argv[2] || process.cwd()),
  pull.drain(console.log)
)
*/

// get stats for each file.
// we use paramap here, so that we can look up many files in parallel

function ls_long (dir) {
  return pull(
    ls(dir),
    Paramap(function (file, cb) {
      var filename = path.join(dir, file)
      fs.lstat(filename, function (err, stat) {
        if(err) return cb(err)
        stat.file = filename
        stat.dir = stat.isDirectory()
        cb(null, stat)
      })
    })
  )
}

/*
pull(
  ls_long(process.argv[2] || process.cwd()),
  pull.drain(console.log)
)
*/

// drill down into subdirectories.
// if an item is a directory, map that item to a stream.
// pull.flatten() turns a stream of streams (or arrays) into a stream of items

function ls_recursive (dir) {
  return pull(
    ls_long(dir),
    pull.map(function (e) {
      if(!e.dir) return [e.file]
      else return ls_recursive(e.file)
    }),
    pull.flatten()
  )
}

pull(
  ls_recursive(process.argv[2] || process.cwd()),
  pull.drain(console.log)
)

