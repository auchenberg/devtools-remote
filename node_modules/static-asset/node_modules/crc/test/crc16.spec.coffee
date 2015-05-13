require './test_helpers'

describe 'CRC16', ->
  example
    crc: require('../src').CRC16
    string: '1234567890'
    expected: 'c57a'
