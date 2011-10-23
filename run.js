

// 

var http = require('http');
var path = require('path');
var picApp = require(path.join(__dirname,'picApp/picApp.js'));
var connect = require('connect');

connect(
	    connect.static(__dirname + '/public', { maxAge: 0 }),
	    connect.router(function(app){
	    	app.get('/account/:test', function(req, res){
	    		res.end('test item');
	    	});
	    	app.get('/', function(req, res){
	    		res.end('main app');
	    	});
	    }),
	    function(req, res) {
	    res.setHeader('Content-Type', 'text/html');
	    res.end('<img src="/tobi.jpeg" />');
	  }).listen(2048);