var io = require('socket.io'),
  express = require('express');
  
var app = express().use(express.static('public')).use(express.logger()).listen(process.env.PORT || 5000);
var game = io.listen(app);