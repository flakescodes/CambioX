// Firebase Setup
const db = firebase.database();

// Game State
let gameId;
let playerId = "player-" + Math.random().toString(36).substring(2, 8);

// DOM Elements
const lobbyDiv = document.getElementById('lobby');
const gameDiv = document.getElementById('game');
const createBtn = document.getElementById('create-btn');
const joinBtn = document.getElementById('join-btn');
const gameIdInput = document.getElementById('game-id');
const playersDiv = document.getElementById('players');

// Create Game
createBtn.addEventListener('click', () => {
    gameId = "game-" + Math.random().toString(36).substring(2, 6);
    db.ref(`games/${gameId}`).set({
        players: {},
        status: "waiting"
    }).then(() => {
        alert(`Game created! ID: ${gameId}`);
        joinGame(gameId);
    });
});

// Join Game (FIXED VERSION - no gameState reference)
joinBtn.addEventListener('click', () => {
    const id = gameIdInput.value.trim();
    if (!id) return alert("Enter Game ID!");
    joinGame(id);
});

function joinGame(id) {
    gameId = id;
    db.ref(`games/${gameId}`).once('value').then(snapshot => {
        if (!snapshot.exists()) return alert("Game not found!");
        
        // Count existing players safely
        const playerCount = Object.keys(snapshot.val().players || {}).length;
        
        db.ref(`games/${gameId}/players/${playerId}`).set({
            name: `Player_${playerCount + 1}`,
            points: 0
        }).then(() => {
            lobbyDiv.style.display = "none";
            gameDiv.style.display = "block";
            startGame();
        });
    });
}

function startGame() {
    db.ref(`games/${gameId}`).on('value', snapshot => {
        const gameData = snapshot.val();
        if (!gameData) return;
        
        playersDiv.innerHTML = Object.entries(gameData.players || {}).map(([id, player]) => 
            `<div>${player.name}: ${player.points} pts</div>`
        ).join('');
    });
}
