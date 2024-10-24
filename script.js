let width = 10;  // Width of the grid
let height = 10; // Height of the grid
let mineCount = 10; // Number of mines
let gameOver = false; // Game state
let timer; // Timer for the game
let timeElapsed = 0; // Track time
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

// Initialize the game
function initGame() {
    gameOver = false;
    timeElapsed = 0; // Reset timer
    document.getElementById('timer').textContent = 'Time: 0 seconds';
    document.getElementById('high-scores-list').innerHTML = ''; // Clear previous scores
    highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    displayHighScores(); // Show existing high scores
    const gameContainer = document.getElementById('game');
    gameContainer.innerHTML = ''; // Clear the game grid

    // Create the grid
    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i; // Set data index for each cell
        cell.addEventListener('click', () => handleCellClick(cell)); // Attach click event
        gameContainer.appendChild(cell); // Append cell to the grid
    }
    placeMines(); // Randomly place mines in the grid
    startTimer(); // Start the timer
}

// Start the timer
function startTimer() {
    timer = setInterval(() => {
        timeElapsed++; // Increment time
        document.getElementById('timer').textContent = `Time: ${timeElapsed} seconds`; // Update display
    }, 1000);
}

// Place mines randomly
function placeMines() {
    const cells = document.querySelectorAll('.cell');
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const index = Math.floor(Math.random() * cells.length);
        if (!cells[index].classList.contains('mine')) {
            cells[index].classList.add('mine'); // Mark mine
            minesPlaced++; // Count placed mine
        }
    }
}

// Handle cell click
function handleCellClick(cell) {
    if (gameOver || cell.classList.contains('revealed')) return; // Ignore if game is over or already revealed
    cell.classList.add('revealed'); // Reveal the cell
    if (cell.classList.contains('mine')) {
        cell.classList.add('exploded'); // Show explosion effect
        clearInterval(timer); // Stop the timer
        gameOver = true; // Mark game as over
        revealAllMines(); // Show all mines
        alert('Game Over! You hit a mine.'); // Notify player
    } else {
        const adjacentMines = countAdjacentMines(cell); // Count adjacent mines
        if (adjacentMines > 0) {
            cell.textContent = adjacentMines; // Display mine count
        } else {
            revealAdjacentCells(cell); // Reveal adjacent cells if no adjacent mines
        }
    }
    if (checkWin()) {
        clearInterval(timer); // Stop timer on win
        alert('Congratulations! You won the game!'); // Notify player
        addHighScore(timeElapsed); // Save time to high scores
        revealAllMines(); // Show all mines
    }
}

// Count adjacent mines
function countAdjacentMines(cell) {
    const index = parseInt(cell.dataset.index);
    let count = 0;
    // Check surrounding cells for mines
    [-1, 1, -width, width, -width - 1, -width + 1, width - 1, width + 1].forEach(offset => {
        const neighborIndex = index + offset;
        if (neighborIndex >= 0 && neighborIndex < width * height && 
            Math.abs((neighborIndex % width) - (index % width)) <= 1) {
            const neighborCell = document.querySelector(`.cell[data-index='${neighborIndex}']`);
            if (neighborCell && neighborCell.classList.contains('mine')) {
                count++; // Increment count if mine is found
            }
        }
    });
    return count; // Return total adjacent mines
}

// Reveal adjacent cells recursively
function revealAdjacentCells(cell) {
    const index = parseInt(cell.dataset.index);
    // Check surrounding cells
    [-1, 1, -width, width, -width - 1, -width + 1, width - 1, width + 1].forEach(offset => {
        const neighborIndex = index + offset;
        if (neighborIndex >= 0 && neighborIndex < width * height && 
            Math.abs((neighborIndex % width) - (index % width)) <= 1) {
            const neighborCell = document.querySelector(`.cell[data-index='${neighborIndex}']`);
            if (neighborCell && !neighborCell.classList.contains('revealed')) {
                handleCellClick(neighborCell); // Recursive call
            }
        }
    });
}

// Check if the player has won
function checkWin() {
    const revealedCells = document.querySelectorAll('.cell.revealed');
    return revealedCells.length === (width * height - mineCount); // Compare revealed cells to total
}

// Reveal all mines
function revealAllMines() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (cell.classList.contains('mine')) {
            cell.classList.add('revealed'); // Reveal all mines
        }
    });
}

// Add high score
function addHighScore(time) {
    highScores.push(time); // Add time to high scores
    highScores.sort((a, b) => a - b); // Sort scores
    highScores = highScores.slice(0, 5);  // Keep only top 5 scores
    localStorage.setItem('highScores', JSON.stringify(highScores)); // Save to localStorage
    displayHighScores(); // Update high scores display
}

// Display high scores
function displayHighScores() {
    const highScoresList = document.getElementById('high-scores-list');
    highScoresList.innerHTML = ''; // Clear previous scores
    highScores.forEach(score => {
        const li = document.createElement('li');
        li.textContent = `${score} seconds`; // Display each score
        highScoresList.appendChild(li);
    });
}

// Start the game on load
window.onload = initGame; // Initialize game when window loads
