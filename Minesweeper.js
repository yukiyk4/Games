export function initMinesweeperGame() {
    const boardElement = document.getElementById("minesweeper-board");
    const statusElement = document.getElementById("minesweeper-status");
    const resetBtn = document.getElementById("minesweeper-reset-btn");

    if (!boardElement) return;

    const ROWS = 9;
    const COLS = 9;
    const MINE_COUNT = 10;

    let board = [];
    let isGameOver = false;
    let minesLeft = MINE_COUNT;
    let tilesRevealedCount = 0;

    function revealAllMines() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let tile = board[r][c];
                if (tile.isMine) {
                    tile.element.classList.add("revealed", "mine");
                    tile.element.textContent = "💣";
                }
            }
        }
    }

    function endGame(won) {
        isGameOver = true;
        if (won) {
            statusElement.textContent = "Victory! Safe Zone Cleared! 🏆";
        } else {
            statusElement.textContent = "Boom! Game Over 💥";
            revealAllMines();
        }
    }

    function countNeighbors(row, col) {
        let count = 0;
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                    if (board[r][c].isMine) count++;
                }
            }
        }
        return count;
    }

    function revealEmptyNeighbors(row, col) {
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                    let neighbor = board[r][c];
                    if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                        neighbor.isRevealed = true;
                        neighbor.element.classList.add("revealed");
                        tilesRevealedCount++;

                        if (neighbor.neighborMines > 0) {
                            neighbor.element.textContent = neighbor.neighborMines;
                            neighbor.element.classList.add(`count-${neighbor.neighborMines}`);
                        } else {
                            revealEmptyNeighbors(r, c);
                        }
                    }
                }
            }
        }
    }

    function revealTile(tile) {
        if (isGameOver || tile.isRevealed || tile.isFlagged) return;

        tile.isRevealed = true;
        tile.element.classList.add("revealed");
        tilesRevealedCount++;

        if (tile.isMine) {
            endGame(false);
            return;
        }

        if (tile.neighborMines > 0) {
            tile.element.textContent = tile.neighborMines;
            tile.element.classList.add(`count-${tile.neighborMines}`);
        } else {
            let foundRow = -1,
                foundCol = -1;
            for (let r = 0; r < ROWS; r++) {
                const cIndex = board[r].indexOf(tile);
                if (cIndex !== -1) {
                    foundRow = r;
                    foundCol = cIndex;
                    break;
                }
            }
            revealEmptyNeighbors(foundRow, foundCol);
        }

        if (tilesRevealedCount === ROWS * COLS - MINE_COUNT) {
            endGame(true);
        }
    }

    function toggleFlag(tile) {
        if (isGameOver || tile.isRevealed) return;

        if (!tile.isFlagged) {
            tile.isFlagged = true;
            tile.element.classList.add("flagged");
            tile.element.textContent = "🚩";
            minesLeft--;
        } else {
            tile.isFlagged = false;
            tile.element.classList.remove("flagged");
            tile.element.textContent = "";
            minesLeft++;
        }
        statusElement.textContent = `Mines Remaining: ${minesLeft}`;
    }

    function createBoard() {
        boardElement.innerHTML = "";
        board = [];
        isGameOver = false;
        minesLeft = MINE_COUNT;
        tilesRevealedCount = 0;
        statusElement.textContent = `Mines Remaining: ${minesLeft}`;

        for (let r = 0; r < ROWS; r++) {
            let row = [];
            for (let c = 0; c < COLS; c++) {
                let tile = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0,
                    element: document.createElement("div")
                };

                tile.element.classList.add("mine-tile");

                // ADVANCED MOBILE LONG-PRESS LOGIC (Flags on hold, Reveals on tap)
                let touchTimer = null;
                let isLongPress = false;

                tile.element.addEventListener(
                    "touchstart",
                    (e) => {
                        isLongPress = false;
                        touchTimer = setTimeout(() => {
                            isLongPress = true;
                            toggleFlag(tile);
                        }, 500); // 500 milliseconds hold triggers flag toggle
                    },
                    { passive: true }
                );

                tile.element.addEventListener("touchend", (e) => {
                    if (touchTimer) clearTimeout(touchTimer);

                    if (!isLongPress) {
                        revealTile(tile);
                    }

                    // ✨ FIXED LINE: Safely prevent duplicate ghost-clicks without breaking modern browser rules
                    if (e.cancelable) {
                        e.preventDefault();
                    }
                });

                // Desktop mouse fallbacks
                tile.element.addEventListener("click", () => revealTile(tile));
                tile.element.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    toggleFlag(tile);
                });

                boardElement.appendChild(tile.element);
                row.push(tile);
            }
            board.push(row);
        }

        let minesPlanted = 0;
        while (minesPlanted < MINE_COUNT) {
            let r = Math.floor(Math.random() * ROWS);
            let c = Math.floor(Math.random() * COLS);

            if (!board[r][c].isMine) {
                board[r][c].isMine = true;
                minesPlanted++;
            }
        }

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!board[r][c].isMine) {
                    board[r][c].neighborMines = countNeighbors(r, c);
                }
            }
        }
    }

    resetBtn.replaceWith(resetBtn.cloneNode(true));
    document.getElementById("minesweeper-reset-btn").addEventListener("click", createBoard);

    createBoard();
}
