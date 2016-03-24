
/*

pull-streams are for making tiny modules.
sometimes, you might write a pull stream from scratch,
without any dependencies. but more often, you'll make a new
pull-stream by combining several other pull-streams.

This is called "composing" or "composition".
in pull-streams, you need a complete pipeline before data will flow.
that means:a  source, zero or more throughs, and a sink

but you can still call pull() on a _partial_ pipeline,
which is a great way to create a pull-stream module.

create a source modified by a through:

  pull(source, through) => source

create a sink, but modify it's input before it goes.

  pull(through, sink) => sink

create a through, by chainging several throughs:

  pull(through1, through2) => through

these streams combine just like normal streams.

pull(
  pull(source, through),
  pull(through1, through2),
  pull(through, sink)
) => undefined

the complete pipeline returns undefined, because it cannot be piped
to anything else.
*/

/*
create a simple csv parser.
using the split module to separate the input into lines,
and then each line into cells.
*/
var split = require('pull-split')
function parseCsv () {
  return pull(
    split(), //defaults to \n
    pull.map(function (line) {
      return line.split(/,\s+/)
    })
  )
}

/*
>This will parse simple csv files,
>for a more correct csv parser, see https://github.com/dominictarr/pull-csv

now, say we want to sum a column in a large csv.
we can take our parser, and a reduce function
*/

function sum (column, cb) {
  return pull.reduce(function (a, b) {
    return a + b[column]
  }, 0, cb)
}

var File = require('pull-file')

pull(File(yourCsv), parseCsv(), sum(0, console.log))





