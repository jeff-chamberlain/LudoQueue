var io = require('socket.io'),
  express = require('express'),
  http = require('http'),
  suite = require('suite');
  
var app = express();
app.use(express.static('public')).use(express.logger());
var server = http.createServer(app);
var suiteio = io.listen(server);
server.listen(process.env.PORT || 10733);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/player.html');
});

app.get('/suite', function (req, res) {
  res.sendfile(__dirname + '/public/suite.html');
});

/*suiteio.configure(function () { 
  suiteio.set("transports", ["xhr-polling"]);
  suiteio.set("polling duration", 10); 
});*/


var players = suiteio.of('/player').on('connection', function(socket) {
	suite.config_player({
		socket: socket,
		id: socket.id
	});
});

suiteio.of('/suite').on('connection', function(socket) {
	suite.config_game(socket);
});

suite.set_all_players(players);