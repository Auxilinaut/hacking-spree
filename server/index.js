var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);

app.get('/', function(req, res){
  res.sendFile(path.resolve(__dirname + '/../dist/index.html'));
});

app.use('/',express.static(path.resolve(__dirname + '/../dist')));

http.listen(3000, '192.168.0.101', function(){
  console.log('listening on *:3000');
});

var io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('a user connected');

  // listen for disconnection; 
	socket.on('disconnect', onClientdisconnect);
	// listen for new player
	socket.on("new_player", onNewplayer);
	// listen for player position update
	socket.on("move_player", onMovePlayer);
});

var playerList = [];

//a player class in the server
var Player = function (startX, startY, startAngle) {
  this.x = startX
  this.y = startY
  this.angle = startAngle
}

// when a new player connects, we make a new instance of the player object,
// and send a new player message to the client. 
function onNewplayer (data) {
  console.log(data);
  //new player instance
  var newPlayer = new Player(data.x, data.y, data.angle);
  console.log(newPlayer);
  console.log("created new player with id " + this.id);
  newPlayer.id = this.id; 	
  //information to be sent to all clients except sender
  var current_info = {
    id: newPlayer.id, 
    x: newPlayer.x,
    y: newPlayer.y,
    angle: newPlayer.angle,
  }; 

  //send to the new player about everyone who is already connected. 	
  for (i = 0; i < playerList.length; i++) {
    existingPlayer = playerList[i];
    var player_info = {
      id: existingPlayer.id,
      x: existingPlayer.x,
      y: existingPlayer.y, 
      angle: existingPlayer.angle,			
    };
    console.log("pushing player");
    //send message to the sender-client only
    this.emit("new_player", player_info);
  }

  //send message to every connected client except the sender
  this.broadcast.emit('new_player', current_info);

  playerList.push(newPlayer);
}

//update the player position and send the information back to every client except sender
function onMovePlayer (data) {
	var movePlayer = findPlayerById(this.id); 
	movePlayer.x = data.x;
	movePlayer.y = data.y;
	movePlayer.angle = data.angle; 
	
	var moveplayerData = {
		id: movePlayer.id,
		x: movePlayer.x,
		y: movePlayer.y, 
		angle: movePlayer.angle
	}
	
	//send message to every connected client except the sender
	this.broadcast.emit('move_player', moveplayerData);
}

//call when a client disconnects and tell the clients except sender to remove the disconnected player
function onClientdisconnect() {
	console.log('disconnect'); 

	var removePlayer = findPlayerById(this.id); 
		
	if (removePlayer) {
		playerList.splice(playerList.indexOf(removePlayer), 1);
	}
	
	console.log("removing player " + this.id);
	
	//send message to every connected client except the sender
	this.broadcast.emit('remove_player', {id: this.id});
	
}

// find player by the the unique socket id 
function findPlayerById(id) {

	for (var i = 0; i < playerList.length; i++) {

		if (playerList[i].id == id) {
			return playerList[i]; 
		}
	}
	
	return false; 
}