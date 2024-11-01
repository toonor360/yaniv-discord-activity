import { discordSdk, getUser } from "./discord.js";

const readySound = new Audio("./assets/music/sounds/im-ready.wav");
readySound.volume = 0.1;

const joinRoom = async (event) => {
  readySound.play();

  event.preventDefault();
  const user = getUser();

  window.location = `/game?name=${user?.username}&code=${discordSdk?.instanceId}&playerId=${user?.id}&avatar=${user?.avatar}`;
};

document.getElementById("start-button")?.addEventListener("click", joinRoom);

export const hideSplashScreen = () => {
  const splashScreen = document.querySelector(".splash");

  splashScreen.style.opacity = 0;
  setTimeout(() => {
    splashScreen.classList.add("hidden");
  }, 610);
};

export const updateParticipantsLobby = ({ participants }) => {
  if (!participants?.length || participants.length > 2) {
    document.getElementById("start-button").disabled = true;
    document.getElementById("alert").style.display = "alert";
    return;
  }

  document.getElementById("start-button").disabled = false;
  const participantsList = document.getElementById("participants-list");
  participantsList.innerHTML = "";

  participants.forEach((participant) => {
    const participantElement = document.createElement("div");
    participantElement.classList.add(
      "col-6",
      "d-flex",
      "align-items-center",
      "justify-content-end",
      "py-2",
      "flex-row-reverse"
    );
    const avatarTag = document.createElement("img");

    let avatarSrc = "";
    if (participant.avatar) {
      avatarSrc = `https://cdn.discordapp.com/avatars/${participant.id}/${participant.avatar}.png?size=256`;
    } else {
      const defaultAvatarIndex = (BigInt(participant.id) >> 22n) % 6n;
      avatarSrc = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
    }

    avatarTag.src = avatarSrc;
    avatarTag.alt = participant.username;
    avatarTag.classList.add("avatar");

    participantsList.appendChild(participantElement);
    participantElement.textContent = participant.username;
    participantElement.appendChild(avatarTag);
  });
};
