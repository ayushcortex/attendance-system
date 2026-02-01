const video = document.getElementById("video");
const startBtn = document.getElementById("startCamBtn");
const confirmBtn = document.getElementById("confirmBtn");
const statusText = document.getElementById("status");
const nameSpan = document.getElementById("name");
const rollSpan = document.getElementById("roll");
const tableBody = document.querySelector("#attendanceTable tbody");

// 🔴 CORRECT MODEL PATH FOR GITHUB PAGES
const MODEL_URL = "/attendance-system/models";
const KNOWN_FACES_URL = "/attendance-system/known_faces";

let labeledDescriptors = [];
let faceMatcher;
let detectedPerson = null;

// Load models
async function loadModels() {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    statusText.innerText = "Loading known faces...";
    await loadKnownFaces();
    statusText.innerText = "✅ Ready";
  } catch (err) {
    console.error(err);
    statusText.innerText = "❌ Model loading error";
  }
}

// Load known face images
async function loadKnownFaces() {
  const people = [
    "Ayush_72",
    "Rahul_102",
    "Neha_103"
  ];

  for (let person of people) {
    const img = await faceapi.fetchImage(`${KNOWN_FACES_URL}/${person}.jpg`);
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) continue;

    labeledDescriptors.push(
      new faceapi.LabeledFaceDescriptors(person, [detection.descriptor])
    );
  }

  faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
}

// Start camera
startBtn.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
});

// Face detection loop
video.addEventListener("play", () => {
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

    const result = faceMatcher.findBestMatch(detection.descriptor);

    if (result.label === "unknown") {
      statusText.innerText = "❌ Unauthorized face";
      confirmBtn.disabled = true;
      return;
    }

    const [name, roll] = result.label.split("_");
    nameSpan.innerText = name;
    rollSpan.innerText = roll;
    detectedPerson = { name, roll };

    statusText.innerText = `✅ Authorized (${Math.round((1 - result.distance) * 100)}%)`;
    confirmBtn.disabled = false;
  }, 1500);
});

// Save attendance
confirmBtn.addEventListener("click", () => {
  if (!detectedPerson) return;

  const now = new Date();
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${detectedPerson.name}</td>
    <td>${detectedPerson.roll}</td>
    <td>${now.toLocaleDateString()}</td>
    <td>${now.toLocaleTimeString()}</td>
  `;

  tableBody.appendChild(row);
  confirmBtn.disabled = true;
});

loadModels();
