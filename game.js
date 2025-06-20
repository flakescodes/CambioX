// Firebase Setup
const db = firebase.database();

// Game Elements
const lobbyDiv = document.getElementById('lobby');
const gameDiv = document.getElementById('game');
const createBtn = document.getElementById('create-btn');
const joinBtn = document.getElementById('join-btn');
const gameIdInput = document.getElementById('game-id');
const playersDiv = document.getElementById('players');
const cardsDiv = document.getElementById('cards');
const cambioBtn = document.getElementById('cambio-btn');

let gameId;
let playerId = Math.random().toString(36).substring(2, 10);

// Create Game
createBtn.addEventListener('click', () => {
    gameId = Math.random().toString(36).substring(2, 8);
    db.ref(`games/${gameId}`).set({
        players: {},
        deck: [],
        status: "waiting"
    }).then(() => {
        alert(`Game created! Share this ID: ${gameId}`);
        joinGame(gameId);
    });
});

// Join Game
joinBtn.addEventListener('click', () => {
    joinGame(gameIdInput.value.trim());
});

function joinGame(id) {
    gameId = id;
    db.ref(`games/${gameId}/players/${playerId}`).set({
        name: `Player ${Object.keys(gameState.players || {}).length + 1}`,
        hand: [],
        points: 0
    });
    lobbyDiv.style.display = "none";
    gameDiv.style.display = "block";
    startGame();
}

function startGame() {
    db.ref(`games/${gameId}`).on('value', (snapshot) => {
        const game = snapshot.val();
        updateUI(game);
    });
}

function updateUI(game) {
    playersDiv.innerHTML = Object.values(game.players).map(p => 
        `<div>${p.name}: ${p.points} pts</div>`
    ).join('');
}