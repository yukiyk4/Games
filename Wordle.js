let globalWordleKeyHandler = null;
let globalWordleResetHandler = null;

export function initWordle() {
    const gridContainer = document.getElementById("wordle-grid");
    const msgDisplay = document.getElementById("wordle-msg");
    const resetBtn = document.getElementById("wordle-reset-btn");

    if (!gridContainer || !msgDisplay || !resetBtn) return;

    const rowIds = ["kb-row-1", "kb-row-2", "kb-row-3"];
    const kbRows = rowIds.map((id) => document.getElementById(id));

    const dictionary = [
        "APPLE", "BEACH", "CHIPS", "DRIVE", "EARTH",
        "FLAME", "GUIDE", "HOUSE", "INDEX", "JUICE",
        "KNIFE", "LIGHT", "MOUNT", "NIGHT", "PLANT",
        "QUEEN", "ROUND", "SNAKE", "TRAIN", "UNDER",
        "WATER", "YOUTH", "SMART", "PIXEL", "WORDS",
        "BRICK", "BOARD", "MATCH", "STAGE", "CHESS"
    ];

    let secretWord = "";
    let currentRow = 0;
    let currentCol = 0;
    let guessBuffer = ["", "", "", "", ""];
    let isGameOver = false;

    const keyboardLayout = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"]
    ];

    function setupGame() {
        gridContainer.innerHTML = "";
        isGameOver = false;
        currentRow = 0;
        currentCol = 0;
        guessBuffer = ["", "", "", "", ""];

        secretWord = dictionary[Math.floor(Math.random() * dictionary.length)];

        // ✨ FIXED: Generate 30 flat loose tiles.
        // Your CSS (#wordle-grid grid-template-columns: repeat(5, 1fr)) handles the wrapping!
        for (let i = 0; i < 30; i++) {
            const tile = document.createElement("div");
            tile.className = "wordle-tile";
            gridContainer.appendChild(tile);
        }

        msgDisplay.textContent = "Guess the 5-letter word!";

        // Clean virtual keyboard buttons state reset
        const keys = document.querySelectorAll(".key-btn");
        keys.forEach(k => k.className = "key-btn" + (k.classList.contains("wide-key") ? " wide-key" : ""));
    }

    function handleInput(key) {
        if (isGameOver) return;
        const upperKey = key.toUpperCase();

        if (upperKey === "BACK" || upperKey === "BACKSPACE") {
            if (currentCol > 0) {
                currentCol--;
                guessBuffer[currentCol] = "";
                updateGridDisplay();
            }
        } else if (upperKey === "ENTER") {
            if (currentCol === 5) {
                checkRowGuess();
            } else {
                msgDisplay.textContent = "Not enough letters!";
            }
        } else if (/^[A-Z]$/.test(upperKey)) {
            if (currentCol < 5) {
                guessBuffer[currentCol] = upperKey;
                currentCol++;
                updateGridDisplay();
            }
        }
    }

    function updateGridDisplay() {
        const tiles = gridContainer.children;
        const baseIndex = currentRow * 5;
        for (let i = 0; i < 5; i++) {
            if (tiles[baseIndex + i]) {
                tiles[baseIndex + i].textContent = guessBuffer[i];
            }
        }
    }

    function checkRowGuess() {
        const guess = guessBuffer.join("");
        const tiles = gridContainer.children;
        const baseIndex = currentRow * 5;

        let secretCheck = secretWord;
        let rowStatuses = Array(5).fill("absent");

        for (let i = 0; i < 5; i++) {
            if (guess[i] === secretWord[i]) {
                rowStatuses[i] = "correct";
                secretCheck = secretCheck.replace(guess[i], "_");
            }
        }

        for (let i = 0; i < 5; i++) {
            if (rowStatuses[i] !== "correct" && secretCheck.includes(guess[i])) {
                rowStatuses[i] = "present";
                secretCheck = secretCheck.replace(guess[i], "_");
            }
        }

        for (let i = 0; i < 5; i++) {
            const tile = tiles[baseIndex + i];
            if (tile) {
                tile.classList.add(rowStatuses[i]);
                colorKey(guess[i], rowStatuses[i]);
            }
        }

        if (guess === secretWord) {
            msgDisplay.textContent = "🎉 Brilliant! You Won!";
            isGameOver = true;
            return;
        }

        currentRow++;
        currentCol = 0;
        guessBuffer = ["", "", "", "", ""];

        if (currentRow === 6) {
            msgDisplay.textContent = `💥 Game Over! Word was: ${secretWord}`;
            isGameOver = true;
        } else {
            msgDisplay.textContent = "Keep guessing!";
        }
    }

    function colorKey(letter, statusClass) {
        const btn = document.querySelector(`.key-btn[data-key="${letter}"]`);
        if (!btn) return;

        if (btn.classList.contains("correct")) return;
        if (btn.classList.contains("present") && statusClass === "absent") return;

        btn.classList.remove("present", "absent");
        btn.classList.add(statusClass);
    }

    // Build Virtual Touch Keyboard Layout cleanly
    kbRows.forEach((row, rowIndex) => {
        if (!row) return;
        row.innerHTML = "";
        keyboardLayout[rowIndex].forEach((key) => {
            const btn = document.createElement("button");
            btn.className = "key-btn";
            btn.textContent = key;
            btn.setAttribute("data-key", key);

            if (key === "ENTER" || key === "BACK") {
                btn.classList.add("wide-key");
            }

            btn.addEventListener("touchstart", (e) => {
                e.preventDefault();
                handleInput(key);
            }, { passive: false });

            btn.addEventListener("click", () => {
                handleInput(key);
            });

            row.appendChild(btn);
        });
    });

    if (globalWordleKeyHandler) window.removeEventListener("keydown", globalWordleKeyHandler);
    globalWordleKeyHandler = (e) => {
        const wordlePage = document.getElementById("wordle-page");
        if (wordlePage && !wordlePage.classList.contains("active")) return;

        if (e.key === "Backspace") handleInput("BACK");
        else handleInput(e.key);
    };
    window.addEventListener("keydown", globalWordleKeyHandler);

    resetBtn.replaceWith(resetBtn.cloneNode(true));
    const newResetBtn = document.getElementById("wordle-reset-btn");
    globalWordleResetHandler = setupGame;
    newResetBtn.addEventListener("click", globalWordleResetHandler);

    setupGame();
}
