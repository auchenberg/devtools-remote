module.exports =
  CRC1: require('./crc1').CRC1
  CRC8: require('./crc8').CRC8
  CRC81Wire: require('./crc8_1wire').CRC81Wire
  CRC16: require('./crc16').CRC16
  CRC16CCITT: require('./crc16_ccitt').CRC16CCITT
  CRC16Modbus: require('./crc16_modbus').CRC16Modbus
  CRC24: require('./crc24').CRC24
  CRC32: require('./crc32').CRC32

# create shortcut methods
for name, item of module.exports
  do (item) ->
    module.exports[name.toLowerCase()] = (value) -> new item().hexdigest value
