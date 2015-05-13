BrowserRemote.
================

Debug your users browser remotely via Chrome DevTools.

This is an example of how browser remote debugging can be used to help customers having problems by enabling support agents to remote debug their browser.

### How to get started?
1. Run ``npm install``
2. Run ``npm start``

### Customer:
3. Install chrome extension by using the "Load unpacked extension" option
4. Open ``example/index.html`` in Chrome.
5. Click "I need help"

#### Support agent:
1. Open `https://localhost:8000/json``
2. Find the ``devtoolsUrl`` property for the connected client
3. Open the ``devtoolsUrl`` url in Chrome
4. Bam! 


This project is highly experimental.
