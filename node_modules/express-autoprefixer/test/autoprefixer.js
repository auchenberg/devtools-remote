/*global describe,it,before,after*/
var express = require('express'),
    Path = require('path'),
    request = require('request'),
    passError = require('passerror'),
    expect = require('unexpected'),
    autoprefixer = require('../lib/autoprefixer');

var root = Path.resolve(__dirname, 'root'),
    // Pick a random TCP port above 10000 (.listen(0) doesn't work anymore?)
    portNumber = 10000 + Math.floor(55536 * Math.random()),
    baseUrl = 'http://127.0.0.1:' + portNumber,
    server;

expect.addAssertion('to respond', function (expect, subject) {
    var args = Array.prototype.slice.call(arguments, 2);
    var lines = args.slice(0, -1);
    var done = args[args.length - 1];

    request(baseUrl + '/' + subject, passError(done, function (response, body) {
        expect(body, 'to equal', lines.join('\n') + '\n');
        done();
    }));
});

describe('test server with autoprefixer', function () {
    before(function (done) {
        server = express.createServer()
            .use(function (req, res, next) {
                // stubbed compiless middleware to change content type on less files
                if (/\.less$/.test(req.url)) {
                    res.setHeader('Content-Type', 'text/css');
                }
                next();
            })
            .use(autoprefixer({options: 'Chrome > 30'}))
            .use(express['static'](root))
            .listen(portNumber, done);
    });

    after(function () {
        server.close();
    });

    it('should not mess with request for non-css file', function (done) {
        expect('/something.txt',
               'to respond',
               'foo',
               done);
    });
    it('should prefix animation-name', function (done) {
        expect('/no-prefix.css',
               'to respond',
                '.missing-prefix {',
                '    -webkit-animation-name: test;',
                '    animation-name: test;',
                '}',
               done);
    });
    it('should not prefix already prefixed properties', function (done) {
        expect('/with-prefix.css',
               'to respond',
                '.prefix-already-present {',
                '    -webkit-animation-name: test;',
                '    animation-name: test;',
                '}',
               done);
    });
    it('should not prefix properties supported in Chrome > 30 as per options given', function (done) {
        expect('/border-radius.css',
               'to respond',
                '.border-radius {',
                '    border-radius: 10px;',
                '}',
               done);
    });
    it('should work with less files served through express-compiless', function (done) {
        expect('/compiless.less',
               'to respond',
                '.compilessOutput {',
                '    -webkit-animation-name: test;',
                '    animation-name: test;',
                '}',
               done);
    });
});

describe('tests with no test server', function () {
    describe('constructor', function () {
        it('should find options itself if none is given', function () {
            expect(function () {
                autoprefixer();
            }, 'not to throw');
        });
        it('should take options', function () {
            expect(function () {
                autoprefixer({ options: 'Chrome 30' });
            }, 'not to throw');
        });
    });
});
