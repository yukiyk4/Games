// Keep track of the active handles globally so we can clean up routing pipelines safely
let currentBJBetHandlers = [];
let currentBJHitHandler = null;
let currentBJStandHandler = null;
let currentBJNextHandler = null;

export function initBlackjack() {
    const dealerCardsContainer = document.getElementById("dealer-cards");
    const playerCardsContainer = document.getElementById("player-cards");
    const dealerScoreInfo = document.getElementById("dealer-score-info");
    const playerScoreInfo = document.getElementById("player-score-info");
    const blackjackMsg = document.getElementById("blackjack-msg");

    const walletDisplay = document.getElementById("bj-wallet");
    const betDisplay = document.getElementById("bj-current-bet");

    const bettingControls = document.getElementById("betting-controls");
    const actionControls = document.getElementById("action-controls");
    const nextBtn = document.getElementById("bj-next-btn");

    if (!dealerCardsContainer || !playerCardsContainer || !blackjackMsg) return;

    let deck = [];
    let playerHand = [];
    let dealerHand = [];
    let wallet = parseInt(walletDisplay.textContent) || 1000;
    let currentBet = 0;
    let isRoundActive = false;

    const suits = ['♠', '♥', '♦', '♣'];
    const values = [
        { name: 'A', value: 11 }, { name: '2', value: 2 }, { name: '3', value: 3 },
        { name: '4', value: 4 }, { name: '5', value: 5 }, { name: '6', value: 6 },
        { name: '7', value: 7 }, { name: '8', value: 8 }, { name: '9', value: 9 },
        { name: '10', value: 10 }, { name: 'J', value: 10 }, { name: 'Q', value: 10 },
        { name: 'K', value: 10 }
    ];

    function createDeck() {
        deck = [];
        for (let suit of suits) {
            for (let val of values) {
                deck.push({ ...val, suit: suit });
            }
        }
    }

    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function getHandScore(hand) {
        let score = 0;
        let aces = 0;
        for (let card of hand) {
            score += card.value;
            if (card.name === 'A') aces++;
        }
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    }

    function renderCard(card, container, isHidden = false) {
        const cardDiv = document.createElement("div");
        cardDiv.className = "bj-card";
        if (card.suit === '♥' || card.suit === '♦') {
            cardDiv.classList.add("card-red");
        }
        if (isHidden) {
            cardDiv.classList.add("card-hidden");
            cardDiv.textContent = "?";
        } else {
            cardDiv.innerHTML = `${card.name}<br>${card.suit}`;
        }
        container.appendChild(cardDiv);
    }

    function updateUI(hideDealerHoleCard = true) {
        playerCardsContainer.innerHTML = "";
        dealerCardsContainer.innerHTML = "";

        playerHand.forEach(card => renderCard(card, playerCardsContainer));
        dealerHand.forEach((card, index) => {
            renderCard(card, dealerCardsContainer, hideDealerHoleCard && index === 1);
        });

        playerScoreInfo.textContent = getHandScore(playerHand);
        if (hideDealerHoleCard && dealerHand.length > 0) {
            dealerScoreInfo.textContent = dealerHand[0].value;
        } else {
            dealerScoreInfo.textContent = getHandScore(dealerHand);
        }

        walletDisplay.textContent = wallet;
        betDisplay.textContent = currentBet;
    }

    function startRound(amount) {
        const blackjackPage = document.getElementById("blackjack-page");
        if (blackjackPage && !blackjackPage.classList.contains("active")) return;
        if (isRoundActive || wallet < amount) return;

        currentBet = amount;
        wallet -= amount;
        isRoundActive = true;

        createDeck();
        shuffleDeck();

        playerHand = [deck.pop(), deck.pop()];
        dealerHand = [deck.pop(), deck.pop()];

        blackjackMsg.textContent = "Hit or Stand?";
        bettingControls.style.display = "none";
        actionControls.style.display = "flex";
        nextBtn.style.display = "none";

        updateUI(true);

        if (getHandScore(playerHand) === 21) {
            stand();
        }
    }

    function hit() {
        if (!isRoundActive) return;
        playerHand.push(deck.pop());
        updateUI(true);

        if (getHandScore(playerHand) > 21) {
            blackjackMsg.textContent = "Bust! Dealer wins! 💥";
            endRound(false);
        }
    }

    function stand() {
        if (!isRoundActive) return;

        while (getHandScore(dealerHand) < 17) {
            dealerHand.push(deck.pop());
        }

        updateUI(false);

        const pScore = getHandScore(playerHand);
        const dScore = getHandScore(dealerHand);

        if (dScore > 21) {
            blackjackMsg.textContent = "Dealer busts! You win! 🎉";
            wallet += currentBet * 2;
        } else if (pScore > dScore) {
            blackjackMsg.textContent = "You win! 🏆";
            wallet += currentBet * 2;
        } else if (pScore < dScore) {
            blackjackMsg.textContent = "Dealer wins. 💸";
        } else {
            blackjackMsg.textContent = "It's a Push! 🤝";
            wallet += currentBet;
        }

        endRound(true);
    }

    function endRound(showAllDealerCards) {
        isRoundActive = false;
        currentBet = 0;
        updateUI(!showAllDealerCards);
        actionControls.style.display = "none";
        nextBtn.style.display = "inline-block";
    }

    function prepareNextRound() {
        bettingControls.style.display = "flex";
        actionControls.style.display = "none";
        nextBtn.style.display = "none";
        blackjackMsg.textContent = "Place your bet to deal!";
        playerHand = [];
        dealerHand = [];
        updateUI(true);
    }

    // UNIFIED RESPONSIVE TOUCH ENGINE (Wipes layout click delays)
    function attachMobileControl(btnId, actionCallback) {
        const el = document.getElementById(btnId);
        if (!el) return null;

        // Clone node to drop stacked baseline listeners cleanly
        const freshEl = el.cloneNode(true);
        el.replaceWith(freshEl);

        freshEl.addEventListener("touchstart", (e) => {
            e.preventDefault();
            actionCallback();
        }, { passive: false });

        freshEl.addEventListener("click", () => {
            actionCallback();
        });

        return actionCallback;
    }

    // Rebind Action Keys
    currentBJHitHandler = attachMobileControl("bj-hit-btn", hit);
    currentBJStandHandler = attachMobileControl("bj-stand-btn", stand);
    currentBJNextHandler = attachMobileControl("bj-next-btn", prepareNextRound);

    // Rebind Casino Bets chips
    const betBtns = document.querySelectorAll(".bet-btn");
    betBtns.forEach((btn, index) => {
        const freshBtn = btn.cloneNode(true);
        btn.replaceWith(freshBtn);

        const betAction = () => {
            const amount = parseInt(freshBtn.getAttribute("data-amount"));
            startRound(amount);
        };

        freshBtn.addEventListener("touchstart", (e) => {
            e.preventDefault();
            betAction();
        }, { passive: false });

        freshBtn.addEventListener("click", () => {
            betAction();
        });
    });

    prepareNextRound();
}
