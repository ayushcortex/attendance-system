const video = document.getElementById("video");
const startBtn = document.getElementById("startCamBtn");
const confirmBtn = document.getElementById("confirmBtn");
const statusText = document.getElementById("status");
const indicator = document.getElementById("detectIndicator");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const tableBody = document.querySelector("#attendanceTable tbody");
const canvas = document.getElementById("overlay");

const MODEL_URL = "./models";
let faceDetected = false;

// Load model
async function loadModels() {
  try {
    statusText.innerText = "Loading models...";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    statusText.innerText = "Models loaded ✅";
  } catch (e) {
    console.error(e);
    statusText.innerText = "❌ Model loading error";
  }
}

loadModels();

// Start camera
startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();

    canvas.width = 320;
    canvas.height = 240;

    detectFace();
    statusText.innerText = "Camera started";
  } catch {
    alert("Camera permission denied");
  }
});

// Face detection
function detectFace() {
  const displaySize = { width: 320, height: 240 };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detection = await faceapi.detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detection) {
      const resized = faceapi.resizeResults(detection, displaySize);
      faceapi.draw.drawDetections(canvas, resized);

      faceDetected = true;
      indicator.innerText = "✅ Face detected";
      indicator.style.color = "green";
      confirmBtn.disabled = false;
      statusText.innerText = "Authorized";
    } else {
      faceDetected = false;
      indicator.innerText = "❌ No face detected";
      indicator.style.color = "red";
      confirmBtn.disabled = true;
      statusText.innerText = "Not authorized";
    }
  }, 700);
}

// Save attendance
confirmBtn.addEventListener("click", () => {
  if (!faceDetected) return;

  const now = new Date();
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${nameText.innerText}</td>
    <td>${rollText.innerText}</td>
    <td>${now.toLocaleDateString()}</td>
    <td>${now.toLocaleTimeString()}</td>
  `;

  tableBody.appendChild(row);
  confirmBtn.disabled = true;
  statusText.innerText = "Attendance saved ✅";
});