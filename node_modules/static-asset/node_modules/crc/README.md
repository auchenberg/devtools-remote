# crc

[![NPM version](https://badge.fury.io/js/crc.svg)](http://badge.fury.io/js/crc)
[![Dependency status](https://david-dm.org/alexgorbatchev/node-crc.svg)](https://david-dm.org/alexgorbatchev/node-crc)
[![devDependency Status](https://david-dm.org/alexgorbatchev/node-crc/dev-status.svg)](https://david-dm.org/alexgorbatchev/node-crc#info=devDependencies)
[![Build Status](https://api.travis-ci.org/alexgorbatchev/node-crc.svg?branch=master)](https://travis-ci.org/alexgorbatchev/node-crc)
[![GitTip](http://img.shields.io/gittip/alexgorbatchev.svg)](https://www.gittip.com/alexgorbatchev/)

[![NPM](https://nodei.co/npm/crc.svg)](https://npmjs.org/package/crc)

Module for calculating Cyclic Redundancy Check (CRC).

## Features

* Pure JavaScript implementation, no dependencies.
* Provides CRC Tables for optimized calculations.
* Provides support for the following CRC algorithms:
  * CRC1 `new crc.CRC1` or `crc.crc1(…)`
  * CRC8 `new crc.CRC8` or `crc.crc8(…)`
  * CRC8 1-Wire `new crc.CRC81Wire` or `crc.crc81wire(…)`
  * CRC16 `new crc.CRC16` or `crc.crc16(…)`
  * CRC16 CCITT `new crc.CRC16CCITT` or `crc.crc16ccitt(…)`
  * CRC16 Modbus `new crc.CRC16Modbus` or `crc.crc16modbus(…)`
  * CRC24 `new crc.CRC24` or `crc.crc24(…)`
  * CRC32 `new crc.CRC32` or `crc.crc32(…)`

## Installation

    npm install crc

## Running tests

    $ npm install
    $ npm test

## Usage Example

Calculate a CRC32:

    var crc = require('crc');

    crc.crc32('hello');
    # => "3610a686"

Calculate a CRC32 of a file:

    crc.crc32(fs.readFileSync('README.md', 'utf8'));
    # => "127ad531"

Or using a `Buffer`:

    crc.crc32(fs.readFileSync('README.md'));
    # => "127ad531"

Incrementally calculate a CRC32:

    crc32 = new crc.CRC32()
    crc32.update('one')
    crc32.update('two')
    crc32.update('three')
    crc32.hexdigest()
    # => "09e1c092"

Directly access the checksum:

    crc32.checksum()
    # => 165789842

## Upgrading

Older version `0.3.0` was unfortunately ported from a not so reliable source and results were not matching other libraries. If you are using 3.x please continue using it.

    crc8(String)             #=> Number
    crcArc(String)           #=> Number
    crcModbusString(string)  #=> Number
    crcModbusHex(Number)     #=> Number
    crc16(String)            #=> Number
    crc16CCITT(String)       #=> Number
    fcs16(String)            #=> Number
    crc32(String)            #=> Number
    hex8(Number)             #=> String
    hex16(Number)            #=> String
    hex32(Number)            #=> String

## Thanks

This module is a direct port from Ruby's [Digest CRC](https://github.com/postmodern/digest-crc)
module. Which is in turn based on [pycrc](http://www.tty1.net/pycrc/) library
which is able to generate C source-code for all of the CRC algorithms,
including their CRC Tables.

# License

The MIT License (MIT)

Copyright (c) 2014 Alex Gorbatchev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
