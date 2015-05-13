require './test_helpers'
crc = require('../src')

describe 'CRC', ->
  it 'should have a shortcut hexdigest', ->
    string = '1234567890'
    expected = '0d'
    crc.crc1(string).should.equal expected

  it 'buffer as parameter is also support', ->
    buffer =  new Buffer '1234567890'
    expected = '0d'
    crc.crc1(buffer).should.equal expected
