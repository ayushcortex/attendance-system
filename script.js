const video = document.getElementById("video");
const startBtn = document.getElementById("startCamBtn");
const statusText = document.getElementById("status");

const MODEL_URL = "/attendance-system/models";

async function loadModels() {
  try {
    statusText.innerText = "⏳ Loading tiny face detector...";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

    statusText.innerText = "⏳ Loading face landmarks...";
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

    statusText.innerText = "⏳ Loading face recognition...";
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

    statusText.innerText = "✅ Models loaded successfully";
    console.log("All models loaded");
  } catch (err) {
    console.error("MODEL LOAD FAILED:", err);
    statusText.innerText = "❌ Model loading error";
  }
}

startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
  } catch (err) {
    alert("Camera permission denied");
  }
});

loadModels();
