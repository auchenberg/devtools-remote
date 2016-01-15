/* global chrome io */

const server = 'https://devtools-remote.herokuapp.com/'
//const server = 'http://localhost:8000/'


var debuggee = {};
var isAttached = false;
var socket = io(server, { autoConnect: false });
var app = {};
var tabRef;

function resetSockets(tab){
  tabRef = tab;
  debuggee.tabId = tab.id;

  getDebuggerTarget().then( target => {

    if (target.attached){
      console.warn('debuggee.already attached')
      chrome.debugger.detach(debuggee);
    }

    if (target.url.startsWith("chrome://"))
      return app.setBadgeText("ERR");

    app.setBadgeText("oo0")
    attachDebuggerAndSocket(debuggee, tab)
  });
}

function getDebuggerTarget(fn){
  return new Promise((resolve, reject) =>
    chrome.debugger.getTargets(targetsArr => {
      var arr = targetsArr.filter( t => t.tabId == debuggee.tabId);
      resolve(arr && arr[0]);
    }));
};

function attachDebuggerAndSocket(debuggee, tab){
  console.log('debugger.attach', tab)
  chrome.debugger.attach(debuggee, '1.1', function () {
    console.log('debugger.attached')
    app.setBadgeText("o0o");
  })

  if (socket && socket.connected){
    console.log('socket.disconnecting previous socket')
    socket.disconnect();
  }
  console.log('socket.connecting')
  socket.connect();
}


// socket-side
app.socketconnect = function () {
  console.log('socket.connect');
  app.setBadgeText("0oo");
  socket.emit('hello', {
    title: tabRef.title,
    url: tabRef.url,
    userAgent: navigator.userAgent
  })
  setTimeout(app.getURL, 100);
};

app.socketdisconnect = function(){
  console.log('socket.disconnect');
  getDebuggerTarget().then(target =>{
    if (target && target.attached)
      chrome.debugger.detach(debuggee, _ => console.log('debugger.detached'))
  })
};

app.socketdatarequest = function (data) {
  console.log('socket.data.request', data.id, data)

  if (data.method === 'Page.canScreencast') {
    var reply = {
      id: data.id,
      result: { result: true }
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
};

app.getURL = function(){

  app.setBadgeText("ooo")

  fetch(server + 'json')
    .then( r => r.json())
    .then( targets => {

      console.log('Inspectable targets on ', server, ':');

      targets.forEach( t => {
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

        console.log('%c%s', "font-weight: bold;", t.title);
        console.log('\t %c%s', "color: gray; font-size: 90%;", t.url);
        console.log('\t Inspection URL: %c%s', "color: blue;", t.devtoolsUrl);

        if (t.url == tabRef.url)
          app.copyToClipboard(t.devtoolsUrl);
      })

      //console.table(targets);
    });
};

socket.on('connect', app.socketconnect)
socket.on('disconnect', app.socketdisconnect);
socket.on('data.request', app.socketdatarequest);



app.copyToClipboard = function(text){
    var input = document.createElement('input');
    document.body.appendChild(input);
    input.value = text;
    input.focus();
    input.select();
    document.execCommand('copy');
    input.remove();

    app.setBadgeText("copied")
    setTimeout(app.setBadgeText, 600);
}

// chrome-side
app.onBrowserAction = function(tab){
  app.setBadgeText("ooo")
  resetSockets(tab);
};

app.setBadgeText = function(text){
  chrome.browserAction.setBadgeBackgroundColor({color: text == "ERR" ? 'red' : '#5CC77D'});
  chrome.browserAction.setBadgeText({text: text || ""});
}

app.onDebuggerEvent = function (source, method, params) {
  console.log('debugger.event.recieved', source, method, params)
  socket.emit('data.event', {
    method: method,
    params: params
  })
};

app.onDebuggerDetach = function (debuggee, reason) {
  console.log('debugger.detached', reason)
  socket.disconnect()

  app.setBadgeText("clear")
  setTimeout(app.setBadgeText, 500);
};


chrome.browserAction.onClicked.addListener(app.onBrowserAction);
chrome.runtime.onMessage.addListener(app.onRuntimeMessage);
chrome.debugger.onEvent.addListener(app.onDebuggerEvent)
chrome.debugger.onDetach.addListener(app.onDebuggerDetach)

