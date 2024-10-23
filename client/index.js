import { discordSdk, getUser } from "./discord.js";

const joinRoom = async (event) => {
  console.log(event);
  event.preventDefault();
  const user = getUser();
  window.location = `/game?name=${user?.username}&code=${discordSdk?.instanceId}`;
};

document.getElementById("start-button").addEventListener("click", joinRoom);

export const updateParticipantsLobby = ({ participants }) => {
  if (!participants?.length) {
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
