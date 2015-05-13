require './test_helpers'

describe 'CRC8', ->
  example
    crc: require('../src').CRC8
    string: '1234567890'
    expected: '52'
