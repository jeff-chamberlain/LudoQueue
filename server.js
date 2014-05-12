var io = require('socket.io'),
  express = require('express'),
  http = require('http'),
  queue = require('queue'),
  serveStatic = require('serve-static'),
  morgan  = require('morgan');
  
var app = express();
app.use(serveStatic('public')).use(morgan());
var server = http.createServer(app);
var queueio = io.listen(server);
server.listen(8080);//process.env.PORT || 10733);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/splash.html');
});

app.get('/player', function (req, res) {
  res.sendfile(__dirname + '/public/player.html');
});

app.get('/game', function (req, res) {
  res.sendfile(__dirname + '/public/game.html');
});

app.get('/game_left', function (req, res) {
  res.sendfile(__dirname + '/public/game_left.html');
});

app.get('/game_right', function (req, res) {
  res.sendfile(__dirname + '/public/game_right.html');
});

var players = queueio.of('/player').on('connection', function(socket) {
	queue.configPlayer({
		socket: socket,
		id: socket.id
	});
});

queue.setAllPlayers(players);

queueio.of('/game').on('connection', function(socket) {
	queue.configGame(socket);
});

queueio.of('/game_left').on('connection', function(socket) {
	queue.configGameLeft(socket);
});

queueio.of('/game_right').on('connection', function(socket) {
	queue.configGameRight(socket);
});