console.log("Game script loaded!");

// Firebase setup
const db = firebase.database();

// Game state
let gameId;
let playerId = "player-" + Math.random().toString(36).substring(2, 8);
let currentGame = {};

// DOM elements
const lobby = document.getElementById('lobby');
const game = document.getElementById('game');
const createBtn = document.getElementById('create-btn');
const joinBtn = document.getElementById('join-btn');
const gameIdInput = document.getElementById('game-id');
const playersContainer = document.getElementById('players-container');
const hand = document.getElementById('hand');
const actions = document.getElementById('actions');

// Create game
createBtn.addEventListener('click', () => {
    gameId = "game-" + Math.random().toString(36).substring(2, 6);
    const initialDeck = createDeck();
    
    db.ref(`games/${gameId}`).set({
        players: {},
        deck: initialDeck,
        discardPile: [],
        currentPlayer: null,
        status: "waiting"
    }).then(() => {
        alert(`Game created! ID: ${gameId}`);
        joinGame(gameId);
    }).catch(error => {
        console.error("Error creating game:", error);
        alert("Failed to create game. Check console.");
    });
});

// Join game
joinBtn.addEventListener('click', () => {
    const id = gameIdInput.value.trim();
    if (!id) return alert("Please enter a Game ID!");
    joinGame(id);
});

function joinGame(id) {
    gameId = id;
    db.ref(`games/${gameId}`).once('value').then(snapshot => {
        if (!snapshot.exists()) return alert("Game not found!");
        
        const gameData = snapshot.val();
        const playerCount = Object.keys(gameData.players || {}).length;
        
        db.ref(`games/${gameId}/players/${playerId}`).set({
            name: `Player ${playerCount + 1}`,
            hand: [],
            points: 0,
            ready: true
        }).then(() => {
            lobby.style.display = "none";
            game.style.display = "block";
            startGame();
        });
    }).catch(error => {
        console.error("Join error:", error);
        alert("Error joining game. Check console.");
    });
}

function startGame() {
    db.ref(`games/${gameId}`).on('value', snapshot => {
        currentGame = snapshot.val() || {};
        updateGameUI();
    });
}

function updateGameUI() {
    // Update players list
    playersContainer.innerHTML = Object.entries(currentGame.players || {}).map(([id, player]) => `
        <div class="player ${id === playerId ? 'you' : ''}">
            ${player.name}: ${player.points} pts
        </div>
    `).join('');
    
    // Update hand
    const myHand = currentGame.players?.[playerId]?.hand || [];
    hand.innerHTML = myHand.map(card => `
        <div class="card ${['hearts', 'diamonds'].includes(card.suit) ? 'red' : ''}">
            ${card.value}${getSuitSymbol(card.suit)}
            <span class="value">${getCardPoints(card)}</span>
        </div>
    `).join('');
}

// Game logic helpers
function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    let deck = [];
    
    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({ suit, value });
        });
    });
    
    // Add jokers
    deck.push({ value: 'Joker', suit: 'joker' });
    deck.push({ value: 'Joker', suit: 'joker' });
    
    return shuffleDeck(deck);
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function getSuitSymbol(suit) {
    const symbols = {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠'
    };
    return symbols[suit] || '';
}

function getCardPoints(card) {
    if (card.value === 'Joker') return 0;
    if (card.value === 'A') return 1;
    if (['J','Q','K'].includes(card.value)) {
        if (card.value === 'K' && ['hearts','diamonds'].includes(card.suit)) return -1;
        if (card.value === 'K') return 13;
        if (card.value === 'J') return 11;
        if (card.value === 'Q') return 12;
    }
    return parseInt(card.value);
}

console.log("Game initialized!");
