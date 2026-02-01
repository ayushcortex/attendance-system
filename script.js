const video = document.getElementById("video");
const startBtn = document.getElementById("startCamBtn");
const confirmBtn = document.getElementById("confirmBtn");
const statusText = document.getElementById("status");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const tableBody = document.querySelector("#attendanceTable tbody");

const MODEL_URL = "./models";
const KNOWN_FACES = "./known_faces";

let faceMatcher;
let currentMatch = null;

// ---------------- LOAD MODELS ----------------
async function loadModels() {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    statusText.innerText = "Models loaded";
  } catch (e) {
    statusText.innerText = "❌ Model loading error";
    console.error(e);
  }
}

// ---------------- LOAD KNOWN FACES ----------------
async function loadKnownFaces() {
  const labels = [
    "Ayush_72",
    "Riya_102",
    "Aman_103",
    "Neha_104",
    "Riya_105"
  ];

  const labeledDescriptors = [];

  for (const label of labels) {
    const img = await faceapi.fetchImage(`${KNOWN_FACES}/${label}.jpg`);
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(label, [detection.descriptor])
      );
    }
  }

  faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
}

// ---------------- CAMERA ----------------
startBtn.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  await video.play();
  statusText.innerText = "Camera started";
  recognizeFace();
});

// ---------------- FACE RECOGNITION ----------------
async function recognizeFace() {
  setInterval(async () => {
    if (!faceMatcher) return;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      statusText.innerText = "❌ No face detected";
      confirmBtn.disabled = true;
      return;
    }

    const result = faceMatcher.findBestMatch(detection.descriptor);

    if (result.label === "unknown") {
      statusText.innerText = "❌ Unauthorized face";
      confirmBtn.disabled = true;
      return;
    }

    const [name, roll] = result.label.split("_");
    currentMatch = { name, roll };

    nameText.innerText = name;
    rollText.innerText = roll;
    statusText.innerText = `✅ Authorized (${Math.round((1 - result.distance) * 100)}%)`;
    confirmBtn.disabled = false;
  }, 1000);
}

// ---------------- SAVE ATTENDANCE ----------------
confirmBtn.addEventListener("click", () => {
  if (!currentMatch) return;

  const now = new Date();
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${currentMatch.name}</td>
    <td>${currentMatch.roll}</td>
    <td>${now.toLocaleDateString()}</td>
    <td>${now.toLocaleTimeString()}</td>
  `;

  tableBody.appendChild(row);
  statusText.innerText = "✅ Attendance saved";
  confirmBtn.disabled = true;
});

(async () => {
  await loadModels();
  await loadKnownFaces();
})();
