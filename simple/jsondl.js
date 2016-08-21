
//new line delimited json.

var pull = require('pull-stream')
var Split = require('pull-split')

function pullJSON () {
  return pull(
    Split(),
    pull.map(function (line) {
      return JSON.parse(line)
    })
  )
}

pull(
  File(filename),
  pullJSON(),
  pull.drain(console.log)
)
