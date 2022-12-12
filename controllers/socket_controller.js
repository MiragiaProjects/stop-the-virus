// Variables

let io = null;

const rooms = [];

let numberOfRooms = 0;
let queue = 0;    

let waitingTime = 0;       

let virusPlace = null;


// User joining
const userJoined = function(username, callback) {

	let startGame = false;
	
	if (queue === 0) {
		rooms.push({
			room_id: numberOfRooms++,
			numberOfPlayers: 0,
			status: 'queue', 
			players: {},
			playedRounds: 0, 
		});
	}

	const currentRoom = rooms[rooms.length - 1];
	if (currentRoom.numberOfPlayers > 0 && Object.values(currentRoom.players)[0].username === username) {
		callback({
			success: false,
			msg: 'Username already taken.',
		});
		return;
	}

	currentRoom.numberOfPlayers++;
	this.join(currentRoom);
	currentRoom.players[this.id] = {
		username,
		points: 0,
	 	previousReactionTime: null,
	};
	
	queue++;
	
	if (queue === 2) {
		queue = 0;

		currentRoom.status = 'started',
		startGame = true;

		timeAndPosition();
		io.in(currentRoom).emit('print:names', currentRoom.players);
		this.broadcast.to(currentRoom).emit('game:start', waitingTime, virusPlace);
	}
	callback({
		success: true,
		startGame,
		waitingTime,
		virusPlace, 
	});
}

// When a client disconnects
const userDisconnect = function() {
	
	const room = rooms.find(lobby => lobby.players.hasOwnProperty(this.id));
	
	if(!room) {
		return;
	}
	
	if (room.status === 'queue') {
		queue--;
		room.numberOfPlayers--;
		delete room.players[this.id];

	} else if (room.status === 'started') {
		room.numberOfPlayers--;
		this.broadcast.to(room).emit('game:leave');
	}
}


// set a time and place a virus
const timeAndPosition = () => {	
	waitingTime = Math.round(Math.random()*4000 + 600);
	virusPlace = Math.floor(Math.random() * 12);
} 


// Compare times to se who won
const userScore = function(reaction) {
	
	const room = rooms.find(lobby => lobby.players.hasOwnProperty(this.id));
	room.players[this.id].previousReactionTime = reaction;

	let foundNull = false;

	Object.values(room.players).forEach( (player) => {
		if (player.previousReactionTime === null) {
			foundNull = true;
		}
	} )

	// see if both players are done with round
	if (!foundNull) {

		const playerOne = Object.values(room.players)[0];
		const playerTwo = Object.values(room.players)[1];

		if (playerOne.previousReactionTime < playerTwo.previousReactionTime) {
			winningPlayer = playerOne.username;
			playerOne.points++;

		} else {
			winningPlayer = playerTwo.username;
			playerTwo.points++;
		}

		io.in(room).emit('game:round', winningPlayer, room.players);

		playerOne.previousReactionTime = null;
		playerTwo.previousReactionTime = null;
		room.playedRounds++;

		if(room.playedRounds < 10) {
			timeAndPosition();
			io.in(room).emit('game:start', waitingTime, virusPlace, room.players);

		} else {
			room.status = 'done';
			io.in(room).emit('game:over', playerOne, playerTwo);
		}
	};
}

// Export 
module.exports = function(socket, _io) {
	io = _io;

	// handle user disconnect
	socket.on('disconnect', userDisconnect);

	// handle user joined
	socket.on('user:joined', userJoined);

	// handle user score
	socket.on('game:round-result', userScore);
}