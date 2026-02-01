const video = document.getElementById("video");
const startBtn = document.getElementById("startCamBtn");
const statusText = document.getElementById("status");

const MODEL_URL = "./models";

// Load face-api models
async function loadModels() {
  try {
    statusText.innerText = "⏳ Loading models...";

    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

    statusText.innerText = "✅ Models loaded successfully";
    console.log("Models loaded");
  } catch (error) {
    console.error("Model loading error:", error);
    statusText.innerText = "❌ Model loading error";
  }
}

// Start camera
startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    console.log("Camera started");
  } catch (err) {
    alert("Camera permission denied or not available");
    console.error(err);
  }
});

// Run on page load
loadModels();
