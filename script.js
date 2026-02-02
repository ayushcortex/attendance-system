const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const confirmBtn = document.getElementById("confirmBtn");
const statusText = document.getElementById("status");
const nameText = document.getElementById("name");
const attendanceBody = document.getElementById("attendanceBody");

let labeledDescriptors = [];
let faceMatcher;
let currentName = null;

// Load models
async function loadModels() {
  const MODEL_URL = "./models";

  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

  statusText.innerText = "Models loaded ✅";
}

// Load known faces
async function loadKnownFaces() {
  const students = ["Ayush", "Rahul", "Neha"]; // ADD MORE NAMES HERE
  const labels = [];

  for (const student of students) {
    const descriptions = [];

    for (let i = 1; i <= 3; i++) {
      try {
        const img = await faceapi.fetchImage(`./known_faces/${student}/${i}.jpg`);
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) descriptions.push(detection.descriptor);
      } catch (e) {
        console.log(`Image missing: ${student}/${i}.jpg`);
      }
    }

    if (descriptions.length > 0) {
      labels.push(new faceapi.LabeledFaceDescriptors(student, descriptions));
    }
  }

  labeledDescriptors = labels;
  faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
}

// Start camera
startBtn.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" }
  });
  video.srcObject = stream;

  detectFace();
});

// Detect & recognize
async function detectFace() {
  setInterval(async () => {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      statusText.innerText = "❌ No face detected";
      confirmBtn.disabled = true;
      nameText.innerText = "---";
      return;
    }

    const match = faceMatcher.findBestMatch(detection.descriptor);

    if (match.label === "unknown") {
      statusText.innerText = "❌ Unknown face";
      confirmBtn.disabled = true;
      nameText.innerText = "---";
    } else {
      statusText.innerText = "✅ Face recognized";
      nameText.innerText = match.label;
      currentName = match.label;
      confirmBtn.disabled = false;
    }
  }, 1000);
}

// Save attendance
confirmBtn.addEventListener("click", () => {
  const now = new Date();

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${currentName}</td>
    <td>${now.toLocaleDateString()}</td>
    <td>${now.toLocaleTimeString()}</td>
  `;

  attendanceBody.appendChild(row);
  confirmBtn.disabled = true;
});

// INIT
(async () => {
  await loadModels();
  await loadKnownFaces();
})();
