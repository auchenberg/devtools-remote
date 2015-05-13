require './test_helpers'

describe 'CRC8 1 Wire', ->
  example
    crc: require('../src').CRC81Wire
    string: '1234567890'
    expected: '4f'
