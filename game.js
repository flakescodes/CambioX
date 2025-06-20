// Firebase Database Reference
const db = firebase.database();

// Game State
let gameId;
let playerId = Math.random().toString(36).substring(2, 10);

// DOM Elements
const lobbyDiv = document.getElementById('lobby');
const gameDiv = document.getElementById('game');
const createBtn = document.getElementById('create-btn');
const joinBtn = document.getElementById('join-btn');
const gameIdInput = document.getElementById('game-id');

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
    const gameId = gameIdInput.value.trim();
    if (!gameId) return alert("Please enter a Game ID!");
    joinGame(gameId);
});

function joinGame(id) {
    gameId = id;
    db.ref(`games/${gameId}/players/${playerId}`).set({
        name: `Player ${Object.keys(gameState || {}).length + 1}`,
        hand: [],
        points: 0
    }).then(() => {
        lobbyDiv.style.display = "none";
        gameDiv.style.display = "block";
        startGame();
    });
}

function startGame() {
    db.ref(`games/${gameId}`).on('value', (snapshot) => {
        const game = snapshot.val();
        updateUI(game);
    });
}

function updateUI(game) {
    const playersDiv = document.getElementById('players');
    playersDiv.innerHTML = Object.entries(game.players).map(([id, player]) => 
        `<div>${player.name}: ${player.points} pts</div>`
    ).join('');
}
