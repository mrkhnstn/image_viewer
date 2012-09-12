
/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')	
  , http = require('http')
  , path = require('path')
  , _ = require('underscore')
  , fs = require('fs');

var imageFolder = 'public/images';

//var app = module.exports = express.createServer();
var app = express();

// Configuration

app.configure(function(){
  app.set('port', process.env.PORT || 3333);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

//app.get('/', routes.index);
app.get('/', function(req, res){
  res.send('viewer server says hello :)');
});

var io, sockets;

var server = http.createServer(app);
server.listen(app.get('port'), function(){

	

  	console.log("Express server listening on port " + app.get('port'));

	io = require('socket.io').listen(server);

	io.configure(function () {
		io.set('transports', [
			'websocket'
		  , 'htmlfile'
		  , 'xhr-polling'
		  , 'jsonp-polling'
		  ]);
		io.disable('log');
	});

	function refresh(){
		try{
			//console.log('refresh');
			var files = fs.readdirSync(imageFolder);
			//console.log(files[files.length-1]);
			io.sockets.emit('new_image','images/' + files[files.length-1]);
		} catch (e){
			console.log('error refresh');
		}
	}

	sockets = io.on('connection', function (socket) {
		console.log('connection');
		try{
			//console.log('refresh');
			var files = fs.readdirSync(imageFolder);
			//console.log(files[files.length-1]);
			io.sockets.emit('new_image','images/' + files[files.length-1]);
		} catch (e){
			console.log('error refresh');
		}
	});
	
	fs.watch(imageFolder, function (event, filename) {
		refresh();
	});
});
