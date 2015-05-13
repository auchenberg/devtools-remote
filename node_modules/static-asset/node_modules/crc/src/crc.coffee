hex = require './hex'

module.exports = class CRC
  # The initial value of the CRC checksum
  INIT_CRC: 0x00

  # The XOR mask to apply to the resulting CRC checksum
  XOR_MASK: 0x00

  # The bit width of the CRC checksum
  WIDTH: 0

  #
  # Packs the given CRC checksum.
  #
  # @return [String]
  #   The packed CRC checksum.
  #
  pack: (crc) ->
    ''

  each_byte: (buf, cb) ->
    if typeof buf == 'string'
      buf = new Buffer buf
    cb byte for byte in buf

  #
  # Initializes the CRC checksum.
  #
  constructor: ->
    @crc = @INIT_CRC

  #
  # The length of the digest.
  #
  # @return [Integer]
  #   The length in bytes.
  #
  digest_length: ->
    Math.ceil @WIDTH / 8.0

  #
  # Updates the CRC checksum with the given data.
  #
  # @param [String] data
  #   The data to update the CRC checksum with.
  #
  update: (data) ->

  #
  # Resets the CRC checksum.
  #
  # @return [Integer]
  #   The default value of the CRC checksum.
  #
  reset: ->
    @crc = @INIT_CRC

  #
  # The resulting CRC checksum.
  #
  # @return [Integer]
  #   The resulting CRC checksum.
  #
  checksum: (signed = yes) ->
    sum = @crc ^ @XOR_MASK
    sum = sum >>> 0 if signed
    sum

  #
  # Finishes the CRC checksum calculation.
  #
  # @see {pack}
  #
  finish: ->
    @pack @checksum()

  hexdigest: (value) ->
    @update value if value?
    result = hex @finish()
    @reset()
    result
