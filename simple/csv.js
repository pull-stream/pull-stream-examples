
// split a file into lines,
// and then map each line through a split function.


function CSV () {
  return pull(
    Split(), //defaults to '\n'
    pull.map(function (line) {
      return line.split(',')
    })
  )
}

//parse a file

pull(
  File(filename),
  CSV(),
  pull.drain(console.log)
)


// this parses simple CSV files, as long so they do not escape commas with quotes.
// the module pull-csv is a more correct csv parser.
