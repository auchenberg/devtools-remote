express-hijackresponse
======================

Module that allows you to rewrite HTTP responses from middleware
further down the stack, such as static providers, HTTP proxies etc.

It's mostly useful for content filters. The original use case is
injecting an inline JavaScript into all HTML responses in <a
href='https://github.com/One-com/livestyle'>LiveStyle</a>.


Installation
------------

Make sure you have node.js and npm installed, then run:

    npm install express-hijackresponse

Usage
-----

Requiring the module installs a `hijack` method on your response objects:

    var express = require('express');
    require('express-hijackresponse');

    var app = express.createServer();

    // ...

    app.use(function (req, res, next) {
        res.hijack(function (err, res) {
            if (err) {
                res.unhijack(); // Make the original res object work again
                return next(err);
            }
            // 'res' is now a fake response object with `writeHead`,
            // `write`, `end`, `getHeader`, `setHeader`, `removeHeader` methods.

            if (/^text/html(?:;$)/.test(res.getHeader('Content-Type'))) {
                // Don't hijack HTML responses:
                return res.unhijack();
            }
            res.setHeader('X-Hijacked', 'yes!');
            res.removeHeader('Content-Length');

            // It emits 'data' and 'end' events representing the original response:
            res.on('data', function (chunk, encoding) {
                // The original response emitted a chunk!
            }).on('end', function () {
                // The original response ended!
                res.end('Sorry, your data was hijacked!');
            });
        });
        // next() must be called explicitly, even when hijacking the response:
        next();
    });


Example
-------

Rewrite all JSON responses so they're wrapped into a {"foo": ...} literal:

    var express = require('express');
    require('express-hijackresponse');

    express.createServer()
        .use(function (req, res, next) {
            if (req.accepts('json')) {
                res.hijack(function (err, res) {
                    if (err) {
                        res.unhijack(); // Make the original res object work again
                        return next(err);
                    }
                    // Inspect the original response headers to see if we actually want to rewrite the response:
                    if (/\/json$/.test(res.getHeader('Content-Type'))) {
                        // Remove Content-Length if it's there (it won't be correct when the response has been rewritten):
                        res.removeHeader('Content-Length');
                        res.writeHead(res.statusCode);
                        res.write('{"foo":');

                        // Stream the original response and slip in a '}' before ending:
                        res.pipe(res, {end: false});
                        res.on('end', function () {
                            res.write('}');
                            res.end();
                        });
                    } else {
                        res.unhijack();
                    }
                });
            }
            next();
        })
        .use(express.static(__dirname))
        .listen(1337);

TODO
----

Better error handling, backpressure support when streaming.


License
-------

3-clause BSD license -- see the `LICENSE` file for details.
