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

        if (data.method === 'Page.startScreencast') {
          startScrencasting()
          return
        }

        if (data.method === 'Page.stopScreencast') {
          stopScrencasting()
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

      // Screencasting
      var captureFrame = function () {
        return new Promise(function (resolve, reject) {
          chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 30 }, function (dataURI) {
            if (dataURI) {
              var url = dataURI.replace('data:image/jpeg;base64,', '')
              resolve(url)
            } else {
              reject()
            }
          })
        })
      }

      var captureScreencastFrame = function () {
        captureFrame().then(function (frameUrl) {
          var reply = {
            method: 'Page.screencastFrame',
            params: {
              data: frameUrl,
              metadata: {
                pageScaleFactor: 1,
                offsetTop: 0,
                deviceWidth: tab.width,
                deviceHeight: tab.height,
                scrollOffsetX: 0,
                scrollOffsetY: 0
              }
            }
          }

          socket.emit('data.response', reply)
        })
      }

      var stopScrencasting = function () {
        if (screncastingInterval) {
          clearInterval(screncastingInterval)
        }
      }

      var startScrencasting = function () {
        screncastingInterval = setInterval(captureScreencastFrame, 1000)
      }

    }

  })

})()
