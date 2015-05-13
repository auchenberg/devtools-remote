BrowserRemote.
================

Debug your users browser remotely via Chrome DevTools.

![Logo](https://github.com/auchenberg/browser-remote/raw/master/explainer.png)


This is an example of how [browser remote debugging](https://remotedebug.org) can be used to help customers having problems by enabling support agents to remote debug their browser.

### How to get started?
To get started to need to have three pieces going: The first is a little "gateway" that acts like a proxy between Chrome and Chrome DevTools. Secondly the user who need support need to install a little extension, and finally the  agent need to open the dashboard.

#### Gateway
1. Run ``npm install``
2. Run ``npm start``

#### Customer
3. Install chrome extension by using the "Load unpacked extension" option
4. Open ``example/index.html`` in Chrome.
5. Click "I need help"

#### Agent
1. Open `https://localhost:8000/json``
2. Find the ``devtoolsUrl`` property for the connected client
3. Open the ``devtoolsUrl`` url in Chrome
4. Bam! 


**NOTICE**: This project is highly experimental, and shouldn't be used in ANY production-like environment, as there's absolutely no security or privacy. 
