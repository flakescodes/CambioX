console.log("Script loaded!"); // Debug check

// Initialize Firebase
const db = firebase.database();

// Game state
let gameId;
let playerId = "player-" + Math.random().toString(36).substring(2, 8);

// DOM elements
const lobby = document.getElementById('lobby');
const game = document.getElementById('game');
const createBtn = document.getElementById('create-btn');
const joinBtn = document.getElementById('join-btn');
const gameIdInput = document.getElementById('game-id');
const playersDiv = document.getElementById('players');

// Create game
createBtn.addEventListener('click', () => {
    gameId = "game-" + Math.random().toString(36).substring(2, 6);
    db.ref(`games/${gameId}`).set({
        players: {},
        status: "waiting"
    }).then(() => {
        alert(`Game created! ID: ${gameId}`);
        joinGame(gameId);
    }).catch(error => {
        console.error("Create error:", error);
        alert("Error creating game. Check console.");
    });
});

// Join game
joinBtn.addEventListener('click', () => {
    const id = gameIdInput.value.trim();
    if (!id) return alert("Enter Game ID!");
    joinGame(id);
});

function joinGame(id) {
    gameId = id;
    db.ref(`games/${gameId}`).once('value').then(snapshot => {
        if (!snapshot.exists()) {
            alert("Game not found!");
            return;
        }
        
        // Add player to game
        db.ref(`games/${gameId}/players/${playerId}`).set({
            name: `Player_${Object.keys(snapshot.val().players || {}).length + 1}`,
            points: 0
        }).then(() => {
            lobby.style.display = "none";
            game.style.display = "block";
            startGame();
        });
    }).catch(error => {
        console.error("Join error:", error);
        alert("Error joining. Check console.");
    });
}

function startGame() {
    db.ref(`games/${gameId}`).on('value', snapshot => {
        const gameData = snapshot.val();
        if (!gameData) return;
        
        // Update players list
        playersDiv.innerHTML = Object.entries(gameData.players || {}).map(([id, player]) => 
            `<div>${player.name}: ${player.points} pts</div>`
        ).join('');
    });
}
