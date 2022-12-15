// Socket variable
const socket = io()

// Document elements
const enterScreenEl = document.querySelector('#enter-screen')
const enterFormEl = document.querySelector('#enter-form')     
const waitingEl = document.querySelector('#waiting')
const resultScreenEl = document.querySelector('#results') 
const winnerEl = document.querySelector('#winnersName')
const userResultEl = document.querySelector('#result')
const placeEl = document.querySelectorAll('.place')
const userScoreEl = document.querySelector('#user')
const opponentScoreEl = document.querySelector('#opponent')
const gameBoardEl = document.querySelector('#game-board')
const playerTimeEl = document.querySelector('#userTime h5')
const opponentTimeEl = document.querySelector('#opponentTime h5')

const roundCountdownEl = document.querySelector('#round-countdown')
const roundCountdownInfoEl = document.querySelector('#round-countdown p')
const roundCountdownSpanEl = document.querySelector('#round-countdown span')

const usernameErrorEl = document.querySelector('#username-error')

// Variables
let username = null
let userScore = 0
let userTimer = null

let opponent = null
let opponentScore = 0
let opponentTimer = null

let timePassed = null
let beforeRound = null

let randomPlaceEl = null 

let countdownInterval = null

let countdown = 2


// Will start a new round and place the virus
const startTimer = (virusPlace) => {
	
	timePassed = 0

	beforeRound = Date.now()
	userTimer = setInterval( () => {
		timePassed = Date.now() - beforeRound
		playerTimeEl.innerText = `${Math.floor(timePassed/1000)} : ${timePassed%1000}`
	}, 10 )

	opponentTimer = setInterval( () => {
		let opponentTime = Date.now() - beforeRound
		opponentTimeEl.innerText = `${Math.floor(opponentTime/1000)} : ${opponentTime%1000}`
	}, 10 )

	randomPlaceEl = placeEl[virusPlace]
	randomPlaceEl.classList.add('virus')

	randomPlaceEl.addEventListener('click', stopTimer)
	
};

// Will stop timer and see who won
const stopTimer = () => {
	
	clearInterval(userTimer)
	timePassed = Date.now() - beforeRound

	playerTimeEl.innerText = `${Math.floor(timePassed/1000)} : ${timePassed%1000}`
	randomPlaceEl.removeEventListener('click', stopTimer)
	randomPlaceEl.classList.remove('virus')

	socket.emit('game:round-result', timePassed)
};

// The countdown between rounds
const countdownBeforeRound = (waitingTime, virusPlace) => {
	
	countdown--
	
	roundCountdownSpanEl.innerText = countdown

	if (countdown === 0) {

		clearInterval(countdownInterval)
		roundCountdownEl.classList.add('hide')
		placeEl.forEach(place => {
			place.classList.remove('hide')
		});

		countdown = 2
		roundCountdownSpanEl.innerText = countdown

		setTimeout(startTimer, waitingTime, virusPlace)
	
	}
};

// New round
const gameRound = (waitingTime, virusPlace) => {

	placeEl.forEach(place => {
		place.classList.remove('virus')
		place.classList.add('hide')
	})

	roundCountdownEl.classList.remove('hide')
	countdownInterval = setInterval(countdownBeforeRound, 1000, waitingTime, virusPlace)

};

// Add username and join game and check status
enterFormEl.addEventListener('submit', (e) => {
	e.preventDefault()
 
	username = enterFormEl.username.value
	
	socket.emit('user:joined', username, (status) => {
		if (status.success) {

			enterScreenEl.classList.add('hide')

			waitingEl.classList.remove('hide')

			if (status.startGame) {
				waitingEl.classList.add('hide')
				gameBoardEl.classList.remove('hide')
				userScoreEl.innerText = `${username} score: ${userScore}`
				opponentScoreEl.innerText = `${opponent} score: ${opponentScore}`
				gameRound(status.waitingTime, status.virusPlace)
			}
			
		} else if (!status.success) {
			usernameErrorEl.classList.remove('hide')
			usernameErrorEl.innerText = status.msg
		}
	})

})

// Socket ons sent from backend
socket.on('game:round', (winner, players) => {

	const opponent = Object.values(players).find( player => player.username !== username)

	clearInterval(opponentTimer)

	opponentTimeEl.innerText = `${Math.floor(opponent.previousReactionTime/1000)} : ${opponent.previousReactionTime%1000}`
	
	if (winner === username) {
		userScoreEl.innerText = `${username} score: ${++userScore}`
		roundCountdownInfoEl.innerText = 'Oh, yes! You won the round!'
		roundCountdownInfoEl.classList.add('won-round')
		roundCountdownInfoEl.classList.remove('lost-round')

	} else {
		opponentScoreEl.innerText = `${opponent.username} score: ${++opponentScore}`
		roundCountdownInfoEl.innerText = 'Oh, no. You lost the round!'
		roundCountdownInfoEl.classList.add('lost-round')
		roundCountdownInfoEl.classList.remove('won-round')
	}
});

socket.on('game:start', (waitingTime, virusPlace) => {

	waitingEl.classList.add('hide')
	gameBoardEl.classList.remove('hide')

	userScoreEl.innerText = `${username} score: ${userScore}`
	opponentScoreEl.innerText = `${opponent} score: ${opponentScore}`

	gameRound(waitingTime, virusPlace)
});

socket.on('game:leave', () => {
	waitingEl.classList.add('hide')
	gameBoardEl.classList.add('hide')
	resultScreenEl.classList.remove('hide')

	winnerEl.innerHTML = `You won the game!`
	userResultEl.innerHTML = `Opponent disconnected`
});

socket.on('print:names', (players) => {

	username = enterFormEl.username.value

	const playerList = Object.values(players)
	const playerNames = []

	playerList.forEach( (player) => {
		playerNames.push(player.username)
	} )

	const player1 = playerNames.indexOf(username)
	playerNames.splice(player1, 1)
	opponent = playerNames

});

socket.on('game:over', (playerOne, playerTwo) => {

	waitingEl.classList.add('hide')
	gameBoardEl.classList.add('hide')
	resultScreenEl.classList.remove('hide')

	 let self 
	 if (playerOne.username === username) {
	 	self = playerOne
	 } else {
	 	 self = playerTwo
	 }

	 let opponent
	 if (playerOne.username === username) {
	 	 opponent = playerTwo
	 } else {
	 	 opponent = playerOne
	 }
	
	if(self.points > opponent.points) {
		userResultEl.innerHTML = `Oh, yes! You won! Score: ${self.points} - ${opponent.points}`
		userResultEl.classList.add('winResult')

	} else if (opponent.points > self.points) {
		userResultEl.innerHTML = `Oh, no! You lost! Score: ${self.points} - ${opponent.points}`
		userResultEl.classList.add('loseResult')

	} else if(self.points === opponent.points) {
		userResultEl.innerHTML = `Oh. It's a tie! Score: ${self.points} - ${opponent.points}`
	}
})


