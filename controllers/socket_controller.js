
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