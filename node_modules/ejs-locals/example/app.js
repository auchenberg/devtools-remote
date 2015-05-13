var express = require('express')
  , engine = require('../')
  , app = express();

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);

app.set('views',__dirname + '/views');
app.set('view engine', 'ejs'); // so you can render('index')

// render 'index' into 'boilerplate':
app.get('/',function(req,res,next){
  res.render('index', { what: 'best', who: 'me', muppets: [ 'Kermit', 'Fozzie', 'Gonzo' ] });
});

app.get('/foo.js', function(req,res,next){
	res.sendfile('foo.js');
})

app.get('/foo.css', function(req,res,next){
	res.sendfile('foo.css');
})

app.listen(3000);
