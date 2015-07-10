var express = require('express');
var path = require('path');
var session = require('express-session');
var body_parser = require('body-parser');
var multer = require('multer');
var uuid = require('node-uuid');
var logger = require('express-logger');

var article = require('./routes/articles');
var user = require('./routes/user');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({
	dest: './photos/',
	rename: function (fieldname, filename) { return "image_" + Date.now() + "." + filename.split('.').pop(); }
}));

app.use(session({
    genid: function(req) {
        return uuid.v4(); // use UUIDs for session IDs
    },
    secret: 'keyboard cat'
}));

//app.use(logger({path: "logfile.txt"}));

app.use('/articles', article);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	
	next(err);
});

// error handlers

// a. development error handler will print stacktrace
if (app.get('env') === 'development') {
	
	app.use(function(err, req, res, next) {
		
		res.status(err.status || 500);
		res.render('error', { message: err.message, error: err });
	});
}

// b. production error handler no stacktraces leaked to user
app.use(function(err, req, res, next) {
  
	res.status(err.status || 500);
	res.render('error', { message: err.message, error: {} });
});


module.exports = app;
