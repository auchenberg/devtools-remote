CRC = require './crc'
hex = require './hex'

module.exports.CRC1 = class extends CRC
  TABLE: []
  CRC_MASK: 0x00

  #
  # Packs the CRC1 checksum.
  #
  # @return [String]
  #   The CRC1 checksum.
  #
  pack: (crc) ->
    hex crc % 256

  #
  # Updates the CRC1 checksum.
  #
  # @param [String] data
  #   The data to update the checksum with.
  #
  update: (data) ->
    accum = 0
    @each_byte data, (b) -> accum += b
    @crc += accum % 256
    @
