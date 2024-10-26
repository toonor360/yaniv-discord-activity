import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import fetch from "node-fetch";
import { Server } from "socket.io";
import { GameManager } from "./gameManager.js";

dotenv.config({ path: "../.env" });

const app = express();
const port = 3001;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Allow express to parse JSON bodies
app.use(express.json());

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.post("/api/token", async (req, res) => {
  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  // Retrieve the access_token from the response
  const { access_token } = await response.json();

  // Return the access_token to our client as { access_token: "..."}
  res.send({ access_token });
});

const roomNameToGameManager = new Map();
const maxPlayers = 2;

app.post("/api/players/room/:id", (req, res) => {
  const gameManager = roomNameToGameManager.get(req.params.id);
  res.send(gameManager.getPlayersState());
});

io.on("connection", (socket) => {
  console.log("a user connected");
  onJoinRoom(socket);
});

const onDisconnect = (socket, roomName) => {
  socket.on("disconnect", (reason) => {
    console.log("Client disconnected - ", socket.id);
    const gameManager = roomNameToGameManager.get(roomName);
    socket.broadcast.emit("onClientDisconnect", socket.id);
    io.disconnectSockets();
    gameManager.closeRoom();
  });
};

const onJoinRoom = (socket) => {
  socket.on("onJoinRoom", (roomName) => {
    console.log("Joining room - ", roomName);
    let gameManager = roomNameToGameManager.get(roomName);

    if (gameManager && gameManager.playersAmount >= gameManager.maxPlayers) {
      console.log("Room is full, client - ", socket.id, "disconnected");
      socket.emit("onRoomFull", roomName);
      socket.disconnect();
    }

    if (!gameManager) {
      console.log("Creating new room - ", roomName);
      roomNameToGameManager.set(
        roomName,
        new GameManager(maxPlayers, roomName)
      );

      gameManager = roomNameToGameManager.get(roomName);
    }

    socket.join(roomName);
    gameManager.addPlayer(socket);

    onGetPlayersName(socket, roomName);
    onDisconnect(socket, roomName);
    onCardTakenFromPile(socket, roomName);
    onCardTakeFromDeck(socket, roomName);
    onYaniv(socket, roomName);
    onRestartGame(socket, roomName);

    if (gameManager.playersAmount === gameManager.maxPlayers) {
      setTimeout(() => {
        onGameStart(socket, roomName);
      }, 100);
    }
  });
};

const onGameStart = (socket, roomName) => {
  const gameManager = roomNameToGameManager.get(roomName);

  gameManager.initGame();
  gameManager.players.forEach((player) => {
    io.to(player.id).emit("onGameStart", player.hand);
    io.to(player.id).emit(
      "onPlayersStateChange",
      gameManager.getPlayersState()
    );
    io.to(player.id).emit("onPileUpdate", {
      pile: gameManager.pile,
      topPile: gameManager.topPile,
    });
  });

  changePlayerTurn(gameManager);
};

const onCardTakenFromPile = (socket, roomName) => {
  /*
    2. check if the player has this card, and the pile also has this card (else change turns).
  */
  socket.on("onCardTakenFromPile", ({ thrownCards, cardFromPile }) => {
    const gameManager = roomNameToGameManager.get(roomName);

    if (!gameManager.isPlayerTurn(socket.id)) {
      return;
    }

    gameManager.takeCardFromPile(socket.id, thrownCards, cardFromPile);

    socket.emit("onCardTaken", gameManager.getPlayer(socket.id).hand);
    io.to(roomName).emit("onPileUpdate", {
      pile: gameManager.pile,
      topPile: gameManager.topPile,
    });

    io.to(roomName).emit("onPlayersStateChange", gameManager.getPlayersState());
    changePlayerTurn(gameManager);
  });
};

const onCardTakeFromDeck = (socket, roomName) => {
  /*
    2. check if the player has this card, and the deck has cards in it (else change turns).
  */
  socket.on("onCardTakeFromDeck", (thrownCards) => {
    const gameManager = roomNameToGameManager.get(roomName);

    if (!gameManager.isPlayerTurn(socket.id)) {
      return;
    }

    gameManager.takeCardFromDeck(socket.id, thrownCards);

    socket.emit("onCardTaken", gameManager.getPlayer(socket.id).hand);
    io.to(roomName).emit("onPileUpdate", {
      pile: gameManager.pile,
      topPile: gameManager.topPile,
    });

    io.to(roomName).emit("onPlayersStateChange", gameManager.getPlayersState());
    changePlayerTurn(gameManager);
  });
};

const onGetPlayersName = (socket, roomName) => {
  socket.on("onGetPlayerName", (name, avatar, playerId) => {
    roomNameToGameManager.get(roomName).getPlayer(socket.id).name = name;
    roomNameToGameManager.get(roomName).getPlayer(socket.id).avatar = avatar;
    roomNameToGameManager.get(roomName).getPlayer(socket.id).playerId =
      playerId;
  });
};

const onYaniv = (socket, roomName) => {
  socket.on("onYaniv", (id) => {
    const gameManager = roomNameToGameManager.get(roomName);

    if (gameManager.calcHandSum(id) <= 7) {
      const minScorePlayer = gameManager.getMinHandScorePlayer();
      // get list on min score and check in not ===
      if (id === minScorePlayer.id) {
        gameManager.yanivAddScore(id);
        io.to(roomName).emit("onPlayerWin", {
          winner: minScorePlayer,
          state: gameManager.players,
        });
      } else {
        gameManager.assafAddScore(id);
        io.to(roomName).emit("onAssaf", {
          winner: minScorePlayer,
          state: gameManager.players,
        });
      }
    }
  });
};

const onRestartGame = (socket, roomName) => {
  socket.on("onRestartGame", () => {
    const gameManager = roomNameToGameManager.get(roomName);
    gameManager.restartGame();

    onGameStart(socket, roomName);
  });
};

const validateDepositedCards = (cards, roomName) => {
  console.log("To Be Implemented");
};

const changePlayerTurn = (gameManager) => {
  gameManager.changePlayerTurn();
  io.to(gameManager.roomName).emit(
    "onTurnChanged",
    gameManager.currentPlayerTurn
  );
};
