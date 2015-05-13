require './test_helpers'

describe 'CRC24', ->
  example
    crc: require('../src').CRC24
    string: '1234567890'
    expected: '8c0072'
