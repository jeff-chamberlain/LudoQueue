var io = require('socket.io'),
  express = require('express'),
  http = require('http'),
  surfer = require('surfer');
  
var app = express();
app.use(express.static('public')).use(express.logger());
var server = http.createServer(app);
var suiteio = io.listen(server);
server.listen(process.env.PORT || 10733);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

app.get('/surf', function (req, res) {
  res.sendfile(__dirname + '/public/surf.html');
});

suiteio.configure(function () { 
  suiteio.set("transports", ["xhr-polling"]); 
  suiteio.set("polling duration", 10); 
});

surfer.config_all(suiteio.sockets);

suiteio.of('/player').on('connection', function(socket) {
	surfer.config_player({
		socket: socket,
		username: socket.id
	});
});

suiteio.of('/surf').on('connection', function(socket) {
	surfer.config_surf(socket);
});