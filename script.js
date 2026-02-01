const video = document.getElementById("video");
const startBtn = document.getElementById("startCamBtn");
const statusText = document.getElementById("status");
const confirmBtn = document.getElementById("confirmBtn");

const MODEL_URL = "./models";

async function loadModels() {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    statusText.innerText = "Models loaded";
  } catch (e) {
    statusText.innerText = "❌ Model loading error";
    console.error(e);
  }
}

loadModels();

startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    statusText.innerText = "Camera started";
    detectFace();
  } catch (e) {
    alert("Camera permission denied");
  }
});

async function detectFace() {
  setInterval(async () => {
    if (video.paused || video.ended) return;

    const detection = await faceapi.detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (detection) {
      statusText.innerText = "✅ Face detected (Authorized)";
      confirmBtn.disabled = false;
    } else {
      statusText.innerText = "❌ No face detected";
      confirmBtn.disabled = true;
    }
  }, 800);
}
