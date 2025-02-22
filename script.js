let GRID_SIZE = 5;
let NUM_MINES = 5;
let balance = 100;
let stakeAmount = 0;
let grid = [];
let gameOver = false;
let currentUser = null;
let multiplier = 1; // Default multiplier

// User data storage
const users = JSON.parse(localStorage.getItem('users')) || {};

// Sign-Up
document.getElementById('signup-button').addEventListener('click', () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (users[email]) {
        alert('User already exists!');
        return;
    }

    users[email] = { email, password, balance: 100 };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Sign-up successful! Please log in.');
    showLoginForm();
});

// Log In
document.getElementById('login-button').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!users[email] || users[email].password !== password) {
        alert('Invalid email or password!');
        return;
    }

    currentUser = users[email];
    document.getElementById('user-email').textContent = currentUser.email;
    document.getElementById('game-content').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
    loadUserData();
});

// Show Login Form
document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

// Show Sign-Up Form
document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    showSignupForm();
});

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
}

function showSignupForm() {
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
}

// Load user data
function loadUserData() {
    balance = currentUser.balance;
    document.getElementById('balance').textContent = balance;
}

// Save user data
function saveUserData() {
    currentUser.balance = balance;
    users[currentUser.email] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
}

// Initialize the grid
function initializeGrid() {
    grid = Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => ({
            isMine: false,
            isRevealed: false,
        }))
    );

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < NUM_MINES) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        if (!grid[row][col].isMine) {
            grid[row][col].isMine = true;
            minesPlaced++;
        }
    }

    renderGrid();
}

// Render the grid
function renderGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 50px)`;
    gridElement.style.gridTemplateRows = `repeat(${GRID_SIZE}, 50px)`;
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.dataset.row = row;
            tile.dataset.col = col;
            tile.addEventListener('click', handleTileClick);
            gridElement.appendChild(tile);
        }
    }
}

// Handle tile click
function handleTileClick(event) {
    if (gameOver) return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const tile = grid[row][col];

    if (tile.isRevealed) return;

    tile.isRevealed = true;
    event.target.classList.add('revealed');

    if (tile.isMine) {
        event.target.textContent = '💣';
        event.target.classList.add('mine');
        gameOver = true;
        balance -= stakeAmount;
        document.getElementById('balance').textContent = balance;
        document.getElementById('message').textContent = `You hit a mine! You lost ${stakeAmount} coins.`;
        revealAllMines();
    } else {
        event.target.textContent = '💎'; // Show diamond for safe tile
        const reward = Math.floor(Math.random() * 10) + 1; // Random reward
        const totalReward = reward * multiplier; // Apply multiplier
        balance += totalReward;
        document.getElementById('balance').textContent = balance;
        document.getElementById('message').textContent = `You found ${reward} coins! (${multiplier}x multiplier applied: ${totalReward} coins)`;
    }
    saveUserData(); // Save balance after each move
}

// Reveal all mines when the game is over
function revealAllMines() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const tile = grid[row][col];
            if (tile.isMine) {
                const tileElement = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                tileElement.classList.add('mine');
                tileElement.textContent = '💣';
            }
        }
    }
}

// Start the game
document.getElementById('startButton').addEventListener('click', () => {
    stakeAmount = parseInt(document.getElementById('stakeAmount').value);
    multiplier = parseInt(document.getElementById('multiplier').value); // Get selected multiplier
    if (stakeAmount > balance) {
        document.getElementById('message').textContent = "You don't have enough coins to stake that amount!";
        return;
    }
    gameOver = false;
    document.getElementById('message').textContent = '';
    initializeGrid();
});

// Show purchase dialog
document.getElementById('buyCoinsButton').addEventListener('click', () => {
    document.getElementById('purchaseDialog').style.display = 'block';
});

// Close purchase dialog
document.getElementById('closeDialogButton').addEventListener('click', () => {
    document.getElementById('purchaseDialog').style.display = 'none';
});

// Handle coin package purchase
document.querySelectorAll('.coin-package').forEach(package => {
    package.addEventListener('click', () => {
        const amount = parseInt(package.dataset.amount);
        const price = parseFloat(package.dataset.price);

        // Simulate purchase process
        alert(`You have successfully purchased ${amount} coins for $${price.toFixed(2)}!`);
        balance += amount;
        document.getElementById('balance').textContent = balance;
        document.getElementById('purchaseDialog').style.display = 'none';
        saveUserData(); // Save balance after purchase
    });
});

// Show admin panel
document.getElementById('adminButton').addEventListener('click', () => {
    document.getElementById('adminPanel').style.display = 'block';
});

// Admin login
document.getElementById('loginButton').addEventListener('click', () => {
    const password = document.getElementById('adminPassword').value;
    if (password === "admin123") { // Hardcoded password for simplicity
        document.getElementById('adminControls').style.display = 'block';
    } else {
        alert("Incorrect password!");
    }
});

// Save admin settings
document.getElementById('saveSettingsButton').addEventListener('click', () => {
    GRID_SIZE = parseInt(document.getElementById('gridSize').value);
    NUM_MINES = parseInt(document.getElementById('numMines').value);
    balance = parseInt(document.getElementById('resetBalance').value);
    document.getElementById('balance').textContent = balance;
    initializeGrid();
    alert("Settings saved!");
});

// Close admin panel
document.getElementById('closeAdminPanelButton').addEventListener('click', () => {
    document.getElementById('adminPanel').style.display = 'none';
});