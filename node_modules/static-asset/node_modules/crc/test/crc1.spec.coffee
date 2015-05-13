require './test_helpers'

describe 'CRC1', ->
  example
    crc: require('../src').CRC1
    string: '1234567890'
    expected: '0d'
