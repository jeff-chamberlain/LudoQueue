var io = require('socket.io'),
  express = require('express'),
  http = require('http'),
  queue = require('queue');
  
var app = express();
app.use(express.static('public')).use(express.logger());
var server = http.createServer(app);
var queueio = io.listen(server);
server.listen(8080);//process.env.PORT || 10733);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/splash.html');
});

app.get('/player=dwa1', function (req, res) {
  res.sendfile(__dirname + '/public/player.html');
});

app.get('/game=dwa1', function (req, res) {
  res.sendfile(__dirname + '/public/game.html');
});

var players = queueio.of('/player=dwa1').on('connection', function(socket) {
	queue.config_player({
		socket: socket,
		id: socket.id
	});
});

queue.set_all_players(players);

queueio.of('/game=dwa1').on('connection', function(socket) {
	queue.config_game(socket);
});