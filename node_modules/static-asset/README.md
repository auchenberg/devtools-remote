#node-static-asset

node-static-asset is a static asset manager for Node.JS, designed for Express.
This project aims to solve the problem of caching static assets (including
assets like *.js files that might change from time to time).

## Background

Google has a nice article about "strong" and "weak" caching.  It's worth a quick
read if you don't know what that means.

https://developers.google.com/speed/docs/best-practices/caching

## Install

`npm install static-asset`

## Getting Started

node-static-asset allows you to generate URL fingerprints for static assets.

1. Add the static-asset middleware to your Express stack
```javascript
var staticAsset = require('static-asset');
app.use(staticAsset(__dirname + "/public/") );
```

2. Get URL fingerprints of your static resources using `req.assetFingerprint`
or the `assetFingerprint` view helper function.
```javascript
app.get("/info", function(req, res, next) {
	/* Should return something like "The URL fingerprint for jQuery is:
		/js/jquery.min.js?v=3dd-983jk2a"
	*/
	res.type("text/plain").send("The URL fingerprint for jQuery is: " +
		req.assetFingerprint("/js/jquery.min.js") );
});
```

Now that you have obtained the asset fingerprint for `/js/jquery.min.js`,
if you send a request for that asset to the URL `/js/jquery.min.js?v=3dd-983jk2a`,
static-asset will automatically add appropriate caching headers (i.e.
Last-Modified, ETag, and Expires).

## API

static-asset exposes a function `req.assetFingerprint`, which allows one to generate
and register URL fingerprints for static assets.

Once a URL fingerprint is *registered* with static-asset, any HTTP request for that
static asset (i.e. when `req.url` matches the registered URL fingerprint) will
trigger static-asset to set certain HTTP headers (i.e. Last-Modified, ETag, or
Expires).

### Adding the middleware function

**require('static-asset')(path[, cache])** - Returns an Express middleware
function that exposes a `req.assetFingerprint` function and adds
`assetFingerprint` view helper function to `res.locals`.  If any request's URL
matches a previously generated URL fingerprint, static-asset will attempt to add
weak and strong caching headers to the HTTP response.

- `path` - the path from which static files are served
- `cache` - a "cache strategy" Object, which must implement all "cache
	strategy" methods, as described below. If `cache` is omitted, the
	default "cache stategy" is used.

### A "Cache Strategy" Object

A "cache strategy" object should implement one or more of the following methods:

- `lastModified(filename)` - a function that accepts a filename and returns
	its last modified date. If a last modified date could not
	be determined, the function should return `null`; otherwise, static-asset
	*may* use this Date to set the `Last-Modified` HTTP response header when
	the resource is requested.
- `etag(filename, cb)` - Same as lastModified (above), except that it must
	return an ETag (or hash value).  If the
	returned ETag is not `null`, static-asset *may* use this value to set the
	`ETag` HTTP header when the named resource is requested.
- `expires(filename)` - Same as lastModified (above), except
	that it must return a Date Object indicating when the resource shall
	expire. The Date may be no more than one year in the future. If
	`expires` is implemented, static-asset *may* use the date to set an
	`Expires` and/or `Cache-Control: max-age` HTTP headers; otherwise,
	static-asset will use a Date approximately one year into the future.
- `fileFingerprint(filename, fullPath)` - Returns the URL fingerprint
	of the resource `filename`, stored at the location `fullPath`.
	`fullPath` is provided for convenience, since the caching strategy
	does not know what root path was passed into the static-asset middleware.

### Registering URL fingerprints

**req.assetFingerprint(label_or_filename)** - Return a URL fingerprint for the
labelled resource, or if no such label is registered, use the "cache
strategy" to determine the file's ETag or last modified date.  If you're confused
by this description, read on...

If you call `req.assetFingerprint(filename)` and pass a filename relative to the
path from which static files are served, static-asset will use the cache strategy
you specified to generate and return a unique URL fingerprint for the asset.
If that file is requested later by the URL fingerprint, static-asset will respond
by setting the appropriate HTTP headers like Last-Modified, ETag, and Expires,
according to the cache strategy.

If an ETag is provided by the cache strategy, it will be used to generate the
fingerprint; otherwise, the last modified date will be used.

If you call `req.assetFingerprint()` with no arguments, a fingerprint will be
registered and generated using the cache strategy on the current URL (i.e.
`req.url`). This is equivalent to `req.assetFingerprint(req.url)`.

### Labelled resources

You can call `req.assetFingerprint(label, fingerprint, cacheInfo)` to manually
assign a `fingerprint` for the specified `label`. In addition, the HTTP headers
returned to the client when this URL fingerprint is requested are specified by
the `cacheInfo` Object.

**req.assetFingerprint(label, urlFingerprint, cacheInfo)** - Registers a URL
fingerprint for a labelled resource.

- `label` - a label identifying the resource
- `urlFingerprint` - the URL fingerprint for the resource. If a request for this
	resource is made, static-asset may add caching headers to the response.
- `cacheInfo` - an Object containing one or more of these properties:
	- `lastModified` - the last modified date of the resource
	- `etag` - the ETag of the resource
	- `expires` - the expiration date of the resource

Other middleware on the stack can generate their own URL fingerprints for
static resources and expose them through `req.assetFingerprint`. Like this:

```javascript
//Suppose we are in a middleware function, designed to uglify JS files...
//stat will refer to the stat Object generated by `fs.stat`
req.assetFingerprint(javascript_filename, javascript_filename + "?v=" +
	stat.mdate.getTime(), {"lastModified": stat.mdate});
```

If you call `req.assetFingerprint(label)` and pass a label, static-asset will return
the fingerprint for the resource, as specified by the last corresponding
`req.assetFingerprint(label, fingerprint, cacheInfo)` call.  If that file is requested,
static-asset will respond by setting the appropriate HTTP headers, according to the
`cacheInfo` Object passed to the last
`req.assetFingerprint(label, fingerprint, cacheInfo)` call.


### Default Caching Strategy

static-asset can be fully customized, but it has some basic, reasonably sane default behavior.
By default, static-asset does the following:

- The URL fingerprint of the resource is based on the ETag
- The ETag is generated based upon the file size and the file's CRC-32 hash.
- The last modified date is pulled from `fs.stat`
- The expires date is set to one year in the future
- The default strategy relies on [`connect.static`]
(http://www.senchalabs.org/connect/middleware-static.html) to load the resource from
the filesystem.
- In development environments (based on `process.env.NODE_ENV`), the URL fingerprint
will be updated whenever the file changes
- In production environments, the URL fingerprints are cached and cannot
change until the server is restarted.

## Basic Usage

Usually, this should be good enough to get started.

```javascript
var express = require('express');
var app = express();
var staticAsset = require('static-asset');
app.use(staticAsset(__dirname + "/public/") );
app.use(express.static(__dirname + "/public/") );
//... application code follows (routes, etc.)
```

For example, if you want to include your client-side JavaScript code, simply
do this in your [Jade](https://github.com/visionmedia/jade) or [Blade]
(https://github.com/bminer/node-blade) view:

```jade
script(type="text/javascript", src=assetFingerprint("/client.js") )
```

This will render to something like this:

```html
<script type="text/javascript" src="/client.js?v=1318365481"></script>
```

Notice that static-asset added a URL fingerprint (the UNIX timestamp
1318365481) to the filename.

## More Advanced Usage

You can override the "cache strategy" with your own implementation that might
allow you to:

- Upload the asset to Amazon S3 and generate a URL fingerprint that points to S3
- Fly in a spaceship to the moon
- Do something really crazy like generate URL fingerprints that are
Base64-encoded MD5-hashes of the names of random lunar craters.
