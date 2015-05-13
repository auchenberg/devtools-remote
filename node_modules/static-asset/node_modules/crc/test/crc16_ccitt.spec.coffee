require './test_helpers'

describe 'CRC16CCITT', ->
  example
    crc: require('../src').CRC16CCITT
    string: '1234567890'
    expected: '3218'
