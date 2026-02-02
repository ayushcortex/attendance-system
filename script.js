const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const timerText = document.getElementById("timer");

let scanSeconds = 0;
let scanInterval = null;

async function loadModels() {
  console.log("Loading models...");
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
  console.log("Models loaded");
}

loadModels();

startBtn.addEventListener("click", async () => {
  console.log("Start Camera clicked");

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false
  });

  video.srcObject = stream;
  video.play();

  statusText.innerText = "Camera started ✅";

  video.addEventListener("play", startFaceDetection);
});

function startFaceDetection() {
  console.log("Detection loop started");

  scanSeconds = 0;
  timerText.innerText = "Scanner Time: 0 sec";

  scanInterval = setInterval(async () => {
    scanSeconds++;
    timerText.innerText = `Scanner Time: ${scanSeconds} sec`;

    const detection = await faceapi.detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (detection) {
      statusText.innerText = "Face detected ✅";
      nameText.innerText = "ayush";
      rollText.innerText = "72";
    } else {
      statusText.innerText = "No face detected ❌";
      nameText.innerText = "---";
      rollText.innerText = "---";
    }

  }, 1000);
}
