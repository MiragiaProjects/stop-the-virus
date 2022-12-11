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
