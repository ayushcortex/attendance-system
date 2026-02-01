const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const confirmBtn = document.getElementById("confirmBtn");
const statusText = document.getElementById("status");
const attendanceBody = document.getElementById("attendanceBody");

let faceDetected = false;

// Load models
async function loadModels() {
  statusText.innerText = "Loading models...";
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
  statusText.innerText = "Models loaded";
}

loadModels();

// Start camera
startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();
      statusText.innerText = "Camera started";
      detectFace();
    };

  } catch (err) {
    alert("Camera permission denied");
    console.error(err);
  }
});

// Face detection
function detectFace() {
  setInterval(async () => {
    if (video.readyState !== 4) return;

    const detection = await faceapi.detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (detection) {
      faceDetected = true;
      statusText.innerText = "✅ Face detected";
      confirmBtn.disabled = false;
    } else {
      faceDetected = false;
      statusText.innerText = "❌ No face detected";
      confirmBtn.disabled = true;
    }
  }, 1000);
}

// Save attendance
confirmBtn.addEventListener("click", () => {
  if (!faceDetected) return;

  const now = new Date();

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>Ayush</td>
    <td>72</td>
    <td>${now.toLocaleDateString()}</td>
    <td>${now.toLocaleTimeString()}</td>
  `;

  attendanceBody.appendChild(row);
  confirmBtn.disabled = true;
});