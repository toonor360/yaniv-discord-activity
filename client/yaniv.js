import { addPlayerImage } from "./io.js";
import { isSoundOn } from "./settings.js";
import { cardsToNumber } from "./utils.js";

const badMoveSound = new Audio("./assets/music/sounds/bad-move.wav");
badMoveSound.volume = 0.5;
const throwCardSound = new Audio("./assets/music/sounds/throw-card.mp3");
throwCardSound.volume = 0.5;
const tapSound = new Audio("./assets/music/sounds/tap.mp3");
tapSound.volume = 0.5;
const winSound = new Audio("./assets/music/sounds/win.wav");
winSound.volume = 0.4;
const yanivErrorSound = new Audio("./assets/music/sounds/yaniv-error.wav");
yanivErrorSound.volume = 0.5;
const readySound = new Audio("./assets/music/sounds/im-ready.wav");
readySound.volume = 0.1;

export const takeCardFromPile = (socket) => (event) => {
  if (document.querySelector(".selected-card")) {
    const thrownCards = Array.from(
      document.querySelectorAll(".selected-card")
    ).map((card) => card.id);

    if (isStepValid(thrownCards)) {
      if (isSoundOn()) {
        throwCardSound.play();
      }

      socket.emit("onCardTakenFromPile", {
        thrownCards,
        cardFromPile: event.target.id,
      });
    } else {
      document.querySelectorAll(".selected-card").forEach((card) => {
        card.classList.add("selected-cards-error");

        if (isSoundOn()) {
          badMoveSound.play();
        }

        setTimeout(() => {
          card.classList.remove("selected-cards-error");
        }, 500);
      });
    }
  }
};

export const takeCardFromDeck = (socket) => () => {
  if (document.querySelector(".selected-card")) {
    const thrownCards = Array.from(
      document.querySelectorAll(".selected-card")
    ).map((card) => card.id);

    if (isStepValid(thrownCards)) {
      if (isSoundOn()) {
        throwCardSound.play();
      }

      socket.emit("onCardTakeFromDeck", thrownCards);
    } else {
      document.querySelectorAll(".selected-card").forEach((card) => {
        card.classList.add("selected-cards-error");

        if (isSoundOn()) {
          badMoveSound.play();
        }

        setTimeout(() => {
          card.classList.remove("selected-cards-error");
        }, 500);
      });
    }
  }
};

export const createCard = (name) => {
  const card = document.createElement("img");

  card.src = `./assets/cards/${name}.png`;
  card.classList.add("game-card");
  card.setAttribute("id", name);

  return card;
};

export const cardPressed = (event) => {
  event.target.classList.toggle("my-card");
  event.target.classList.toggle("selected-card");
  if (isSoundOn()) {
    tapSound.play();
  }
};

export const removeTopPileCards = (socket) => {
  document.querySelectorAll(".top-pile").forEach((card) => {
    card.classList.remove("top-pile");
    card.classList.remove("top-pile-active");

    card.removeEventListener("click", takeCardFromPile(socket));
  });
};

const calcHandSum = () => {
  const myHand = Array.from(document.getElementsByClassName("my-card"));
  return myHand.reduce((total, { id }) => total + cardsToNumber.get(id), 0);
};

export const yanivPressed = (socket) => () => {
  const yaniv = document.getElementById("yaniv");

  if (calcHandSum() <= 7) {
    if (isSoundOn()) {
      winSound.play();
    }

    socket.emit("onYaniv", socket.id);
  } else {
    if (isSoundOn()) {
      yanivErrorSound.play();
    }

    yaniv.classList.add("yaniv-error");

    setTimeout(() => {
      yaniv.classList.remove("yaniv-error");
    }, 3000);
  }
};

const isStepValid = (cards) => {
  if (cards.length === 1) {
    return true;
  }

  cards = cards.sort(
    (currentCard, nextCard) =>
      cardsToNumber.get(currentCard) - cardsToNumber.get(nextCard)
  );

  let isNumbersFollowing = true;

  for (let index = 0; index < cards.length - 1; index++) {
    if (
      cardsToNumber.get(cards[index]) ===
      cardsToNumber.get(cards[index + 1]) - 1
    ) {
      isNumbersFollowing = isNumbersFollowing && true;
    } else {
      isNumbersFollowing = isNumbersFollowing && false;
    }
  }

  if (
    cards.length > 1 &&
    cards.every(
      (card) => cardsToNumber.get(card) === cardsToNumber.get(cards[0])
    )
  ) {
    return true;
  } else if (
    cards.length > 2 &&
    isNumbersFollowing &&
    cards.every((card) => card.slice(-1) === cards[0].slice(-1))
  ) {
    return true;
  }

  return false;
};

export const finishGame = (playersState, socket) => {
  const rivalCards = document.getElementById("rival-cards");

  playersState.forEach((player) => {
    if (player.id !== socket.id) {
      addPlayerImage(player.name, player.avatar, player.playerId, "rival-name");

      document.querySelectorAll(".rival-card").forEach((card) => {
        card.remove();
      });

      player.hand.forEach((card) => {
        const rivalCard = createCard(card);
        rivalCard.classList.add("rival-card");
        rivalCards.appendChild(rivalCard);
      });
    }
  });

  disableActions(document.getElementById("control-action"), true);
  disableActions(document.getElementById("my-table"), true);
};

export const restartGame = (socket) => () => {
  if (isSoundOn()) {
    readySound.play();
  }

  socket.emit("onRestartGame");
};

export const disableActions = (element, isAble) => {
  if (isAble) {
    element.classList.add("disable");
  } else {
    element.classList.remove("disable");
  }
};
