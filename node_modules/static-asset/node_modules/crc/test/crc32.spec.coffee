require './test_helpers'
crc = require('../src').CRC32

describe 'CRC32', ->
  example
    crc: crc
    string: '1234567890'
    expected: '261daee5'

  example
    crc: crc
    string: 'Hello, world'
    expected: 'e79aa9c2'
