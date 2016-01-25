var request = require('request')
var fs = require('fs')
var Mixpanel = require('mixpanel')

var mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);

console.log('stats.start')

request('http://devtoolsremote.com/_stats', function(err, response, body) {
	if (err) {
		console.log('err', err)
		throw err
	}

	var body = JSON.parse(body)

	console.log('sockets_concurrent', body.count.sockets)
	console.log('sessions_concurrent', body.count.targets)

	mixpanel.track('sockets_concurrent', body.count.sockets)
	mixpanel.track('sessions_concurrent', body.count.targets)

})

console.log('stats.end')
