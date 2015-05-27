/* global chrome */

(function () {
  document.addEventListener('window.remoteDebug.requestDebugSocket', function (e) {
    chrome.runtime.sendMessage({
      cmd: 'requestDebugSocket'
    })
  })

  var s = document.createElement('script')
  s.textContent = '(' + function () {
    window.remoteDebug = {}
    window.remoteDebug.requestDebugSocket = function (requester) {
      if (window.confirm('Do you want to allow ' + requester + ' to remote debug this tab?')) { // eslint-disable-line no-alert

        var evt = document.createEvent('CustomEvent')
        evt.initCustomEvent('window.remoteDebug.requestDebugSocket', true, true)
        document.dispatchEvent(evt)

      }
    }
  } + ')();'

  document.documentElement.appendChild(s)
  s.parentNode.removeChild(s)

})()
