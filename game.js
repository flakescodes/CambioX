// ======================
// Firebase Setup
// ======================
const db = firebase.database();

// ======================
// Game State
// ======================
let gameId;
let playerId = "player-" + Math.random().toString(36).substring(2, 8);
let myCards = [];

// ======================
// DOM Elements
// ======================
const lobbyDiv = document.getElementById('lobby');
const gameDiv = document.getElementById('game');
const createBtn = document.getElementById('create-btn');
const joinBtn = document.getElementById('join-btn');
const gameIdInput = document.getElementById('game-id');
const playersDiv = document.getElementById('players');
const cardsDiv = document.getElementById('cards');
const actionsDiv = document.getElementById('actions');

// ======================
// Initialize Game
// ======================
createBtn.addEventListener('click', createGame);
joinBtn.addEventListener('click', () => joinGame(gameIdInput.value.trim()));

// ======================
// Core Game Functions
// ======================
function createGame() {
    gameId = "game-" + Math.random().toString(36).substring(2, 6);
    const initialDeck = shuffleDeck(createDeck());
    
    db.ref(`games/${gameId}`).set({
        players: {},
        deck: initialDeck,
        discardPile: [],
        currentPlayer: null,
        status: "waiting"
    }).then(() => {
        alert(`Game created! ID: ${gameId}`);
        joinGame(gameId);
    });
}

function joinGame(id) {
    if (!id) return alert("Enter Game ID!");
    gameId = id;
    
    db.ref(`games/${gameId}`).once('value').then(snapshot => {
        if (!snapshot.exists()) return alert("Game not found!");
        
        const gameData = snapshot.val();
        const playerCount = Object.keys(gameData.players || {}).length;
        
        db.ref(`games/${gameId}/players/${playerId}`).set({
            name: `Player_${playerCount + 1}`,
            hand: [],
            visibleCards: [],
            points: 0,
            ready: false
        }).then(() => {
            lobbyDiv.style.display = "none";
            gameDiv.style.display = "block";
            startGame();
        });
    });
}

function startGame() {
    db.ref(`games/${gameId}`).on('value', snapshot => {
        const game = snapshot.val();
        if (!game) return;
        
        updatePlayersUI(game.players);
        
        // Start game if 2+ players and host triggers
        if (game.status === "playing") {
            if (game.currentPlayer === playerId) {
                showPlayerTurnUI();
            }
            renderCards(game);
        }
    });
}

// ======================
// Card Logic
// ======================
function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    let deck = [];
    
    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({ suit, value });
        });
    });
    
    // Add jokers
    deck.push({ value: 'Joker', suit: 'joker' });
    deck.push({ value: 'Joker', suit: 'joker' });
    
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function renderCards(game) {
    cardsDiv.innerHTML = '';
    const me = game.players[playerId];
    
    // Show player's hand
    me.hand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.innerHTML = `
            <span class="value">${getCardValue(card)}</span>
        `;
        cardsDiv.appendChild(cardEl);
    });
}

function getCardValue(card) {
    if (card.value === 'Joker') return '🃏';
    return `${card.value}${getSuitSymbol(card.suit)}`;
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

// ======================
// UI Helpers
// ======================
function updatePlayersUI(players) {
    playersDiv.innerHTML = Object.entries(players).map(([id, player]) => `
        <div class="${id === playerId ? 'you' : ''}">
            ${player.name}: ${player.points} pts
        </div>
    `).join('');
}

function showPlayerTurnUI() {
    actionsDiv.innerHTML = `
        <button id="draw-card">Draw Card</button>
        <button id="call-cambio">Call Cambio!</button>
    `;
    
    document.getElementById('draw-card').addEventListener('click', drawCard);
    document.getElementById('call-cambio').addEventListener('click', callCambio);
}

// ======================
// Game Actions
// ======================
function drawCard() {
    db.ref(`games/${gameId}`).once('value').then(snapshot => {
        const game = snapshot.val();
        if (game.deck.length === 0) return alert("Deck is empty!");
        
        const newCard = game.deck.pop();
        const updates = {
            [`games/${gameId}/deck`]: game.deck,
            [`games/${gameId}/players/${playerId}/hand`]: [...game.players[playerId].hand, newCard]
        };
        
        db.ref().update(updates);
    });
}

function callCambio() {
    db.ref(`games/${gameId}/status`).set("ended");
    calculateWinner();
}

function calculateWinner() {
    // Implement scoring logic here
}

// Initialize
console.log("Game initialized!");
