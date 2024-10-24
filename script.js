let width = 10;  // Width of the grid
let height = 10; // Height of the grid
let mineCount = 10; // Number of mines
let gameOver = false; // Game state
let timer; // Timer for the game
let timeElapsed = 0; // Track time
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

// Initialize the game
function initGame() {
    const difficulty = document.getElementById('difficulty').value; // Get selected difficulty

    // Set width, height, and mine count based on difficulty
    if (difficulty === 'easy') {
        width = 8;
        height = 8;
        mineCount = 10;
    } else if (difficulty === 'medium') {
        width = 10;
        height = 10;
        mineCount = 20;
    } else if (difficulty === 'hard') {
        width = 15;
        height = 15;
        mineCount = 30;
    }

    gameOver = false;
    timeElapsed = 0; // Reset timer
    document.getElementById('timer').textContent = 'Zeit: 0 Sekunden';
    document.getElementById('high-scores-list').innerHTML = ''; // Clear previous scores
    highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    displayHighScores(); // Show existing high scores
    const gameContainer = document.getElementById('game');
    gameContainer.innerHTML = ''; // Clear the game grid

    // Set grid template columns and rows based on width and height
    gameContainer.style.gridTemplateColumns = `repeat(${width}, 1fr)`; // Create grid layout

    // Create the grid
    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i; // Set data index for each cell
        cell.addEventListener('click', () => handleCellClick(cell)); // Attach click event
        cell.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent the default context menu
            handleRightClick(cell); // Handle right click
        });
        gameContainer.appendChild(cell); // Append cell to the grid
    }
    placeMines(); // Randomly place mines in the grid
    startTimer(); // Start the timer
}

// Start the timer
function startTimer() {
    timer = setInterval(() => {
        timeElapsed++; // Increment time
        document.getElementById('timer').textContent = `Zeit: ${timeElapsed} Sekunden`; // Update display
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
        clearInterval(timer); // Stop timer
        revealAllMines(); // Reveal all mines
        alert('Spiel vorbei! Du hast eine Mine getroffen.'); // Game over alert
        gameOver = true; // Set game over
        return;
    }
    const neighborCount = countNeighborMines(cell); // Count neighboring mines
    cell.textContent = neighborCount || ''; // Set the text based on neighbor count
    if (neighborCount === 0) {
        revealNeighbors(cell); // Reveal neighboring cells if no neighbors
    }
    if (checkWin()) {
        clearInterval(timer); // Stop timer
        addHighScore(timeElapsed); // Add to high scores
        alert('Herzlichen Glückwunsch! Du hast gewonnen!'); // Win alert
        gameOver = true; // Set game over
    }
}

// Handle right-click for flagging
function handleRightClick(cell) {
    if (gameOver || cell.classList.contains('revealed')) return; // Ignore if game is over or already revealed
    cell.classList.toggle('flagged'); // Toggle flagged state
}

// Count neighboring mines
function countNeighborMines(cell) {
    const index = parseInt(cell.dataset.index);
    const neighbors = [
        index - width - 1, index - width, index - width + 1,
        index - 1,                     index + 1,
        index + width - 1, index + width, index + width + 1,
    ];
    let mineCount = 0;
    neighbors.forEach(neighborIndex => {
        const neighborCell = document.querySelector(`[data-index='${neighborIndex}']`);
        if (neighborCell && neighborCell.classList.contains('mine')) {
            mineCount++; // Count mine if present
        }
    });
    return mineCount; // Return total mines around the cell
}

// Reveal neighboring cells
function revealNeighbors(cell) {
    const index = parseInt(cell.dataset.index);
    const neighbors = [
        index - width - 1, index - width, index - width + 1,
        index - 1,                     index + 1,
        index + width - 1, index + width, index + width + 1,
    ];
    neighbors.forEach(neighborIndex => {
        const neighborCell = document.querySelector(`[data-index='${neighborIndex}']`);
        if (neighborCell && !neighborCell.classList.contains('revealed')) {
            handleCellClick(neighborCell); // Recursively reveal cells
        }
    });
}

// Reveal all mines
function revealAllMines() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (cell.classList.contains('mine')) {
            cell.classList.add('revealed', 'exploded'); // Show mines
        }
    });
}

// Check win condition
function checkWin() {
    const cells = document.querySelectorAll('.cell');
    const totalCells = cells.length;
    const revealedCells = Array.from(cells).filter(cell => cell.classList.contains('revealed')).length;
    return (totalCells - revealedCells) === mineCount; // Check if the remaining cells are mines
}

// Add high score
function addHighScore(time) {
    highScores.push(time); // Add time to high scores
    highScores.sort((a, b) => a - b); // Sort high scores
    highScores = highScores.slice(0, 5); // Keep only top 5 scores
    localStorage.setItem('highScores', JSON.stringify(highScores)); // Store in local storage
    displayHighScores(); // Display updated high scores
}

// Display high scores
function displayHighScores() {
    const list = document.getElementById('high-scores-list');
    list.innerHTML = ''; // Clear previous scores
    highScores.forEach(score => {
        const listItem = document.createElement('li');
        listItem.textContent = `${score} Sekunden`;
        list.appendChild(listItem); // Append each score to the list
    });
}
