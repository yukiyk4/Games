let pkDealHandler = null;
let pkFoldHandler = null;
let pkCheckHandler = null;
let pkRaiseHandler = null;
let pkNextHandler = null;

export function initPoker() {
    const comCardsContainer = document.getElementById("community-cards");
    const pCardsContainer = document.getElementById("player-poker-cards");
    const b1CardsContainer = document.getElementById("bot1-cards");
    const b2CardsContainer = document.getElementById("bot2-cards");

    const roundTitle = document.getElementById("poker-round-name");
    const potDisplay = document.getElementById("poker-pot");
    const walletDisplay = document.getElementById("poker-wallet");
    const b1ChipsDisplay = document.getElementById("bot1-chips");
    const b2ChipsDisplay = document.getElementById("bot2-chips");

    const b1Bubble = document.getElementById("bot1-bubble");
    const b2Bubble = document.getElementById("bot2-bubble");
    const pBubble = document.getElementById("player-bubble");
    const mainMsg = document.getElementById("poker-msg");

    const pregameCtrls = document.getElementById("poker-pregame-ctrls");
    const actionCtrls = document.getElementById("poker-action-ctrls");
    const nextBtn = document.getElementById("poker-next-btn");

    if (!comCardsContainer || !pCardsContainer || !mainMsg) return;

    let deck = [], playerHand = [], bot1Hand = [], bot2Hand = [], communityCards = [];
    let pot = 0, playerChips = 1000, bot1Chips = 1000, bot2Chips = 1000;
    let currentRound = 0;
    let activeBet = 0;
    let hasFolded = { player: false, bot1: false, bot2: false };

    const suits = ['♠', '♥', '♦', '♣'];
    const values = [
        { name: '2', rank: 2 }, { name: '3', rank: 3 }, { name: '4', rank: 4 },
        { name: '5', rank: 5 }, { name: '6', rank: 6 }, { name: '7', rank: 7 },
        { name: '8', rank: 8 }, { name: '9', rank: 9 }, { name: '10', rank: 10 },
        { name: 'J', rank: 11 }, { name: 'Q', rank: 12 }, { name: 'K', rank: 13 },
        { name: 'A', rank: 14 }
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

    function renderCard(card, container, isHidden = false) {
        const cardDiv = document.createElement("div");
        cardDiv.className = "pk-card";
        if (card.suit === '♥' || card.suit === '♦') cardDiv.classList.add("card-red");

        if (isHidden) {
            cardDiv.classList.add("card-back");
            cardDiv.textContent = "?";
        } else {
            cardDiv.innerHTML = `${card.name}<br>${card.suit}`;
        }
        container.appendChild(cardDiv);
    }

    function updateTableUI(revealAll = false) {
        pCardsContainer.innerHTML = "";
        b1CardsContainer.innerHTML = "";
        b2CardsContainer.innerHTML = "";
        comCardsContainer.innerHTML = "";

        if (playerHand.length) playerHand.forEach(c => renderCard(c, pCardsContainer, hasFolded.player));
        if (bot1Hand.length) bot1Hand.forEach(c => renderCard(c, b1CardsContainer, !revealAll || hasFolded.bot1));
        if (bot2Hand.length) bot2Hand.forEach(c => renderCard(c, b2CardsContainer, !revealAll || hasFolded.bot2));
        if (communityCards.length) communityCards.forEach(c => renderCard(c, comCardsContainer));

        potDisplay.textContent = pot;
        walletDisplay.textContent = playerChips;
        b1ChipsDisplay.textContent = bot1Chips;
        b2ChipsDisplay.textContent = bot2Chips;
    }

    function startHand() {
        const pokerPage = document.getElementById("poker-page");
        if (pokerPage && !pokerPage.classList.contains("active")) return;
        if (playerChips < 20 || bot1Chips < 20 || bot2Chips < 20) {
            mainMsg.textContent = "Insufficient chips to play table blinds!";
            return;
        }

        playerChips -= 20; bot1Chips -= 20; bot2Chips -= 20;
        pot = 60;
        activeBet = 20;
        currentRound = 0;
        hasFolded = { player: false, bot1: false, bot2: false };

        b1Bubble.textContent = ""; b2Bubble.textContent = ""; pBubble.textContent = "";
        roundTitle.textContent = "Pre-Flop";
        mainMsg.textContent = "Your turn! Call/Check or Raise?";

        createDeck();
        shuffleDeck();

        playerHand = [deck.pop(), deck.pop()];
        bot1Hand = [deck.pop(), deck.pop()];
        bot2Hand = [deck.pop(), deck.pop()];

        pregameCtrls.style.display = "none";
        actionCtrls.style.display = "flex";
        nextBtn.style.display = "none";

        updateTableUI(false);
    }

    function runBotAI() {
        if (!hasFolded.bot1) {
            if (Math.random() > 0.45) {
                b1Bubble.textContent = "Checks/Calls";
            } else {
                b1Bubble.textContent = "Folds";
                hasFolded.bot1 = true;
            }
        }
        if (!hasFolded.bot2) {
            if (Math.random() > 0.35) {
                b2Bubble.textContent = "Checks/Calls";
            } else {
                b2Bubble.textContent = "Folds";
                hasFolded.bot2 = true;
            }
        }
    }

    function playerAction(type) {
        pBubble.textContent = type.toUpperCase() + "!";

        if (type === 'fold') {
            hasFolded.player = true;
            mainMsg.textContent = "You Folded. Dealer wins hand!";
            endHand();
            return;
        }
        if (type === 'raise') {
            playerChips -= 40;
            pot += 40;
            mainMsg.textContent = "You raised by 40!";
        } else {
            mainMsg.textContent = "You checked/called.";
        }

        runBotAI();
        setTimeout(advanceRound, 1000);
    }

    function advanceRound() {
        currentRound++;
        b1Bubble.textContent = ""; b2Bubble.textContent = ""; pBubble.textContent = "";

        const variants = { player: hasFolded.player, b1: hasFolded.bot1, b2: hasFolded.bot2 };
        const activeCount = Object.values(variants).filter(f => !f).length;

        if (activeCount <= 1) {
            evaluateWinners();
            return;
        }

        if (currentRound === 1) {
            roundTitle.textContent = "The Flop";
            communityCards.push(deck.pop(), deck.pop(), deck.pop());
            mainMsg.textContent = "Flop dealt. Decide your move!";
        } else if (currentRound === 2) {
            roundTitle.textContent = "The Turn";
            communityCards.push(deck.pop());
            mainMsg.textContent = "The Turn card is placed.";
        } else if (currentRound === 3) {
            roundTitle.textContent = "The River";
            communityCards.push(deck.pop());
            mainMsg.textContent = "Final River betting round!";
        } else {
            evaluateWinners();
            return;
        }
        updateTableUI(false);
    }

    function evaluateWinners() {
        roundTitle.textContent = "Showdown";
        updateTableUI(true);

        if (hasFolded.player) {
            mainMsg.textContent = "You folded! Table collected the pot.";
        } else if (!hasFolded.bot1 && Math.random() > 0.5) {
            mainMsg.textContent = "Bot 1 wins the Showdown with a High Pair!";
            bot1Chips += pot;
        } else if (!hasFolded.bot2 && Math.random() > 0.4) {
            mainMsg.textContent = "Bot 2 wins the Showdown with Two Pair!";
            bot2Chips += pot;
        } else {
            mainMsg.textContent = "🎉 You win the Showdown Hand! Pot collected!";
            playerChips += pot;
        }
        endHand();
    }

    function endHand() {
        pot = 0;
        updateTableUI(true);
        actionCtrls.style.display = "none";
        nextBtn.style.display = "inline-block";
    }

    function resetTableState() {
        pregameCtrls.style.display = "flex";
        actionCtrls.style.display = "none";
        nextBtn.style.display = "none";
        roundTitle.textContent = "Pre-Flop";
        mainMsg.textContent = "Place ante to deal next hand!";

        playerHand = []; bot1Hand = []; bot2Hand = []; communityCards = [];
        updateTableUI(false);
    }

    // SPEED TOUCH ROUTER (Zero latency, instantly stops mobile tap drop-outs)
    function wirePokerButton(btnId, targetCallback) {
        const targetBtn = document.getElementById(btnId);
        if (!targetBtn) return null;

        const clonedBtn = targetBtn.cloneNode(true);
        targetBtn.replaceWith(clonedBtn);

        clonedBtn.addEventListener("touchstart", (e) => {
            e.preventDefault();
            targetCallback();
        }, { passive: false });

        clonedBtn.addEventListener("click", () => {
            targetCallback();
        });

        return targetCallback;
    }

    pkDealHandler = wirePokerButton("poker-deal-btn", startHand);
    pkFoldHandler = wirePokerButton("poker-fold-btn", () => playerAction('fold'));
    pkCheckHandler = wirePokerButton("poker-check-btn", () => playerAction('check'));
    pkRaiseHandler = wirePokerButton("poker-raise-btn", () => playerAction('raise'));
    pkNextHandler = wirePokerButton("poker-next-btn", resetTableState);

    resetTableState();
}
