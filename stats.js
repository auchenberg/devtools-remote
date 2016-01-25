var request = require('request')
var fs = require('fs')

request('http://devtoolsremote.com/_stats', function(err, response, body) {
	if (err) {
		console.log('err', err)
		throw err
	}

	var body = JSON.parse(body)
	var line = '' + Date.now() + ',' + body.count.targets + ',' + body.count.sockets + '\n'

	console.log('stats.line', line)

	fs.appendFile('web/_stats.txt', line, encoding='utf8', function (err) {
		if (err) {
			console.log('err', err)
			throw err
		}
	})
})
