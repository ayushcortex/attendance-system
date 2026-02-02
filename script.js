const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const confirmBtn = document.getElementById("confirmBtn");

const statusText = document.getElementById("status");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const timerText = document.getElementById("scanTimer");
const attendanceBody = document.getElementById("attendanceBody");

let labeledDescriptors = [];
let currentMatch = null;
let seconds = 0;

// ⏱ TIMER
setInterval(() => {
  seconds++;
  timerText.innerText = seconds;
}, 1000);

// 🔹 LOAD MODELS
async function loadModels() {
  statusText.innerText = "Loading models...";
  await faceapi.nets.tinyFaceDetector.loadFromUri("models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("models");
  statusText.innerText = "Models loaded";
}

// 🔹 LOAD KNOWN FACES
async function loadKnownFaces() {
  const students = [
    "ayush_72",
    "Rahul_15",
    "Neha_21"
  ];

  for (let s of students) {
    const img = await faceapi.fetchImage(`known_faces/${s}.jpg`);
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(s, [detection.descriptor])
      );
    }
  }
}

// 🎥 START CAMERA
startBtn.onclick = async () => {
  await loadModels();
  await loadKnownFaces();

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  statusText.innerText = "Camera started";
  startRecognition();
};

// 🔍 FACE RECOGNITION LOOP
function startRecognition() {
  const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);

  setInterval(async () => {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      statusText.innerText = "❌ No face detected";
      confirmBtn.disabled = true;
      return;
    }

    const result = matcher.findBestMatch(detection.descriptor);

    if (result.label === "unknown") {
      statusText.innerText = "⚠️ Face not recognized";
      confirmBtn.disabled = true;
      return;
    }

    const [name, roll] = result.label.split("_");
    currentMatch = { name, roll };

    nameText.innerText = name;
    rollText.innerText = roll;
    statusText.innerText = "✅ Face recognized";
    confirmBtn.disabled = false;
  }, 1200);
}

// ✅ SAVE ATTENDANCE
confirmBtn.onclick = () => {
  if (!currentMatch) return;

  const now = new Date();

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${currentMatch.name}</td>
    <td>${currentMatch.roll}</td>
    <td>${now.toLocaleDateString()}</td>
    <td>${now.toLocaleTimeString()}</td>
  `;

  attendanceBody.appendChild(row);
  confirmBtn.disabled = true;
};
