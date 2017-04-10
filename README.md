DevTools Remote
================
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

![Logo](https://github.com/auchenberg/browser-remote/raw/master/readme/logo.png)

Debug your user's browser remotely via Chrome DevTools.

DevTools Remote enables you to share access to a browser tab,
so it can be debugged remotely via Chrome DevTools.

### How does it work?

1. A simple gateway that acts like a proxy between Chrome and Chrome DevTools.
2. The user needs to install a little extension to allow access to Chrome debugger, and to connect to the gateway.
3. A unique link is generated that connects the browser and DevTools over a WebSocket connection.

![explainer](https://github.com/auchenberg/browser-remote/raw/master/readme/flow.png)

A full detailed blog post can be found here [https://kenneth.io/blog/2015/06/16/use-chrome-devtools-to-debug-your-users-browser-remotely-with-browserremote/](https://kenneth.io/blog/2015/06/16/use-chrome-devtools-to-debug-your-users-browser-remotely-with-browserremote/)

### Security

**NOTICE**: This project is highly experimental, and shouldn't be used in ANY production-like environment, as there's little security provided by a uniquely generated session. This session can in theory be guessed, and therefore allow a third party to tag along.
