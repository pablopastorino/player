/* -------------------------------- Variables ------------------------------- */
let leftTime = 4;
let count = setInterval(countdown, 500);
let filesList = [];
const pointerEvents = ["pointerdown", "pointerup", "pointerover", "pointerout"];
const videoEvents = ["play", "pause"];

/* -------------------------------- Elements -------------------------------- */

const video = document.querySelector("video");

const folder = document.querySelector(".menu__upload-file");
const title = document.querySelector(".title");

const bigPlay = document.querySelector(".big-play-pause > i");
const bigControls = document.querySelectorAll(".player__big-controls *");

const controlsContainer = document.querySelector(".player__controls");
const controls = document.querySelectorAll(".player__controls *");
const timeLeft = document.querySelector(".time-left");

const playButton = document.querySelector(".play-pause > i");
const seekButtons = document.querySelectorAll('[class^="fast"] > i');
const menu = document.querySelector(".player__menu");
const filesInput = document.querySelector("#upload-file"); // Input
const playList = document.querySelector(".files-list");
// Speed
const speedButton = document.querySelector(".speed > i");
const speedValue = document.querySelector(".speed-value"); //label
const speedRange = document.querySelector("#speed");
/* -------------------------------- Listeners ------------------------------- */
// Folder
pointerEvents.forEach((e) => {
  folder.addEventListener(e, (e) => animateFolder(e));
});
document.addEventListener("pointermove", (e) => showElements(e));
filesInput.addEventListener("change", handleFiles);
filesInput.addEventListener("change", (e) => showFiles(e));
playButton.addEventListener("pointerdown", togglePlay);
bigControls[2].addEventListener("pointerdown", togglePlay);
videoEvents.forEach((e) => video.addEventListener(e, animatePlayButtons));
seekButtons.forEach((button) => {
  button.addEventListener("pointerdown", (e) => quickChange(e));
});
controls[13].addEventListener("pointerdown", () => {
  video.muted = !video.muted;
  controls[12].value = video.muted ? "0" : video.volume * "100";
  controls[12].style.background =
    "linear-gradient(to right, #ff5733 0%, #ff5733 " +
    controls[12].value +
    "%, #55453d8f " +
    controls[12].value +
    "%, #55453d8f 100%)";

  animateIcon(video.volume * 100);
});
controls[12].addEventListener("input", animateSlider);
controls[12].addEventListener("change", handleVolume);
video.ontimeupdate = showProgress;
if (controls[2]) controls[2].oninput = seek;
video.addEventListener("canplay", showTimeLeft);
speedRange.oninput = animateSlider;
speedRange.onchange = () => {
  video.playbackRate = speedRange.valueAsNumber;
  speedValue.innerText = `${speedRange.valueAsNumber}x`;
};
bigControls[2].addEventListener("pointerdown", togglePlay);

/* -------------------------------- Functions ------------------------------- */
function animateFolder(e) {
  const folderIcon = document.querySelector(".custom-upload-file > i");

  folderIcon.className = `fa fa-folder-${
    (e.type === "pointerover" && "open-o") ||
    (e.type === "pointerdown" && "open") ||
    "o"
  }`;
}

function countdown() {
  if (leftTime == 0) {
    [controlsContainer, menu].forEach((e) => e.classList.remove("visible"));
    leftTime = 4;
  }
  leftTime -= 1;
}

function showElements(e) {
  [controlsContainer, menu].forEach((e) => e.classList.add("visible"));

  leftTime = 4;
  clearInterval(count);
  if (window.getComputedStyle(e.target).cursor === "pointer") return;
  count = setInterval(countdown, 500);
}

function handleFiles(e) {
  if (e.target.files.length === 0) return;
  const files = e.target.files;

  for (const key in files) {
    if (Object.hasOwnProperty.call(files, key)) {
      const file = files[key];

      let fileData = {};
      fileData.name = file.name.substring(0, file.name.lastIndexOf("."));
      fileData.url = URL.createObjectURL(file);

      filesList.push(fileData);
    }
  }
  showFiles();
}

function showFiles() {
  playList.innerHTML = "";

  filesList.forEach((file) => {
    const row = document.createElement("hr");
    const itemRow = document.createElement("li").appendChild(row);
    const item = document.createElement("li");

    item.innerText = file.name;
    item.objUrl = file.url;
    item.className = "movie-item";
    item.addEventListener("pointerdown", playFile);

    if (filesList.indexOf(file) > 0) playList.appendChild(itemRow);
    playList.appendChild(item);
  });

  // Play First Video
  const { firstChild } = playList;
  const playFirst = playFile.bind(firstChild);
  playFirst();
}

function playFile() {
  // Video Properties
  video.src = this.objUrl;
  video.volume = controls[12].value / 100;
  video.playbackRate = controls[19].valueAsNumber;

  // HTML
  title.innerText = this.innerText;
}

function togglePlay() {
  console.log(this);
  if (!video.duration) return;
  video.paused ? video.play() : video.pause();
}

function animatePlayButtons() {
  bigPlay.classList = playButton.className;

  playButton.className = `fa fa-${
    video.duration && !video.paused ? "pause" : "play"
  }`;

  bigPlay.classList.add("animate-play");
  setTimeout(() => bigPlay.classList.remove("animate-play"), 1000);
}

function quickChange(e) {
  if (!video.duration) return;
  const backward = e.target.parentElement.className === "fast-backward";
  video.currentTime += backward ? -10 : 10;
}

function animateSlider() {
  var value = ((this.value - this.min) / (this.max - this.min)) * 100;
  this.style.background =
    "linear-gradient(to right, #ff5733 0%, #ff5733 " +
    value +
    "%, #55453d8f " +
    value +
    "%, #55453d8f 100%)";
}

function showProgress() {
  if (!video.duration) return;
  controls[0].value = String(
    Math.round((video.currentTime / video.duration) * 100)
  );
  let animateProgress = animateSlider.bind(controls[0]);
  animateProgress();
}

function seek() {
  if (!isNaN(video.duration)) {
    video.currentTime = (controls[2].value / 100) * video.duration;
  }
}

function showTimeLeft() {
  const left = video.duration - video.currentTime;
  const currentTime = document.querySelector(".current-time");

  timeLeft.innerText = formatTime(video.duration);

  currentTime.innerText = formatTime(video.currentTime) + " /";

  video.addEventListener("timeupdate", () => {
    if (!left) return;
    currentTime.innerText = formatTime(video.currentTime) + " /";
  });
}

function formatTime(seconds) {
  const hours = seconds / 3600;
  const minutes = (seconds % 3600) / 60;
  const format =
    hours > 1 ? [hours, minutes, seconds % 60] : [minutes, seconds % 60];

  return format.map((val) => `0${Math.floor(val)}`.slice(-2)).join(":");
}

function highlightTitle() {
  playList.childNodes.forEach((item) => {
    const isPlaying = video.src === item.objUrl;
    isPlaying
      ? item.classList.add("playing")
      : item.classList.remove("playing");
  });
}

function showOnMove(e) {
  const {
    target: { className },
    type,
  } = e;
  if (type === "pointermove") {
    progressBar.style.visibility = "visible";
    controls.style.transform = "translateY(0)";
  }
  console.log(e);
  if (
    e.target.className !== "controls" ||
    e.target.className !== "progress-bar"
  ) {
    setTimeout(() => {
      progressBar.style.visibility = "hidden";
    }, 3000);
  }
}

function handleVolume() {
  video.volume = controls[12].value / 100;

  const range = parseInt(controls[12].max - controls[12].min);
  const percentage =
    ((controls[12].valueAsNumber - parseInt(controls[12].min)) / range) * 100;

  animateIcon(percentage);
}

function animateIcon(percentage) {
  const icon =
    video.muted || percentage === 0 ? "off" : percentage >= 50 ? "up" : "down";

  controls[13].className = `fa fa-volume-${icon}`;
}
