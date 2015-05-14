(function () {

  document.addEventListener('window.remoteDebug.requestAccess', function (e) {
    chrome.runtime.sendMessage({
      cmd: 'attach'
    })
  })

  var s = document.createElement('script')
  s.textContent = '(' + function () {
    window.remoteDebug = {}
    window.remoteDebug.requestAccess = function (requester) {
      if (window.confirm('Do you want to allow ' + requester + ' to remote debug this tab?')) {

        var evt = document.createEvent('CustomEvent')
        evt.initCustomEvent('window.remoteDebug.requestAccess', true, true)
        document.dispatchEvent(evt)

      }
    }
  } + ')();'

  document.documentElement.appendChild(s)
  s.parentNode.removeChild(s)

})()
