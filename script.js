// ===== ELEMENTS =====
const video = document.getElementById("video");
const startBtn = document.getElementById("startCamBtn");
const confirmBtn = document.getElementById("confirmBtn");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const statusText = document.getElementById("status");
const tableBody = document.querySelector("#attendanceTable tbody");

// ===== PATHS (DO NOT CHANGE) =====
const MODEL_URL = "./models";

// ===== FLAGS =====
let faceDetected = false;

// ===== LOAD MODELS =====
async function loadModels() {
  try {
    statusText.innerText = "Loading models...";

    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

    statusText.innerText = "Models loaded ✅";
  } catch (err) {
    console.error(err);
    statusText.innerText = "❌ Model loading error";
  }
}

loadModels();

// ===== START CAMERA =====
startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();

    statusText.innerText = "Camera started";
    detectFace();
  } catch (err) {
    alert("Camera permission denied");
  }
});

// ===== FACE DETECTION LOOP =====
function detectFace() {
  setInterval(async () => {
    if (video.paused || video.ended) return;

    const detection = await faceapi.detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (detection) {
      faceDetected = true;
      statusText.innerHTML = "✅ Face detected (Authorized)";
      confirmBtn.disabled = false;

      // Auto-fill demo data
      nameText.innerText = "Ayush";
      rollText.innerText = "101";
    } else {
      faceDetected = false;
      statusText.innerHTML = "❌ No face detected";
      confirmBtn.disabled = true;

      nameText.innerText = "---";
      rollText.innerText = "---";
    }
  }, 800);
}

// ===== SAVE ATTENDANCE =====
confirmBtn.addEventListener("click", () => {
  if (!faceDetected) return;

  const name = nameText.innerText;
  const roll = rollText.innerText;

  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${name}</td>
    <td>${roll}</td>
    <td>${date}</td>
    <td>${time}</td>
  `;

  tableBody.appendChild(row);

  statusText.innerText = "Attendance saved ✅";
  confirmBtn.disabled = true;
});