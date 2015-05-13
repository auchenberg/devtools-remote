require './test_helpers'

describe 'CRC16Modbus', ->
  example
    crc: require('../src').CRC16Modbus
    string: '1234567890'
    expected: 'c20a'
