

// 

var http = require('http');
var path = require('path');
var url = require("url");
var fs = require("fs");

var picApp = require(path.join(__dirname,'picApp/picApp.js'));
var connect = require('connect');
var formidable = require("formidable");

console.log("Starting up.");
console.log("Loading old data");
var oldData = require(path.join(__dirname, "result.bin"));
console.log("Building tag list");
var tagNames = [];
for(var tagName in oldData.tags){
	tagNames.push(tagName);
}
console.log("Building set list");
var setNames = [];
for(var setName in oldData.sets){
	setNames.push(setName);
}
console.log("Old Data is loaded");

connect(
	    connect.static(__dirname + '/public', { maxAge: 0 }),
	    connect.router(function(app){
			app.get('/storage/*', function(req, res){
				var urlInfo = url.parse(req.url);
				var fileName = urlInfo.path.substring(9);
				var rs = fs.createReadStream(path.join('/home/wei/storage', fileName));
				res.writeHeader(200, {
					"Content-Type": "image/jpeg"
				});
				rs.on("error", function(){
					if(fileName.match(/thumbs/)){
						rs = fs.createReadStream(path.join('/home/wei/storage', fileName.replace(/thumbs\//, '')));
						rs.on("error", function(){
							console.log("really?",path.join('/home/wei/storage', fileName.replace(/thumbs\//, '')));
							res.writeHeader(404);
							res.end();		
						});
						rs.pipe(res);		
						return;
					}
					
				});
				rs.pipe(res);
			}),
			app.get('/tagList', function(req, res){
    			res.write('{}&&{ "tags":');
    			res.write( JSON.stringify(tagNames));
    			res.end("}");
    		});
			app.get('/setList', function(req, res){
    			res.write('{}&&{ "sets":');
    			res.write( JSON.stringify(setNames));
    			res.end("}");
    		});
	    		app.get('/tags/*', function(req, res){
	    			var urlInfo = url.parse(req.url);
	    			var anyCaseTags = decodeURIComponent(urlInfo.path.substring(6)).split(/:/);
	    			
	    			console.log("anyCaseTags", anyCaseTags);
	    			res.write("{}&&{");
	    			var tagLines = [];
	    			anyCaseTags.forEach( function(tag){
	    				if(typeof oldData.tags[tag] != 'undefined'){
	    					tagLines.push('"'+ tag + '":' + JSON.stringify(oldData.tags[tag] ));
	    				}
	    			});
	    			
	    			var tagLine = tagLines.shift();
	    			if(tagLine)	res.write(tagLine);
	    			while(tagLine = tagLines.shift()){
	    				if(tagLine)	res.write(","+tagLine);
	    			}
	    			//console.log( "Tags:", tags);
	    			res.end("}");
	    	});
	    	app.get('/', function(req, res){
	    		res.end('main app');
	    	});
	    }),
	    function(req, res) {
	    res.setHeader('Content-Type', 'text/html');
	    res.end('<img src="/tobi.jpeg" />');
	  }).listen(2048);
