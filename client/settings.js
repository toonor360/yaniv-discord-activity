document.getElementById("music-button").addEventListener("click", (e) => {
  e.stopPropagation();
  e.preventDefault();

  if (document.getElementById("music-menu").classList.contains("hidden")) {
    document.getElementById("music-menu").classList.remove("hidden");
    return;
  }

  document.getElementById("music-menu").classList.add("hidden");
});

document.getElementById("music-range").value = 50;
document.getElementById("game-music").volume = 0.25;

document.getElementById("music-range").addEventListener("input", (event) => {
  const audio = document.getElementById("game-music");
  audio.volume = event.target.value / 200;
});

document.getElementById("sound-icon").addEventListener("click", (e) => {
  e.stopPropagation();
  e.preventDefault();

  if (document.getElementById("sound-icon").src.includes("sound-on")) {
    document.getElementById("sound-icon").src = "./assets/icons/sound-off.svg";
  } else {
    document.getElementById("sound-icon").src = "./assets/icons/sound-on.svg";
  }
});

export const isSoundOn = () => {
  return document.getElementById("sound-icon").src.includes("sound-on");
};
