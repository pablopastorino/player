// ######################################################
// Elements
// ######################################################
// Player Area
const player = document.querySelector(".player");

// Video
// ------------------------------------------------------
const video = document.querySelector("video");

// Files
// ------------------------------------------------------
// Input
const filesInput = document.querySelector("#upload-file");
// Icon
const filesButton = document.querySelector(".custom-upload-file > i");
// Selected Files (name and url objects)
let filesList = [];

// Controls
// ------------------------------------------------------
// Container Box
const controls = document.querySelectorAll(".controls > i");
// Play
const playButton = document.querySelector(".play-pause > i");
// Seek
const seekButtons = document.querySelectorAll('[class^="fast"] > i');
// Volume
const volumeButton = document.querySelector(".volume > i");
const volumeRange = document.querySelector("#volume");
// Speed
const speedButton = document.querySelector(".speed > i");
const speedValue = document.querySelector(".speed-value"); //label
const speedRange = document.querySelector("#speed");
// Videos List
const menuButton = document.querySelector(".list > i");
const playList = document.querySelector(".files-list");
let videoItems = [];

// Title
const title = document.querySelector(".title");
// Progress - Time Left
const progressBar = document.querySelector(".progress-bar");
const progressRange = document.querySelector(".progress-bar > input");
const timeLeft = document.querySelector(".time-left");

// Big Controls
// ------------------------------------------------------
const playArea = document.querySelector(".big-play-pause");
const bigPlay = document.querySelector(".big-play-pause > i");

// ######################################################
// Functions
// ######################################################
function animate(element, events, action) {
  events.forEach((event) => element.addEventListener(event, (e) => action(e)));
}

function animateFolder(e) {
  const events = [
    e.type === "pointerover",
    e.type === "pointerout",
    e.type === "pointerdown",
    e.type === "pointerup",
  ];
  const [pOver, pOut, pDown, pUp] = events;

  e.target.className = `fa fa-folder-${
    pOut || pUp ? "o" : `${(pDown && "open") || (pOver && "open-o")}`
  }`;

  e.target.style.color =
    ((pOut || pUp || pOver) && "white") || (pDown && "#ff9700");

  // e.target.style.transform =
  //   ((pOut || pUp) && "scale(1,1)") || ((pOver || pDown) && "scale(1.25,1.25)");
}

function handleFiles(e) {
  if (e.target.files.length === 0) return;
  // Empty previous playlist
  filesList = [];
  // Object with new selected files
  const files = e.target.files;

  // Populate the array with new files objects
  for (const key in files) {
    if (Object.hasOwnProperty.call(files, key)) {
      const file = files[key];

      let fileData = {};
      fileData.name = file.name.substring(0, file.name.lastIndexOf("."));
      fileData.url = URL.createObjectURL(file);

      filesList.push(fileData);
    }
  }
}

function showFiles(e) {
  if (e.target.files.length === 0) return;
  console.log(e);

  playList.innerHTML = "";

  filesList.forEach((file) => {
    const row = document.createElement("hr");
    const item = document.createElement("li");

    item.innerText = file.name;
    item.objUrl = file.url;
    item.className = "movie-item";
    item.addEventListener("pointerdown", playFile);

    if (filesList.indexOf(file) > 0) playList.appendChild(row);
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
  video.volume = volumeRange.value / 100;
  video.playbackRate = speedRange.valueAsNumber;

  // HTML
  title.innerText = this.innerText;

  // Styles
  // this.style.color = "#ff9700";
}

function togglePlay() {
  if (!video.duration) return;
  video.paused ? video.play() : video.pause();
}

function animatePlayButtons() {
  bigPlay.classList = playButton.className;
  // Controls Play Button
  playButton.className = `fa fa-${
    video.duration && !video.paused ? "pause" : "play"
  }`;
  // Big Play Button
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
    "linear-gradient(to right, #ff9700 0%, #ff9700 " +
    value +
    "%, #55453d8f " +
    value +
    "%, #55453d8f 100%)";
}

function showProgress() {
  if (!video.duration) return;
  progressRange.value = String(
    Math.round((video.currentTime / video.duration) * 100)
  );
  let animateProgress = animateSlider.bind(progressRange);
  animateProgress();
}

function seek() {
  if (!isNaN(video.duration)) {
    video.currentTime = (progressRange.value / 100) * video.duration;
  }
}

function showTimeLeft() {
  video.addEventListener("timeupdate", () => {
    const left = video.duration - video.currentTime;
    if (!left) return;
    timeLeft.innerText = formatTime(left);
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

// ######################################################
// Dynamics
// ######################################################
animate(
  filesButton,
  ["pointerover", "pointerout", "pointerdown", "pointerup"],
  animateFolder
);

// Files
animate(filesInput, ["change"], handleFiles);
// List
filesInput.addEventListener("change", (e) => showFiles(e));
// Play
playButton.addEventListener("pointerdown", togglePlay);
playArea.addEventListener("pointerdown", togglePlay);
["play", "pause"].forEach((event) =>
  video.addEventListener(event, animatePlayButtons)
);

// Quick Change
seekButtons.forEach((button) => {
  button.addEventListener("pointerdown", (e) => quickChange(e));
});

// Volume
["pointerover", "pointerout", "pointerdown"].forEach((event) => {
  volumeButton.addEventListener(event, (e) => {
    if (e.type === "pointerover") volumeRange.style.visibility = "visible";
    if (e.type === "pointerout") {
      if (e.relatedTarget.className === "volume" || "volume-slider")
        volumeRange.style.visibility = "visible";
      else volumeRange.style.visibility = "hidden";
    }

    if (e.type === "pointerdown") {
      video.muted = !video.muted;
      volumeRange.value = video.muted ? "0" : video.volume * "100";
      volumeRange.style.background =
        "linear-gradient(to right, #ff9700 0%, #ff9700 " +
        volumeRange.value +
        "%, #55453d8f " +
        volumeRange.value +
        "%, #55453d8f 100%)";
    }
  });
  volumeRange.addEventListener(event, (e) => {
    e.type === "pointerout" && (volumeRange.style.visibility = "hidden");
  });
});

volumeRange.addEventListener("input", animateSlider);
volumeRange.addEventListener("change", (e) => {
  // Funcionality
  video.volume = e.currentTarget.value / 100;
  // Style
  const range = parseInt(e.currentTarget.max - e.currentTarget.min);
  const percentage =
    ((e.currentTarget.valueAsNumber - parseInt(e.currentTarget.min)) / range) *
    100;
  if (percentage === 0) volumeButton.className = "fa fa-volume-off";
  if (percentage <= 50 && percentage > 0)
    volumeButton.className = "fa fa-volume-down";
  if (percentage > 50) volumeButton.className = "fa fa-volume-up";
});

// Speed
speedRange.oninput = animateSlider;

["pointerover", "pointerout"].forEach((event) => {
  speedButton.addEventListener(event, (e) => {
    if (e.type === "pointerover") speedRange.style.display = "block";
    if (e.type === "pointerout") {
      setTimeout(() => {
        if (e.relatedTarget.className === "speed")
          speedRange.style.display = "block";
        else speedRange.style.display = "none";
      }, 1200);
    }
  });
  speedRange.addEventListener(event, (e) => {
    e.type === "pointerout" && (speedRange.style.display = "none");
  });
});

speedRange.onchange = () => {
  video.playbackRate = speedRange.valueAsNumber;
  speedValue.innerText = `${speedRange.valueAsNumber}x`;
};

// Progress
video.ontimeupdate = showProgress;
if (progressRange) progressRange.oninput = seek;

// Time Left
video.addEventListener("canplay", showTimeLeft);

// Videos List
menuButton.addEventListener("pointerover", (e) => showList(e));
menuButton.addEventListener("pointerout", (e) => showList(e));

video.addEventListener("canplay", highlightTitle);

// Display on Mouse Move
["pointermove", "pointerover"].forEach((event) =>
  document.addEventListener(event, (e) => showOnMove(e))
);
