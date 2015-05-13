(function () {

  window.remotedebug = {}
  window.remotedebug.requestAccess = function () {
    if (window.confirm('Do you want to allow <name> to remote debug your tab?')) {
      chrome.runtime.sendMessage({
        cmd: 'attach'
      })
    }
  }

  window.remotedebug.requestAccess()

})()
