var express = require('express')
var http = require('http')
var WebSocketServer = require('ws').Server
var logger = require('./logger')
var io = require('socket.io')
var guid = require('guid')

var targets = {}
var sockets = {}

logger.info('server.booting')

// HTTP for /json endpoint
logger.info('http.booting')

var app = express()
app.set('port', process.env.PORT || 8000)

app.get('/', function (req, res) {
  logger.info('http.index')
  res.json({
    'msg': 'Hello from DevToolsRemote!',
    'api': {
      'post': 'http://' + (process.env.HEROKU_URL ? process.env.HEROKU_URL : ('localhost:' + app.get('port'))) + '/new',
      'list': 'http://' + (process.env.HEROKU_URL ? process.env.HEROKU_URL : ('localhost:' + app.get('port'))) + '/:sessionId:/list'
    }
  })
})


app.get('/_secret', function (req, res) {

  var formattedTargets = Object.keys(targets).map(function (key) {
    return targets[key]
  })

  logger.info('http.targets', {
    targets: formattedTargets
  })

  res.send(formattedTargets)
})

app.get('/:session/json', function (req, res) {

  var sessionTargets = targets[req.params.session]

  var formattedTargets = Object.keys(sessionTargets).map(function (key) {
    return targets[key]
  })

  logger.info('http.targets', {
    targets: formattedTargets
  })

  res.send(formattedTargets)
})


app.get('/new', function (req, res) {

  var sessionId = guid.raw();

  targets[sessionId] = {}

  res.json({
    sessionId: sessionId
  })
})


var server = http.Server(app)

server.listen(app.get('port'), function () {
  logger.info('http.listening')
  logger.info('- listening on port %d in %s mode', app.get('port'), app.settings.env)
})

// Socket IO for Chrome Extension
logger.info('socket.booting')

var io = require('socket.io')(server)
io.sockets.on('connection', function (socket) {
  logger.info('socket.connection', socket.id)

  sockets[socket.id] = socket

  socket.on('disconnect', function () {
    logger.info('socket.disconnect')
    delete sockets[socket.id]
  })

  socket.on('error', function (err) {
    logger.error('socket.error', err)
  })

  socket.on('hello', function (data) {
    logger.info('socket.hello', data)

    var webSocketUrl = (process.env.HEROKU_URL ? process.env.HEROKU_URL : ('localhost:' + app.get('port'))) + '/devtools/page/' + socket.id

    var sessionTargets = targets[data.sessionId]
    sessionTargets[socket.id] = {
      description: '',
      devtoolsFrontendUrl: '/devtools/devtools.html?ws=' + webSocketUrl,
      devtoolsUrl: 'chrome-devtools://devtools/bundled/devtools.html?ws=' + webSocketUrl + '&remoteFrontend=true',
      id: socket.id,
      title: data.title,
      type: 'page',
      url: data.url,
      webSocketDebuggerUrl: 'ws://' + webSocketUrl
    }
  })
})

// Native WebSockets for DevTools
logger.info('websocket.booting')

var extractPageId = function (str) {
  return str.match(/\/devtools\/page\/(.*)/)[1]
}

var ws = new WebSocketServer({
  server: server,
  path: /\/devtools\/page\/(.*)/
})

ws.on('error', function (err) {
  logger.error('websocket.error', err)
})

ws.on('connection', function (connection) {
  var pageId = extractPageId(connection.upgradeReq.url)
  var socket = sockets[pageId]

  if (!socket) {
    return connection.close(1011, 'Matching socket not found :/')
  }

  var forwardMessage = function (data) {
    var response = JSON.stringify(data)
    logger.info('forwardMessage', data.id)
    connection.send(response)
  }

  socket.on('data.response', function (data) {
    logger.info('data.response', data.id)
    forwardMessage(data)
  })

  socket.on('data.event', function (data) {
    logger.info('data.event', data.method)
    forwardMessage(data)
  })

  logger.info('websocket.connected', pageId)

  connection.on('close', function (data) {
    logger.info('websocket.close')

    socket.removeAllListeners('data.response')
    socket.removeAllListeners('data.event')
  })

  connection.on('error', function (err) {
    logger.error('websocket.error', err)
  })

  connection.on('message', function (data) {
    logger.info('websocket.message')

    var message = JSON.parse(data)
    socket.emit('data.request', message)
  })

})
