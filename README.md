DevToolsRemote
================
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

Debug your user's browser remotely via Chrome DevTools.

![explainer](https://github.com/auchenberg/browser-remote/raw/master/readme/explainer.jpg)

This is an example of how [browser remote debugging](https://remotedebug.org) can be used to help customers having problems by enabling support agents to remote debug their browser.

I've written a blog post [Use Chrome DevTools to debug your user’s browser remotely with BrowserRemote.](https://kenneth.io/blog/2015/06/16/use-chrome-devtools-to-debug-your-users-browser-remotely-with-browserremote/), to provide some more examples and perspectives.

![Example](https://github.com/auchenberg/browser-remote/raw/master/readme/example.jpg)

### How does it work?

![explainer](https://github.com/auchenberg/browser-remote/raw/master/readme/flow.png)

### How to get started?
To get started to need to have three pieces going:

1. A simple gateway that acts like a proxy between Chrome and Chrome DevTools.
2. The user need to install a little extension to allow access to Chrome debugger, and to connect to the gateway.
3. The agent needs to open the dashboard to connect Chrome DevTools to the user.

#### Gateway
1. Run ``npm install``
2. Run ``npm start``

#### Customer
3. Install chrome extension by using the "Load unpacked extension" option
4. Open ``example/index.html`` in Chrome.
5. Click "I need help"

#### Agent
1. Open ``https://localhost:8000/json``
2. Find the ``devtoolsUrl`` property for the connected client
3. Open the ``devtoolsUrl`` url in Chrome
4. Bam!

**NOTICE**: This project is highly experimental, and shouldn't be used in ANY production-like environment, as there's absolutely no security or privacy.
