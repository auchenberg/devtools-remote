var vows = require('vows'),
    express = require('express'),
    request = require('request'),
    assert = require('assert');

require('../lib');

function runTestServer(app) {
    // Listen on a vacant TCP port and hand back the url + app
    app.listen(0);
    var address = app.address();
    return {
        hostname: address.address,
        port: address.port,
        host: address.address + ':' + address.port,
        url: 'http://' + address.address + ':' + address.port,
        app: app
    };
};

vows.describe('res.hijack').addBatch({
    'Create a test server that pipes the hijacked response into itself, then do a request against it (simple variant)': {
        topic: function () {
            var appInfo = runTestServer(
                express.createServer()
                    .use(function (req, res, next) {
                        res.hijack(function (err, res) {
                            res.pipe(res);
                        });
                        next();
                    })
                    .use(function (req, res, next) {
                        res.send("foo");
                    })
            );
            request({
                url: appInfo.url
            }, this.callback);
        },
        'should return "foo"': function (err, res, body) {
            assert.equal(body, 'foo');
        }
    },
    'Create a test server that pipes the hijacked response into itself, then do a request against it (streming variant)': {
        topic: function () {
            var appInfo = runTestServer(
                express.createServer()
                    .use(function (req, res, next) {
                        res.hijack(function (err, res) {
                            res.pipe(res);
                        });
                        next();
                    })
                    .use(function (req, res, next) {
                        var num = 0;
                        (function proceed() {
                            if (num < 5) {
                                res.write('foo');
                                num += 1;
                                process.nextTick(proceed);
                            } else {
                                res.end('bar');
                            }
                        }());
                    })
            );
            request({
                url: appInfo.url
            }, this.callback);
        },
        'should return "foo"': function (err, res, body) {
            assert.equal(body, 'foofoofoofoofoobar');
        }
    },
    'Create a test server that pipes the original response through a buffered stream, then do a request against it (simple variant)': {
        topic: function () {
            var appInfo = runTestServer(
                express.createServer()
                    .use(function (req, res, next) {
                        res.hijack(function (err, res) {
                            var bufferedStream = new (require('bufferedstream'))();
                            res.pipe(bufferedStream);
                            bufferedStream.pipe(res);
                        });
                        next();
                    })
                    .use(function (req, res, next) {
                        res.send('foo');
                    })
            );
            var req = request({
                url: appInfo.url,
                encoding: null
            }, this.callback);
        },
        'should return the expected response': function (err, res, body) {
            assert.equal(body, 'foo');
        }
    },
    // The below test fails because Stream.prototype.pipe tears down the pipe when the destination stream emits the 'end' event.
    // There are plans to fix this as part of the streams2 effort: https://github.com/joyent/node/pull/2524
    /*
    'Create a test server that pipes the original response through a buffered stream, then do a request against it (streaming variant)': {
        topic: function () {
            var appInfo = runTestServer(
                express.createServer()
                    .use(function (req, res, next) {
                        res.hijack(function (err, res) {
                            var bufferedStream = new (require('bufferedstream'))();
                            res.pipe(bufferedStream);
                            bufferedStream.pipe(res);
                        });
                        next();
                    })
                    .use(function (req, res, next) {
                        res.end('bar');
                    })
            );
            var req = request({
                url: appInfo.url,
                encoding: null
            }, this.callback);
        },
        'should return the expected response': function (err, res, body) {
            assert.equal(body, 'bar');
        }
    },
    */
    'Create a test server that hijacks the response and passes an error to next(), then run a request against it': {
        topic: function () {
            var appInfo = runTestServer(
                express.createServer()
                    .use(function (req, res, next) {
                        res.hijack(function (err, res) {
                            res.unhijack(function (res) {
                                next(new Error('Error!'));
                            });
                        });
                        next();
                    })
                    .use(function (req, res, next) {
                        res.send("foo");
                    })
                    .use(express.errorHandler())
            );
            request({
                url: appInfo.url
            }, this.callback);
        },
        'should return a 500': function (err, res, body) {
            assert.equal(res.statusCode, 500);
        }
    },
    'Create a test server that hijacks the response and immediately unhijacks it, then run a request against it': {
        topic: function () {
            var appInfo = runTestServer(
                express.createServer()
                    .use(function (req, res, next) {
                        res.hijack(function (err, res) {
                            res.unhijack(true);
                        });
                        next();
                    })
                    .use(function (req, res, next) {
                        res.send("foo");
                    })
                    .use(express.errorHandler())
            );
            request({
                url: appInfo.url
            }, this.callback);
        },
        'should return "foo"': function (err, res, body) {
            assert.equal(body, 'foo');
        }
    },
    'Create a test server that pauses the original response after each emitted "data" event, then run a request against it': {
        topic: function () {
            var events = [];
            var appInfo = runTestServer(
                express.createServer()
                    .use(function (req, res, next) {
                        events.push("hijack");
                        var isPaused = false;
                        res.hijack(function (err, res) {
                            res.on('data', function (chunk) {
                                events.push(chunk);
                                if (!isPaused) {
                                    isPaused = true;
                                    events.push('pause');
                                    res.pause();
                                    setTimeout(function () {
                                        events.push('resume');
                                        res.resume();
                                        isPaused = false;
                                    }, 2);
                                }
                            }).on('end', function () {
                                events.push('end');
                                res.send({events: events});
                            });
                        });
                        next();
                    })
                    .use(function (req, res, next) {
                        var num = 0;
                        (function proceed() {
                            if (num < 3) {
                                num += 1;
                                var isPaused = !res.write('foo' + num);
                                if (isPaused) {
                                    res.once('drain', function () {
                                        events.push('drain');
                                        proceed();
                                    });
                                } else {
                                    process.nextTick(proceed);
                                }
                            } else {
                                res.end();
                            }
                        }());
                    })
                    .use(express.errorHandler())
            );
            request({
                url: appInfo.url
            }, this.callback);
        },
        'should return "foo"': function (err, res, body) {
            assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
            assert.deepEqual(JSON.parse(body).events,
                             [
                                 'hijack',
                                 'foo1',
                                 'pause',
                                 'resume',
                                 'drain',
                                 'foo2',
                                 'pause',
                                 'resume',
                                 'drain',
                                 'foo3',
                                 'pause',
                                 'resume',
                                 'drain',
                                 'end'
                             ]);
        }
    }
})['export'](module);
