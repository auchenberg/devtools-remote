module.exports = (number) ->
  result = number.toString 16
  result = "0#{result}" while result.length % 2
  result
