import { io } from "socket.io-client";
import { isSoundOn } from "./settings.js";
import {
  cardPressed,
  createCard,
  disableActions,
  finishGame,
  removeTopPileCards,
  restartGame,
  takeCardFromDeck,
  takeCardFromPile,
  yanivPressed,
} from "./yaniv.js";

const socket = io(window.location.host, {
  transports: ["websocket"],
  host: `${window.location.host}/.proxy/socket.io`,
  hostname: `${window.location.host}/.proxy/socket.io`,
  path: "/.proxy/socket.io",
  autoConnect: false,
});

window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);

  addPlayerImage(
    urlParams.get("name"),
    urlParams.get("avatar"),
    urlParams.get("playerId"),
    "my-name"
  );

  disableActions(document.getElementById("control-action"), true);
  disableActions(document.getElementById("my-table"), true);

  socket.connect();

  socket.emit("onJoinRoom", urlParams.get("code"));
  socket.emit(
    "onGetPlayerName",
    urlParams.get("name"),
    urlParams.get("avatar"),
    urlParams.get("playerId")
  );

  document
    .getElementById("deck")
    .addEventListener("click", takeCardFromDeck(socket));

  document
    .getElementById("yaniv")
    .addEventListener("click", yanivPressed(socket));

  document
    .getElementById("play-again")
    .addEventListener("click", restartGame(socket));

  socket.on("onClientDisconnect", () => {
    socket.disconnect();
    document.getElementById("game-disconnected").style.display = "block";
  });

  socket.on("onRoomFull", (roomName) => {
    socket.disconnect();
    document.getElementById("game-disconnected").style.display = "block";
  });

  socket.on("onGameStart", (cards) => {
    const myCards = document.getElementById("my-cards");

    // resetting board
    Array.from(myCards.children).forEach((card) => {
      card.remove();
    });

    document.getElementById("game-over").style.display = "none";

    const pile = document.getElementById("pile");
    Array.from(pile.children).forEach((card) => {
      card.remove();
    });

    cards.forEach((card) => {
      const myCard = createCard(card);
      myCard.classList.add("my-card");
      myCard.addEventListener("click", cardPressed);
      myCards.appendChild(myCard);
    });
  });

  socket.on("onPlayersStateChange", (playersState) => {
    const rivalCards = document.getElementById("rival-cards");

    playersState.forEach((player) => {
      if (player.id !== socket.id) {
        addPlayerImage(
          player.name,
          player.avatar,
          player.playerId,
          "rival-name"
        );

        document.getElementById("rival-total-score").textContent =
          player.totalScore;

        document.querySelectorAll(".rival-card").forEach((card) => {
          card.remove();
        });

        for (let card = 0; card < player.cardsAmount; card++) {
          const rivalCard = createCard("gray_back");
          rivalCard.classList.add("rival-card");
          rivalCards.appendChild(rivalCard);
        }
      } else {
        document.getElementById("my-total-score").textContent =
          player.totalScore;
      }
    });
  });

  socket.on("onCardTaken", (hand) => {
    const myOldCards = document.querySelectorAll(".my-card");
    myOldCards.forEach((card) => {
      card.remove();
    });

    const myCards = document.getElementById("my-cards");

    hand.forEach((card) => {
      const myCard = createCard(card);
      myCard.classList.add("my-card");
      myCard.addEventListener("click", cardPressed);
      myCards.appendChild(myCard);
    });
  });

  socket.on("onPileUpdate", ({ pile: updatedPile, topPile: cardsId }) => {
    const pile = document.getElementById("pile");
    const randomRotation = (Math.random() - 0.5) * 90;

    const cardToRemove = Array.from(
      document.querySelectorAll(".pile-card")
    ).filter((card) => !updatedPile.includes(card.id));

    if (cardToRemove.length > 0) {
      cardToRemove[0].remove();
    }

    removeTopPileCards(socket);

    cardsId.forEach((cardId, index) => {
      const newCard = createCard(cardId);

      if (index === 0 || index === cardsId.length - 1) {
        newCard.classList.add("top-pile");
        newCard.classList.add("pile-card");
        newCard.addEventListener("click", takeCardFromPile(socket));
      }

      newCard.style.transform = `rotate(${randomRotation}deg)`;
      newCard.style.position = "absolute";

      if (cardsId.length > 2) {
        newCard.style.left = `${80 * (index - 1)}px`;
        newCard.style.top = `${30 * (index - 1)}px`;
      } else {
        newCard.style.left = `${80 * index}px`;
        newCard.style.top = `${30 * index}px`;
      }

      const card = document.querySelector(`#my-cards [id='${cardId}']`);

      if (card) {
        card.remove();
      }

      pile.appendChild(newCard);
    });
  });

  socket.on("onTurnChanged", (currentPlayerTurn) => {
    if (socket.id !== currentPlayerTurn) {
      disableActions(document.getElementById("control-action"), true);
      disableActions(document.getElementById("my-table"), true);
      document
        .getElementById("rival-name")
        .getElementsByClassName("avatar")[0]
        .classList.add("active-avatar");

      document
        .getElementById("my-name")
        .getElementsByClassName("avatar")[0]
        .classList.remove("active-avatar");
    } else {
      disableActions(document.getElementById("control-action"), false);
      disableActions(document.getElementById("my-table"), false);
      document
        .getElementById("my-name")
        .getElementsByClassName("avatar")[0]
        .classList.add("active-avatar");

      document
        .getElementById("rival-name")
        .getElementsByClassName("avatar")[0]
        .classList.remove("active-avatar");
    }
  });

  socket.on("onPlayerWin", ({ winner, state }) => {
    finishGame(state, socket);
    document.getElementById("game-over").style.display = "block";
    const winnerBanner = document.getElementById("winner-banner");
    winnerBanner.innerText = `the winner is ${winner.name}`;
    winnerBanner.classList.remove("yaniv-win");
    winnerBanner.classList.add("yaniv-win");

    if (isSoundOn()) {
      const audio = new Audio("./assets/music/sounds/yaniv.mp3");
      audio.play();
    }
  });

  socket.on("onAssaf", ({ winner, state }) => {
    finishGame(state, socket);
    document.getElementById("game-over").style.display = "block";
    const winnerBanner = document.getElementById("winner-banner");
    winnerBanner.innerText = `assaf! the winner is ${winner.name}`;
    winnerBanner.classList.remove("yaniv-win");
    winnerBanner.classList.add("yaniv-win");

    if (isSoundOn()) {
      const audio = new Audio("./assets/music/sounds/assaf.mp3");
      audio.play();
    }
  });
};

export const addPlayerImage = (name, avatar, id, divId) => {
  document.getElementById(divId).innerText = name;
  const avatarTag = document.createElement("img");

  let avatarSrc = "";
  if (avatar !== "null" || avatar !== "undefined" || avatar == undefined) {
    avatarSrc = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=256`;
  } else {
    const defaultAvatarIndex = (BigInt(id) >> 22n) % 6n;
    avatarSrc = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
  }

  avatarTag.src = avatarSrc;
  avatarTag.alt = name;
  avatarTag.classList.add("avatar");

  document.getElementById(divId).prepend(avatarTag);
};
