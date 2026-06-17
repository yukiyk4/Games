/* ==========================================
   PERFECTLY MATCHED ARCADE ENGINE INITIALIZER
   ========================================== */
import { initNavigation } from "./design.js";
import { initGame } from "./TicTacToe.js";
import { initSnakeGame } from "./Snake.js";
import { initTetrisGame } from "./Tetris.js";
import { initMinesweeperGame } from "./Minesweeper.js";
import { init2048 } from "./2048.js";
import { initBlackjack } from "./Blackjack.js";
import { initPoker } from "./Poker.js";
import { initWordle } from "./Wordle.js"; // Ensure your Wordle.js file matches this exact export name
import { initChatbot } from "./Chatbot.js";

// Initialize all arcade features safely when the DOM is fully structured
document.addEventListener("DOMContentLoaded", () => {
    console.log("Arcade Hub Core Engine: Loading components...");

    try {
        initNavigation();
        console.log("✔ Navigation and Dark Mode system ready.");
    } catch (e) {
        console.error("Failed to load navigation:", e);
    }

    try {
        initGame();
        console.log("✔ Tic-Tac-Toe engine loaded.");
    } catch (e) {
        console.error("Failed to load Tic-Tac-Toe:", e);
    }

    try {
        initSnakeGame();
        console.log("✔ Snake engine loaded.");
    } catch (e) {
        console.error("Failed to load Snake:", e);
    }

    try {
        initTetrisGame();
        console.log("✔ Tetris engine loaded.");
    } catch (e) {
        console.error("Failed to load Tetris:", e);
    }

    try {
        initMinesweeperGame();
        console.log("✔ Minesweeper engine loaded.");
    } catch (e) {
        console.error("Failed to load Minesweeper:", e);
    }

    try {
        init2048();
        console.log("✔ 2048 engine loaded.");
    } catch (e) {
        console.error("Failed to load 2048:", e);
    }

    try {
        initBlackjack();
        console.log("✔ Blackjack table engine loaded.");
    } catch (e) {
        console.error("Failed to load Blackjack:", e);
    }

    try {
        initPoker();
        console.log("✔ Poker table engine loaded.");
    } catch (e) {
        console.error("Failed to load Poker:", e);
    }

    try {
        initWordle();
        console.log("✔ Wordle matrix engine loaded.");
    } catch (e) {
        console.error("Failed to load Wordle:", e);
    }

    try {
        initChatbot();
        console.log("✔ Arcade AI Companion engine loaded.");
    } catch (e) {
        console.error("Failed to load Chatbot:", e);
    }

    console.log("Arcade Hub Core Engine: Boot setup complete.");
});
