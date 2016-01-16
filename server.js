var express = require('express')
var http = require('http')
var WebSocketServer = require('ws').Server
var logger = require('./logger')
var io = require('socket.io')
var uuid = require('node-uuid')

var targets = {}
var sockets = {}

logger.info('server.booting')

// HTTP for /json endpoint
logger.info('http.booting')

var app = express()
app.set('port', process.env.PORT || 8000)

app.use(express.static('web'));

app.get('/', function (req, res) {
  logger.info('http.index')
  res.json({
    msg: 'Hello from DevToolsRemote'
  })
})

app.get('/:session/json', function (req, res) {

  var sessionId = req.params.session
  var sessionTargets = targets[sessionId]

  logger.info('http.targets', {
    targets: sessionTargets
  })

  res.send(sessionTargets)
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
  var sessionId = uuid()

  logger.info('socket.connection', sessionId)

  targets[sessionId] = []
  sockets[sessionId] = socket

  socket.on('disconnect', function () {
    logger.info('socket.disconnect')

    delete targets[sessionId]
    delete sockets[sessionId]
  })

  socket.on('error', function (err) {
    logger.error('socket.error', err)
  })

  socket.on('hello', function (data) {
    logger.info('socket.hello', data)

    var webSocketUrl = (process.env.WEBSOCKET_DOMAIN ? process.env.WEBSOCKET_DOMAIN : ('localhost:' + app.get('port'))) + '/devtools/page/' + sessionId

    targets[sessionId].push({
      description: '',
      devtoolsFrontendUrl: '/devtools/devtools.html?ws=' + webSocketUrl,
      devtoolsUrl: 'chrome-devtools://devtools/remote/serve_rev/@06a2e65a4f3610ec17dbc5988c0b16a95825240a/inspector.html?ws=' + webSocketUrl + '&remoteFrontend=true&dockSide=unlocked',
      id: uuid(),
      title: data.title,
      type: 'page',
      url: data.url,
      webSocketDebuggerUrl: 'ws://' + webSocketUrl
    })

    socket.emit('sessionCreated', sessionId)

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
