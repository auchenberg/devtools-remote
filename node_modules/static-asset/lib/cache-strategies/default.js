var fs = require("fs"),
	hash = require("../hash"),
	cache = {}, //filename => {"mtime": dateObject, "etag": string, "size": fileSize}
	cacheOn = process.env.NODE_ENV == "production" || process.env.NODE_ENV == "prod";
//Adds information to the cache
function addToCache(filename, obj) {
	if(cacheOn)
	{
		var x = cache[filename];
		if(!x)
			x = cache[filename] = {};
		x.mtime = obj.mtime || x.mtime;
		x.etag = obj.etag || x.etag;
		x.size = obj.size || x.size;
	}
}
//Sets the Last-Modified date based upon the mtime of the file
exports.lastModified = function(filename) {
	if(cache[filename] && cache[filename].lastModified)
		return cache[filename].lastModified;
	var stat = fs.statSync(filename);
	addToCache(filename, stat);
	return stat.mtime;
};
//Sets the ETag based upon the file size and CRC-32 hash
exports.etag = function(filename) {
	if(cache[filename] && cache[filename].etag)
		return cache[filename].etag;
	var data = fs.readFileSync(filename),
		size;
	if(cache[filename] && cache[filename].size)
		size = cache[filename].size;
	else
	{
		var stat = fs.statSync(filename);
		addToCache(filename, stat);
		size = stat.size;
	}
	var etag = new Number(size).toString(36) + "-" +
		parseInt(hash(data, "crc32"), 16).toString(36);
	addToCache(filename, {etag: etag});
	return etag;
};
//Set expiration date to one year from now
exports.expires = function(filename) {
	var d = new Date();
	d.setFullYear(d.getFullYear() + 1);
	return d;
};
//Set the fingerprint based upon the ETag of the file
exports.fileFingerprint = function(filename, fullPath) {
	return filename + "?v=" + exports.etag(fullPath);
};

/* Example of setting the fingerprint based upon the Last
	Modified date of the file

exports.fileFingerprint = function(filename, fullPath) {
	//Encode the lastModified Date as a radix 36 UTC timestamp
	var mdate = exports.lastModified(fullPath);
	mdate.setMilliseconds(0);
	mdate = new Number(mdate.getTime() / 1000).toString(36);
	return filename + "?v=" + mdate;
};
*/
