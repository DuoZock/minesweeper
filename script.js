let width = 10;
let height = 10;
let mineCount = 10;
let grid = [];
let minePositions = [];
let startTime;
let timerInterval;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

// Initialize the game
function initGame() {
    clearInterval(timerInterval);
    document.getElementById('game').innerHTML = '';
    document.getElementById('timer').textContent = 'Time: 0';
    grid = [];
    minePositions = [];
    startTime = Date.now();

    // Start timer
    timerInterval = setInterval(updateTimer, 1000);

    // Set up the grid layout
    document.getElementById('game').style.gridTemplateColumns = `repeat(${width}, 30px)`;

    // Create cells for the grid
    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', (event) => handleClick(cell, event));
        cell.addEventListener('contextmenu', (event) => handleClick(cell, event)); // Right-click for flagging
        document.getElementById('game').appendChild(cell);
        grid.push(cell);
    }

    placeMines();
    displayHighScores();
}

// Update the timer
function updateTimer() {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').textContent = `Time: ${timeElapsed}`;
}

// Place mines randomly on the grid
function placeMines() {
    let placed = 0;
    while (placed < mineCount) {
        const index = Math.floor(Math.random() * width * height);
        if (!minePositions.includes(index)) {
            minePositions.push(index);
            placed++;
        }
    }
}

// Handle left-click and right-click
function handleClick(cell, event) {
    event.preventDefault();  // Prevent default right-click menu
    const clickSound = document.getElementById('click-sound');
    const explosionSound = document.getElementById('explosion-sound');

    const index = parseInt(cell.getAttribute('data-index'));

    // Right-click to place a flag
    if (event.button === 2) {
        toggleFlag(cell);
    } 
    // Left-click to reveal a cell
    else {
        clickSound.play();
        if (minePositions.includes(index)) {
            explosionSound.play();
            revealAllMines();
            clearInterval(timerInterval);
            alert("Game Over! You clicked on a mine.");
        } else {
            revealCell(cell);
            checkForWin();
        }
    }
}

// Toggle flag for a cell (right-click)
function toggleFlag(cell) {
    if (!cell.classList.contains('revealed')) {
        if (cell.textContent === '🚩') {
            cell.textContent = '';  // Remove flag
        } else {
            cell.textContent = '🚩';  // Add flag
        }
    }
}

// Reveal a cell (left-click)
function revealCell(cell) {
    if (cell.classList.contains('revealed')) return;

    cell.classList.add('revealed');
    const index = parseInt(cell.getAttribute('data-index'));
    const surroundingMines = countSurroundingMines(index);

    if (surroundingMines > 0) {
        cell.textContent = surroundingMines;
    }
}

// Count the number of surrounding mines for a given cell
function countSurroundingMines(index) {
    const offsets = [-1, 1, -width, width, -width - 1, -width + 1, width - 1, width + 1];
    let mineCount = 0;

    offsets.forEach(offset => {
        const neighborIndex = index + offset;
        if (neighborIndex >= 0 && neighborIndex < width * height && minePositions.includes(neighborIndex)) {
            mineCount++;
        }
    });

    return mineCount;
}

// Reveal all mines when the game is over
function revealAllMines() {
    minePositions.forEach(index => {
        const mineCell = grid[index];
        mineCell.classList.add('revealed');
        mineCell.textContent = '💣';  // Show mine
    });
}

// Check if the player has won
function checkForWin() {
    let revealedCells = 0;
    grid.forEach(cell => {
        if (cell.classList.contains('revealed')) {
            revealedCells++;
        }
    });

    // Player wins if all non-mine cells are revealed
    if (revealedCells === (width * height) - mineCount) {
        clearInterval(timerInterval);
        const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
        alert(`Congratulations! You won the game in ${timeElapsed} seconds!`);
        addHighScore(timeElapsed);
        document.getElementById('win-sound').play();
        revealAllMines();
    }
}

// Change difficulty level (grid size and number of mines)
function changeDifficulty() {
    const difficulty = document.getElementById('difficulty').value;
    switch (difficulty) {
        case 'easy':
            width = 10;
            height = 10;
            mineCount = 10;
            break;
        case 'medium':
            width = 16;
            height = 16;
            mineCount = 40;
            break;
        case 'hard':
            width = 24;
            height = 24;
            mineCount = 99;
            break;
    }
    initGame();  // Restart the game with new settings
}

// High Scores - Add and display
function addHighScore(time) {
    highScores.push(time);
    highScores.sort((a, b) => a - b);
    highScores = highScores.slice(0, 5);  // Keep only top 5 scores
    localStorage.setItem('highScores', JSON.stringify(highScores));
    displayHighScores();
}

function displayHighScores() {
    const highScoresList = document.getElementById('high-scores-list');
    highScoresList.innerHTML = '';
    highScores.forEach(score => {
        const li = document.createElement('li');
        li.textContent = `${score} seconds`;
        highScoresList.appendChild(li);
    });
}

// Initialize the game on page load
initGame();
