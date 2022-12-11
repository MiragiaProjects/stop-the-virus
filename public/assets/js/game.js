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


// Will stop timer and see who won
const stopTimer = () => {
	
	clearInterval(userTimer)
	timePassed = Date.now() - beforeRound

	playerTimeEl.innerText = `${Math.floor(timePassed/1000)} : ${timePassed%1000}`
	randomPlaceEl.removeEventListener('click', stopTimer)
	randomPlaceEl.classList.remove('virus')

	socket.emit('game:round-result', timePassed)
};


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
