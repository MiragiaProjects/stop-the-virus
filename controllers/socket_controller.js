
// Variables

let io = null;

const rooms = [];

let numberOfRooms = 0;
let queue = 0;    

let waitingTime = 0;       

let virusPlace = null;


// set a time and place a virus
const timeAndPosition = () => {	
	waitingTime = Math.round(Math.random()*4000 + 600);
	virusPlace = Math.floor(Math.random() * 12);
} 

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