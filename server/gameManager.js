import { cardsToNumber, xor } from "./utils.js";

export class GameManager {
  constructor(maxPlayers, roomName) {
    this.deck = new Map(cardsToNumber);
    this.maxPlayers = maxPlayers;
    this.playersAmount = 0;
    this.pile = [];
    this.topPile = [];
    this.players = [];
    this.currentPlayerTurn = "";
    this.roomName = roomName;
    this.lastWinner = "";
  }

  addPlayer(socket) {
    this.playersAmount += 1;
    this.players.push({ id: socket.id, hand: [], totalScore: 0 });
  }

  initGame() {
    const firstCard = this.getRandomCard();
    this.pile.push(firstCard);
    this.topPile.push(firstCard);

    this.players.forEach((player) => {
      for (let index = 0; index < 5; index++) {
        player.hand.push(this.getRandomCard());
      }
    });
  }

  isPlayerTurn(id) {
    return id === this.currentPlayerTurn;
  }

  getPlayer(id) {
    return this.players.find((player) => player.id === id);
  }

  takeCardFromPile(id, thrownCards, cardFromPile) {
    this.pile.push(thrownCards);
    this.pile = this.pile.filter((card) => card !== cardFromPile);
    this.topPile = thrownCards;

    const player = this.getPlayer(id);

    player.hand = xor(player.hand, thrownCards);
    player.hand.push(cardFromPile);
  }

  takeCardFromDeck(id, thrownCards) {
    this.pile.push(thrownCards);
    this.topPile = thrownCards;

    const player = this.getPlayer(id);

    player.hand = xor(player.hand, thrownCards);
    player.hand.push(this.getRandomCard());
  }

  changePlayerTurn() {
    let nextPlayerIndex =
      (this.players.findIndex(
        (player) => player.id === this.currentPlayerTurn
      ) +
        1) %
      this.playersAmount;

    this.currentPlayerTurn = this.currentPlayerTurn
      ? this.players[nextPlayerIndex].id
      : this.players[0].id;
  }

  getPlayersState() {
    return this.players.map((player) => ({
      id: player.id,
      name: player.name,
      playerId: player.playerId,
      avatar: player.avatar,
      cardsAmount: player.hand.length,
      totalScore: player.totalScore,
    }));
  }

  closeRoom() {
    this.deck = new Map(cardsToNumber);
    this.playersAmount = 0;
    this.pile = [];
    this.topPile = [];
    this.players = [];
    this.currentPlayerTurn = "";
  }

  restartGame() {
    this.deck = new Map(cardsToNumber);
    this.pile = [];
    this.topPile = [];
    this.currentPlayerTurn = this.lastWinner;
    this.players.forEach((player) => {
      player.hand = [];
    });
  }

  yanivAddScore(winnerId) {
    this.lastWinner = winnerId;
    this.players.forEach((player) => {
      if (player.id !== winnerId) {
        const totalScore = this.calcHandSum(player.id) + player.totalScore;
        player.totalScore = totalScore;
      }
    });
  }

  assafAddScore(assafFineId) {
    this.players.forEach((player) => {
      let totalScore = this.calcHandSum(player.id) + player.totalScore;
      if (player.id === assafFineId) {
        totalScore += 30;
      }

      player.totalScore = totalScore;
    });
  }

  getRandomCard() {
    let keys = Array.from(this.deck.keys());
    const key = Math.floor(Math.random() * keys.length);
    this.deck.delete(keys[key]);

    return keys[key];
  }

  calcHandSum(playerId) {
    return this.getPlayer(playerId).hand.reduce(
      (total, id) => total + cardsToNumber.get(id),
      0
    );
  }

  getMinHandScorePlayer() {
    return this.players.reduce((prevPlayer, currPlayer) => {
      return this.calcHandSum(prevPlayer.id) < this.calcHandSum(currPlayer.id)
        ? prevPlayer
        : currPlayer;
    });
  }
}
