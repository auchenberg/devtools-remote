(function () {
  console.log('hello')

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {    
    console.log('message', message, sender, sendResponse)
    
    if (message.cmd === "attach") {

      console.log('debugger.attach', sender.tab)

      var debuggee = {
        tabId: sender.tab.id
      }

      chrome.debugger.attach(debuggee, "1.1", function() {
        console.log('debugger.attached')
      })

      var socket = io.connect('http://localhost:8000/')

      socket.on('connect', function () {
        socket.emit('hello', {
          title: sender.tab.title,
          url: sender.tab.url,
          userAgent: navigator.userAgent
        })
      })

      socket.on('disconnect', function () { 
        // chrome.debugger.detach(debuggee, function() {
        //   console.log('debugger.detached')
        // })
      })

      socket.on('data.request', function(data) {
        console.log('socket.data.request', data.id, data)
        chrome.debugger.sendCommand(debuggee, data.method, data.params, function(response) {
          
          console.log('debugger.command.sent', data.id, response)

          var reply = {
            id: data.id,
            result: response
          }

          console.log('socket.data.response', reply.id, reply)
          socket.emit('data.response', reply)
        })
      })

      chrome.debugger.onEvent.addListener(function(source, method, params) {
        console.log('debugger.event.recieved', source, method, params)
        socket.emit('data.event', { 
          method: method,
          params: params
        })
      })

    }

  })

})()