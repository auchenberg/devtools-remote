/* global chrome io */

(function () {
  console.log('hello')

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) { // eslint-disable-line padded-blocks
    console.log('message', message, sender, sendResponse)
    var tab = sender.tab
    var screncastingInterval = null

    if (message.cmd === 'requestDebugSocket') {
      console.log('debugger.attach', tab)

      var debuggee = {
        tabId: tab.id
      }

      chrome.debugger.attach(debuggee, '1.1', function () {
        console.log('debugger.attached')
      })

      // var socket = io.connect('http://localhost:8000/')
      var socket = io.connect('https://browserremote.herokuapp.com/')

      socket.on('connect', function () {
        socket.emit('hello', {
          title: tab.title,
          url: tab.url,
          userAgent: navigator.userAgent
        })
      })

      socket.on('disconnect', function () {
        // chrome.debugger.detach(debuggee, function() {
        //   console.log('debugger.detached')
        // })
      })

      socket.on('data.request', function (data) {
        console.log('socket.data.request', data.id, data)

        if (data.method === 'Page.canScreencast') {
          var reply = {
            id: data.id,
            result: {
              result: true
            }
          }

          socket.emit('data.response', reply)
          return
        }

        chrome.debugger.sendCommand(debuggee, data.method, data.params, function (response) {
          console.log('debugger.command.sent', data.id, response)

          var reply = {
            id: data.id,
            result: response
          }

          console.log('socket.data.response', reply.id, reply)
          socket.emit('data.response', reply)
        })
      })

      chrome.debugger.onEvent.addListener(function (source, method, params) {
        console.log('debugger.event.recieved', source, method, params)
        socket.emit('data.event', {
          method: method,
          params: params
        })
      })

      chrome.debugger.onDetach.addListener(function (debuggee, reason) {
        console.log('debugger.detached', reason)
        socket.disconnect()
      })

    }
  })
})()
