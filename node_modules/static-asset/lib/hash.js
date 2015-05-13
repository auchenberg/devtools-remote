var crypto = require('crypto'),
	crc = require('crc');
/* A hashing function that accepts data and returns the hash from the
specified algorithm. Works for Buffers and strings. */
module.exports = function(data, algorithm) {
	if(crc[algorithm]) {
		if(data instanceof Buffer) {
			return crc[algorithm](data.toString("binary") );
		} else {
			return crc[algorithm](data);
		}
	}
	else
		return crypto.createHash(algorithm).update(data).digest('hex');
};
