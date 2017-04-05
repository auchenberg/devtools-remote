/* global chrome io */

const server = 'https://remote.devtools.rocks/'
// const server = 'http://localhost:8000/'

var debuggee = {}
var app = {}
var tabRef
var socketRef

var connection = io(server, {
  autoConnect: false
})

function resetSockets (tab) {
  tabRef = tab
  debuggee.tabId = tab.id

  getDebuggerTarget().then(target => {
    if (target.attached) {
      console.warn('debuggee.already attached')
      chrome.debugger.detach(debuggee)
    }

    if (target.url.startsWith('chrome://')) {
      return app.setBadgeText('ERR')
    }

    app.setBadgeText('oo0')
    attachDebuggerAndSocket(debuggee, tab)
  })
}

function getDebuggerTarget (fn) {
  return new Promise((resolve, reject) =>
    chrome.debugger.getTargets(targetsArr => {
      var arr = targetsArr.filter(t => t.tabId === debuggee.tabId)
      resolve(arr && arr[0])
    }))
}

function attachDebuggerAndSocket (debuggee, tab) {
  console.log('debugger.attach', tab)
  chrome.debugger.attach(debuggee, '1.1', function () {
    console.log('debugger.attached')
    app.setBadgeText('o0o')
  })

  if (connection && connection.connected) {
    console.log('socket.disconnecting previous socket')
    connection.disconnect()
  }
  console.log('socket.connecting')
  connection.connect()
}

// socket-side
app.onSocketConnect = function () {
  console.log('socket.connect')
  app.setBadgeText('0oo')
  socketRef = this

  this.on('data.request', app.onSocketDataRequest)
  this.on('sessionCreated', app.onSessionCreated)

  this.emit('hello', {
    title: tabRef.title,
    url: tabRef.url,
    userAgent: navigator.userAgent
  })
}

app.onSocketDisconnect = function () {
  console.log('socket.disconnect')

  this.off('data.request')
  this.off('sessionCreated')

  socketRef = null

  getDebuggerTarget().then(target => {
    if (target && target.attached) {
      chrome.debugger.detach(debuggee, _ => console.log('debugger.detached'))
    }
  })
}

app.onSocketDataRequest = function (data) {
  console.log('socket.data.request', data.id, data)

  if (data.method === 'Page.canScreencast') {
    var reply = {
      id: data.id,
      result: {
        result: true
      }
    }

    this.emit('data.response', reply)
    return
  }

  chrome.debugger.sendCommand(debuggee, data.method, data.params, function (response) {
    console.log('debugger.command.sent', data.id, response)

    var reply = {
      id: data.id,
      result: response
    }

    console.log('socket.data.response', reply.id, reply)
    this.emit('data.response', reply)
  }.bind(this))
}

app.getURL = function (sessionId) {
  app.setBadgeText('ooo')

  window.fetch(server + sessionId + '/json')
    .then(r => r.json())
    .then(targets => {
      console.log('Inspectable targets on ', server, ':')
      targets.forEach(t => {
        /* t looks like: {
          description: "",
          devtoolsFrontendUrl: "/devtools/devtools.html?ws=devtoolsremote.com/devtools/page/lQOtx1HAAC",
          devtoolsUrl: "chrome-devtools://devtools/remote/serve_rev/@06a2e…m/devtools/page/lQOtx1HAAC&remoteFrontend=true&dockSide=unlocked",
          id: "lQOtx1HuFkFfAQ3AAAAC",
          title: "chrome.debugger - Google Chrome",
          type: "page",
          url: "https://developer.chrome.com/extensions/debugger#type-TargetInfo",
          webSocketDebuggerUrl: "ws://devtoolsremote.com/devtools/page/lQOtx1HAAC"
        } */

        console.log('%c%s', 'font-weight: bold;', t.title)
        console.log('\t %c%s', 'color: gray; font-size: 90%;', t.url)
        console.log('\t Inspection URL: %c%s', 'color: blue;', t.devtoolsUrl)

        if (t.url === tabRef.url) {
          app.copyToClipboard(t.devtoolsUrl)
        }
      })
    })
}

connection.on('connect', app.onSocketConnect)
connection.on('disconnect', app.onSocketDisconnect)

app.copyToClipboard = function (text) {
  var input = document.createElement('input')
  document.body.appendChild(input)
  input.value = text
  input.focus()
  input.select()
  document.execCommand('copy')
  input.remove()

  app.setBadgeText('copied')
  setTimeout(app.setBadgeText, 600)
}

// chrome-side
app.onBrowserAction = function (tab) {
  app.setBadgeText('ooo')
  resetSockets(tab)
}

app.setBadgeText = function (text) {
  chrome.browserAction.setBadgeBackgroundColor({
    color: text === 'ERR' ? 'red' : '#5CC77D'
  })

  chrome.browserAction.setBadgeText({
    text: text || ''
  })
}

app.onDebuggerEvent = function (source, method, params) {
  console.log('debugger.event.recieved', source, method, params)
  socketRef.emit('data.event', {
    method: method,
    params: params
  })
}

app.onDebuggerDetach = function (debuggee, reason) {
  console.log('debugger.detached', reason)
  connection.disconnect()

  app.setBadgeText('clear')
  setTimeout(app.setBadgeText, 500)
}

app.onSessionCreated = function (sessionId) {
  console.log('sessionId', sessionId)
  app.getURL(sessionId)
}

chrome.browserAction.onClicked.addListener(app.onBrowserAction)
chrome.runtime.onMessage.addListener(app.onRuntimeMessage)
chrome.debugger.onEvent.addListener(app.onDebuggerEvent)
chrome.debugger.onDetach.addListener(app.onDebuggerDetach)
