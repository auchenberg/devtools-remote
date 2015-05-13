

# express-ejs-layouts

#### *Layout support for ejs in express.*

[![build status](https://secure.travis-ci.org/Soarez/express-ejs-layouts.png)](http://travis-ci.org/Soarez/express-ejs-layouts)

## Installation
    npm install express-ejs-layouts

## Usage
    var express = require('express')
      , app = express()
      , expressLayouts = require('express-ejs-layouts')
    
    app.set('view engine', 'ejs')
    app.set('layout', 'myLayout') // defaults to 'layout'     

    app.use(expressLayouts)
    app.use(app.router)
    
    app.get('/', function(req, res){
      res.render('aView', { layout: 'someSpecificLayout' })
    })

    app.listen(3000)

### contentFor

A view

    somebody
    <%- contentFor('foo') %>
    club
    <%- contentFor('bar') %>
    fight

With a layout

    <%-bar%> <%-foo%>
    <%-body%>

Renders

    fight club
    somebody

### Script blocks extraction

If you like to place all the script blocks at the end, you can do it like this:

    app.set("layout extractScripts", true)

A view

    something<script>somejs<script>something

With a layout

    ...
    <body>
    <%- body %>
    <%- script %>
    </body>

Renders

    ...
    <body>
    somethingsomething
    <script>somejs<script>
    </body>

Enabling invididually:

    req.render('view', { parseScript: true })

## Optional sections

In a layout, you can have optional sections using `defineContent`:
Unspecified section content defaults to `''`.


    1
    <%-defineContent('a')%>
    2
    <%-defineContent('b')%>
    3

with a view:

    <%- contentFor('a') %>
    1.5

will render:

    1
    1.5
    2
    3

## Running tests
Clone the rep

    make test

## License

MIT
