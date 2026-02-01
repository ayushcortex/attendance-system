const video = document.getElementById("video");
const startBtn = document.getElementById("startCamBtn");
const statusText = document.getElementById("status");

const MODEL_URL = "/attendance-system/models";

async function loadModels() {
  try {
    statusText.innerText = "⏳ Loading face detector...";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

    statusText.innerText = "⏳ Loading landmarks...";
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

    statusText.innerText = "✅ Face detection ready";
  } catch (e) {
    console.error(e);
    statusText.innerText = "❌ Model loading error";
  }
}

startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    detectFace();
  } catch {
    alert("Camera permission denied");
  }
});

async function detectFace() {
  setInterval(async () => {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (detection) {
      statusText.innerText = "✅ Face detected (Authorized)";
    } else {
      statusText.innerText = "❌ No face detected";
    }
  }, 500);
}

loadModels();
