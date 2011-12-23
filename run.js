

// 
var child_process = require("child_process");
var http = require('http');
var path = require('path');
var url = require("url");
var fs = require("fs");

var md5 = require(path.join(__dirname, "/md5.js"));

//var log  = ;

	 function uuid() {
	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	    var uuid = new Array(36), rnd=0, r;
	    for (var i = 0; i < 36; i++) {
	      if (i==8 || i==13 ||  i==18 || i==23) {
	        uuid[i] = '-';
	      } else if (i==14) {
	        uuid[i] = '4';
	      } else {
	        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
	        r = rnd & 0xf;
	        rnd = rnd >> 4;
	        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
	      }
	    }
	    return uuid.join('');
	  };
	
var picApp = require(path.join(__dirname,'picApp/picApp.js'));

var formidable = require("formidable");

var users = {
		"paul":{
			"password": md5.hex_md5('blissen')
		}
} ; 

function login(username, password, callBack){
	if(typeof users[username] == 'undefined'){
		callback(-1, "No valid user and password provided.");
		return;
	}
	if(users[username] && users[username][password] == password){
		var userToken = uuid();
		callback(0, userToken);
		users[username][token] = userToken;
	}else{
		callback(-1, "The information provided was not a valid logon.");
	}
}

function addUser(username, password, captcha){
	
}


function fourOhFour(req, res){
	 var body = "<p style=\"font-size:30;\">404</p>This is not the naked amatuer you were looking for.";
	  res.writeHead(404, {
		  'Connection': 'keep-alive',
		  'Content-Length': body.length,
		  'Content-Type': 'text/html' });
	  res.write(body);
	  res.end();
	  return;
}

function serveStatic(staticPath){
		// return a static file server function that handles serves files from a given path i.e. __dirname + '../../ui/html'
		return function(req, res){
			var realUrl = req.url ;
			if(realUrl == ''  || realUrl=='/'){
				realUrl = '/index.html';
			}
			var fileExtension = realUrl.match(/([^\/.]*)$/);
			var urlInfo = url.parse(realUrl);
			switch(fileExtension[0]){
			 case 'html':
				 	try{
				 		console.log("Remote", req.socket.remoteAddress, (new Date()).toString());		 			
			 		}catch(e){
				 		
				 	}
					urlInfo.filetype = 'text/html';
				 	break;				 
			 case 'css':
				 urlInfo.filetype = 'text/css';
				 break;
			 case 'jpg': urlInfo.fileExtension = 'jpeg';
			 case 'gif':
			 case 'png':
			 	 urlInfo.filetype = 'image/' + urlInfo.fileExtension;
			 	 break;
			 case 'js':
				 urlInfo.filetype = 'application/javascript';
				 break;
			 case 'jffs2':
				 urlInfo.filetype = 'application/octet-stream';
				 break;
			 default:
				 
				 urlInfo.filetype = 'text/html';
			}
			var filePath = path.join( staticPath, urlInfo.pathname);

			path.exists(filePath, function(exists){
                      if(!exists){
                              fourOhFour(req, res);
                              return;
                      }
                      var stat = fs.stat(filePath, function(err, stats){
                              if( req.headers['if-modified-since']){
                                      if(false && (req.headers['if-modified-since'] == stats.mtime.toString() ) > 0){
                                              res.writeHead(304, {
                                                      'Connection':'Keep-Alive',
                                                      'Keep-Alive':'timeout=15, max=50',
                                                      'Date': new Date
                                             });
                                              res.end();
                                              return;
                                      }
                              }
                              
     						 if( req.headers['accept-encoding'] && req.headers['accept-encoding'].match(/gzip/)){
    							gzip = true;
    						 }


                              var gzip = false;
                              var headers = {
                                      'Connection':'Keep-Alive',
                                      'Content-Type': urlInfo.filetype,
                                      'Keep-Alive':'timeout=15, max=50',
                                      'Date': new Date,
                                      'Last-Modified': stats.mtime
                                      };
		                      var file = fs.createReadStream( filePath, {
		                       flags: 'r',
		                       fd: null,
		                       mode: 0666,
		                       bufferSize: 64 * 1024
		                       })
		                       .on("error", function fileOnError(err){
		                                      fourOhFour(req, res);
		                             })
		                       .on("open", function(){
		                             if(!gzip){
		                                     headers['Content-Length'] = stats.size;
		                             }
		                             res.writeHead(200, headers);
		                              if(gzip){
		                                     file.pipe(zlib.createGzip()).pipe(res);
		                              }else{
		                                     file.pipe(res);
		                             }
		                       });
		             });
		      });


		};
	}


var connect = function(staticCallback, routes){
	// this function takes an array of event handlers and returns an object that has a listen function
	var httpServer = null;
	var returnVal = {
			listen: function(port){
				httpServer = http.createServer(function(req, res){
					var urlInfo = url.parse(req.url);
					for(var routerPath in routes){
						var pathExpression = '^' + routerPath ;
						if(routerPath[routerPath.length-1] == '*'){
							pathExpression = pathExpression.slice(0, pathExpression.length-1);
							pathExpression += '.*';
						}						
						if(req.url.match( new RegExp(pathExpression + '$') )){
							routes[routerPath](req, res);
							return;
						}
					}
					staticCallback(req, res);
				});
				httpServer.listen( port);
			}
	};
	
	return returnVal ;
};

connect.static = serveStatic;
connect.router = function(callback){
	var apiStub = {
	};
	var routes = {};
	apiStub.post = apiStub.get = function(path, callback){
		// generate a route in the connect tool.
		routes[path] = callback;
	};
	callback(apiStub);
	return routes;
};




console.log("Starting up.");
console.log("Loading data");
var imageHashes = require(path.join(__dirname+"/imageHashes")).data;
var imageTags = require(path.join(__dirname+"/imageTags")).data;
var imageSets = require(path.join(__dirname+"/imageSets")).data;
var imageSizes = require(path.join(__dirname+"/imageSizes")).sizes;

imageHashes.forEach(function(imageHash){
	if(imageHash == null) return; // skip deleted images
	var size = imageSizes[imageHash.hash];
	if(!size){
		console.log("Error, no size for ", imageHash.hash);
		return;
	}
	imageHash.size = size;
});

console.log("Building tag list");
var tagNames = [];
for(var tagName in imageTags){
	tagNames.push({ name:tagName, count: imageTags[tagName].length });
}
console.log("Building set list");
var setNames = [];
for(var setName in imageSets){
	if(imageSets[setName].length > 0){
		setNames.push({ name:setName, count: imageSets[setName].length});
	}
}
console.log("Data is loaded");

var maxSpawn = 10;
var currentSpawn = 0;
var waitingToSpawn = [];

function runSpawner( fThatSpawns, message){
	if(fThatSpawns == null) return;
	if(currentSpawn < maxSpawn){
		currentSpawn ++;
		function onDone(){
			currentSpawn --;
			if(waitingToSpawn.length==0) return;
			runSpawner(waitingToSpawn.shift()(onDone), "respawn");
		};
		fThatSpawns(onDone);
		
	}else{
		waitingToSpawn.push(fThatSpawns);
	}
}

var noTagImages = [];
var noSetImages = [];

var imageReviewOffset = 0;

function reviewNextImage(){
	
	if(imageHashes[imageReviewOffset] == null){
		imageReviewOffset ++;
		
		process.nextTick(reviewNextImage);
		return;
	}
	
	getImageInfo(imageReviewOffset, function(){
		try{
			if(imageHashes[imageReviewOffset].sets.length == 0){
				noSetImages.push(imageHashes[imageReviewOffset]);
			}
			if(imageHashes[imageReviewOffset].tags.length == 0){
				noTagImages.push(imageHashes[imageReviewOffset]);
			}
			
			imageReviewOffset++;
			if(imageReviewOffset > imageHashes.length){
				console.log("Done reviewing images");
				return; // all done
			}	
			setTimeout(reviewNextImage, 10);
		}catch(e){
			console.log("No sets?", imageReviewOffset, imageHashes[imageReviewOffset]);
		}
	});
}

setTimeout(reviewNextImage, 10);

function getImageInfo(imageNum, imageInfoListener){
	if(imageHashes[imageNum] == null){
		imageInfoListener();
	}
	imageHashes[imageNum].imageNum = imageNum;
	if(!imageHashes[imageNum].sets){
		imageHashes[imageNum].sets = [];
		for(var setName in imageSets){
			var offset = imageSets[setName].indexOf(imageNum);
			if(offset >= 0){
				imageHashes[imageNum].sets.push(setName);
			}
		}
	}
	if(!imageHashes[imageNum].tags){
		imageHashes[imageNum].tags = [];
		for(var tagName in imageTags){
			var offset = imageTags[tagName].indexOf(imageNum);
			if(offset >= 0){
				imageHashes[imageNum].tags.push(tagName);
			}
		}
	}
	
	imageInfoListener(imageHashes[imageNum]);
	return;
}

var sessions = {};
var users = {
		"pauldorn": {
			"password": false
		}
		
};

connect(
	    connect.static(__dirname + '/public', { maxAge: 0 }),
	    connect.router(function(app){
	    	app.get('/login', function(req, res){
	    		var urlInfo = url.parse(req.url, true);
	    		res.writeHead(200, { 'Content-Type':'text/json'});
	    		
	    		if(sessions[urlInfo.query.sessionToken]){
	    			res.end(JSON.stringify({ loggedIn: true}));
		    	}else{
		    		res.end(JSON.stringify({ loggedIn: false}));
		    	}
	    	});
	    	app.get('/verifyLogin*', function(req, res){
	    		var urlInfo = url.parse(req.url, true);
	    		res.writeHead(200, { 'Content-Type':'text/json'});
	    		if(sessions[urlInfo.query.sessionToken]){
	    			res.end(JSON.stringify({ loggedIn: true}));
		    	}else{
		    		res.end(JSON.stringify({ loggedIn: false}));
		    	}
	    	});
	    	app.get('/noTagInfo', function(req, res){
	    		res.writeHead(200, { 'Content-Type':'text/json'});
				res.end(JSON.stringify(noTagImages));		
	    	});
	    	app.get('/noSetInfo', function(req, res){
	    		res.writeHead(200, { 'Content-Type':'text/json'});
				res.end(JSON.stringify(noSetImages));		
	    	});
	    	app.get('/tagInfo/*', function(req, res){
	    		var urlInfo = url.parse(req.url);
				var tagName = urlInfo.pathname.match(/[^\/]*$/);
				var tag = imageTags[require('querystring').unescape(tagName[0]).replace(/\+/,' ')];
				if(!tag){
					console.log("Tag is null", JSON.stringify(urlInfo), JSON.stringify(tagName));
					res.end("Tag is missing");
					return;
				}
	    		var fullTag = [];
	    		var tagCount = 0;
	    		if(tag.length == 0) res.end('[]');
	    		tag.forEach(function(imageNum){
	    			getImageInfo(imageNum, function(imageHash){
	    				fullTag.push(imageHash);
	    				tagCount++;
	    				if(tagCount == tag.length){
	    					res.end(JSON.stringify(fullTag));			
	    				}
	    			});
	    		});
				
	    	});
	    	app.get('/setInfo/*', function(req, res){
	    		var urlInfo = url.parse(req.url);
				var setName = urlInfo.pathname.match(/[^\/]*$/);
				var set = imageSets[require('querystring').unescape(setName[0]).replace(/\+/,' ')];
				if(!set){
					console.log("Set is null", JSON.stringify(urlInfo), JSON.stringify(setName));
					res.end("Set is missing");
					return;
				}
	    		var fullSet = [];
	    		var setCount = 0;
	    		if(set.length == 0) res.end('[]');
	    		set.forEach(function(imageNum){
	    			getImageInfo(imageNum, function(imageHash){
	    				fullSet.push(imageHash);
	    				setCount++;
	    				if(setCount == set.length){
	    					res.writeHead(200, { 'Content-Type':'text/json'});
	    					res.end(JSON.stringify(fullSet));			
	    				}
	    			});
	    		});
				
	    	});
	    	app.get('/randomImage', function(req, res){
	    		var imageNum = Math.floor(Math.random() * imageHashes.length);
	    		while(!imageHashes[imageNum]){
	    			imageNum = Math.floor(Math.random() * imageHashes.length);
	    		}
	    	// we know which image.  Now we need to know what sets this image appears in.
	    		getImageInfo(imageNum, function(imageHash){
	    			//{ tags: tags, sets: sets, imageHash: imageHashes[imageNum].hash, exifData: imageHashes[imageNum].exifData, imageNum: imageNum }
	    			res.writeHead(200, { 'Content-Type':'text/json'});
	    			res.end(JSON.stringify(imageHash));
	    		});
	    	});
			app.get('/exif/*', function(req, res){
				var urlInfo = url.parse(req.url);
				var imageNum = urlInfo.pathname.match(/[^\/]*$/);
				res.writeHead(200, { 'Content-Type':'text/plain'});
				if( !imageHashes[imageNum] ){
					// bad image number
					res.end();
					return;
				}
				if( imageHashes[imageNum].exifData ){
					res.end(imageHashes[imageNum].exifData);
					return;
				}
				imageHashes[imageNum].exifData = '';
				var fThatSpawns = function(onDoneSpawn){
					var jhead = child_process.spawn('jhead', [ '/home/wei/storage/' + imageHashes[imageNum].hash ]);
					jhead.stdout.on("data", function(data){
						var newData = data.toString('utf-8');
						newData = newData.replace(/.*file\ name.*/ig,'');
						imageHashes[imageNum].exifData += newData;	
						res.write(newData);
					});
					jhead.stdout.on("end", function(data){
						if(data){
							var newData = data.toString('utf-8');
							newData = newData.replace(/.*file\ name.*/ig,'');
							res.end(newData);
							imageHashes[imageNum].exifData += newData;	
						}else res.end();
						onDoneSpawn();
					});
					jhead.on("exit", function(err){
						if(err){
							onDoneSpawn();
							res.end();
							console.error("Error in jhead (/exif)");
						}
					});
				};
				runSpawner(fThatSpawns, "from exif");
			});
			app.get('/storage/*', function(req, res){
				var urlInfo = url.parse(req.url);
				var fileName = urlInfo.path.substring(9);
				var rs = fs.createReadStream(path.join('/home/wei/storage', fileName));
				res.writeHeader(200, {
					"Content-Type": "image/jpeg"
				});
				rs.on("error", function(){
					res.end();
//					if(fileName.match(/thumbs/)){
//						rs = fs.createReadStream(path.join('/home/wei/storage', fileName.replace(/thumbs\//, '')));
//						rs.on("error", function(){
//							console.log("really?",path.join('/home/wei/storage', fileName.replace(/thumbs\//, '')));
//							res.writeHeader(404);
//							res.end();		
//						});
//						rs.pipe(res);		
//						return;
//					}
//					
				});
				rs.pipe(res);
			}),
			app.get('/tagList', function(req, res){
				res.writeHead(200, { 'Content-Type':'text/json'});
    			res.write('{}&&{ "tags":');
    			res.write( JSON.stringify(tagNames));
    			res.end("}");
    		});
			app.get('/setList', function(req, res){
				res.writeHead(200, { 'Content-Type':'text/json'});
    			res.write('{}&&{ "sets":');
    			res.write( JSON.stringify(setNames));
    			res.end("}");
    		});
	    		app.get('/tags/*', function(req, res){
	    			res.writeHead(200, { 'Content-Type':'text/json'});
	    			var urlInfo = url.parse(req.url);
	    			var anyCaseTags = decodeURIComponent(urlInfo.path.substring(6)).split(/:/);
	    			
	    			
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
//	    	app.get('/', function(req, res){
//	    		res.end('main app');
//	    	});
	    }),
	    function(req, res) {
	    res.setHeader('Content-Type', 'text/html');
	    res.end('<img src="/tobi.jpeg" />');
	  }).listen(process.argv[1]?process.argv[1]:'80');


// Now that the server is running we can update some data about the files.

// Every once in a while we should save the operating state


