let secretCode;
let attempts = 0;
const maxAttempts = 6;
let currentInputPosition = 0;
let randomNum;

document.getElementById('restart-button').addEventListener('click', startGame);
document.addEventListener('keydown', handleKeyDown);

startGame();

function startGame() {
    randomNum = Math.floor(Math.random() * 315)
    document.querySelectorAll('.clear-text').forEach((e) => e.textContent = '')
    secretCode = generateSecretCode();
    attempts = 0;
    currentInputPosition = 0;
    document.getElementById('message').textContent = '';
    document.getElementById('restart-button').disabled = true;
    initializeBoard();
    focusNextInput();
}

// Block for generating a random guessed number
function generateSecretCode() {
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += Math.floor(Math.random() * 10);
    }
    console.log('Secret Code:', code); // For debugging purposes
    return code;
}

// Game board creation block
function initializeBoard() {
    const guessContainer = document.getElementById('guess-container');
    guessContainer.innerHTML = '';
    for (let i = 0; i < maxAttempts; i++) {
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.classList.add('guess-cell');

            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('maxlength', '1');
            input.setAttribute('id', `cell-${i}-${j}`);
            input.setAttribute('data-row', i);
            input.setAttribute('data-col', j);
            input.disabled = i !== 0;

            cell.appendChild(input);
            guessContainer.appendChild(cell);
        }
    }
}

// The keystroke handler block, to change the keys you need to make changes to the if-else structure
function handleKeyDown(event) {
    if (attempts >= maxAttempts) {
        return;
    }

    const activeRow = document.querySelectorAll(`[data-row="${attempts}"]`);
    const currentCell = activeRow[currentInputPosition];
    if (!currentCell) return;

    if (event.key >= '0' && event.key <= '9') {
        currentCell.value = event.key;
        if (currentInputPosition < 4) {
            currentInputPosition++;
        }
        focusNextInput();
    } else if (event.key === 'Backspace') {
        if (currentInputPosition > 0) {
            currentCell.value = '';
            currentInputPosition--;
            focusNextInput();
        } else {
            currentCell.value = '';
        }
    } else if (event.key === 'Enter') {
        if (isRowFilled(attempts)) {
            handleGuess();
        } else {
            alert('Please fill all cells in the row.'); //Outputting a message that not all numbers have been entered
        }
    }
}

//Block of moving focus to the next cell
function focusNextInput() {
    const activeRow = document.querySelectorAll(`[data-row="${attempts}"]`);
    if (currentInputPosition < 5) {
        const nextCell = activeRow[currentInputPosition];
        nextCell.value = '';
        setTimeout(() => {
            nextCell.focus();
        }, 10);
    }
}

//Block for checking the guessed number
function handleGuess() {
    const guess = getCurrentGuess();
    const result = checkGuess(guess);
    displayResult(result);

    if (result.correctCount === 5) {
        document.getElementById('message').classList.remove("lose");
        document.getElementById('message').classList.add("win")
        document.getElementById('message').textContent = 'You win!';
        displayQuote();
        disableInput();
        document.getElementById('restart-button').disabled = false;
    } else if (attempts >= maxAttempts - 1) {
        document.getElementById('message').classList.remove("win");
        document.getElementById('message').classList.add("lose");
        document.getElementById('message').textContent = `Game Over. The code was ${secretCode}`;
        document.getElementById('restart-button').disabled = false;
    } else {
        attempts++;
        currentInputPosition = 0;
        enableNextRow(attempts);
        focusNextInput();
    }
}

//Quote display block during "Win" state
//The Zen Quote API is not responsive, so a local quote database is created in the project folder
function displayQuote() {
    fetch('./db/quotes.json')
        .then(response => response.json())
        .then(data => {
            const quote = data[randomNum].quote;
            const author = data[randomNum].author;
            document.querySelector('.quote-content').textContent = quote;
            document.querySelector('.quote-author').textContent = author;
        })
        .catch(error => {
            console.error('Error fetching Quote:', error);
        });
}

//Getting a guessing option
function getCurrentGuess() {
    let guess = '';
    for (let i = 0; i < 5; i++) {
        const cellInput = document.getElementById(`cell-${attempts}-${i}`);
        guess += cellInput.value;
    }
    return guess;
}

//Checking the guessing option, with feedback displayed to the user
function checkGuess(guess) {
    const result = {
        correctCount: 0,
        presentCount: 0,
        status: []
    };

    const codeDigits = secretCode.split('');
    const guessDigits = guess.split('');

    guessDigits.forEach((digit, index) => {
        if (digit === codeDigits[index]) {
            result.status[index] = 'correct';
            result.correctCount++;
        } else if (codeDigits.includes(digit)) {
            result.status[index] = 'present';
            result.presentCount++;
        } else {
            result.status[index] = 'absent';
        }
    });

    return result;
}

function displayResult(result) {
    for (let i = 0; i < 5; i++) {
        const cellInput = document.getElementById(`cell-${attempts}-${i}`);
        cellInput.classList.add(result.status[i]);
        cellInput.disabled = true;
    }
}

//Checking the filling of cells
function isRowFilled(row) {
    for (let i = 0; i < 5; i++) {
        const cellInput = document.getElementById(`cell-${row}-${i}`);
        if (cellInput.value === '') {
            return false;
        }
    }
    return true;
}

//Activation of the next line, after checking the previous line
function enableNextRow(row) {
    for (let i = 0; i < 5; i++) {
        const cellInput = document.getElementById(`cell-${row}-${i}`);
        cellInput.disabled = false;
    }
    document.getElementById(`cell-${row}-0`).focus();
}

//Disabling input into cells of inactive rows
function disableInput() {
    document.getElementById('restart-button').disabled = false;
    for (let i = 0; i < maxAttempts; i++) {
        for (let j = 0; j < 5; j++) {
            const cellInput = document.getElementById(`cell-${i}-${j}`);
            cellInput.disabled = true;
        }
    }
}
