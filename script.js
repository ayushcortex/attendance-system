const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const confirmBtn = document.getElementById("confirmBtn");
const statusText = document.getElementById("status");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const attendanceBody = document.getElementById("attendanceBody");

let labeledDescriptors = [];
let faceMatcher;
let currentMatch = null;

// 🔐 Roll number mapping
const rollMap = {
  ayush: "72",
  rahul: "45",
  neha: "31"
};

// Load models
async function loadModels() {
  statusText.innerText = "Loading models...";
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("./models");
  statusText.innerText = "Models loaded";
}

// Load known faces
async function loadKnownFaces() {
  const labels = Object.keys(rollMap);

  labeledDescriptors = await Promise.all(
    labels.map(async label => {
      const descriptions = [];

      for (let i = 1; i <= 2; i++) {
        try {
          const img = await faceapi.fetchImage(`known_faces/${label}/${i}.jpg`);
          const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) descriptions.push(detection.descriptor);
        } catch {}
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );

  faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
}

// Start camera
startBtn.onclick = async () => {
  await loadModels();
  await loadKnownFaces();

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" }
  });

  video.srcObject = stream;
  statusText.innerText = "Camera started";
  detectFace();
};

// Detect & recognize face
function detectFace() {
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.4
  });

  setInterval(async () => {
    if (video.readyState !== 4) return;

    const detection = await faceapi
      .detectSingleFace(video, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const match = faceMatcher.findBestMatch(detection.descriptor);

      if (match.label !== "unknown") {
        currentMatch = match.label;
        statusText.innerText = "✅ Face recognized";
        nameText.innerText = currentMatch;
        rollText.innerText = rollMap[currentMatch];
        confirmBtn.disabled = false;
      } else {
        statusText.innerText = "❌ Unknown face";
        resetUI();
      }
    } else {
      statusText.innerText = "❌ No face detected";
      resetUI();
    }
  }, 1000);
}

function resetUI() {
  currentMatch = null;
  nameText.innerText = "---";
  rollText.innerText = "---";
  confirmBtn.disabled = true;
}

// Save attendance
confirmBtn.onclick = () => {
  if (!currentMatch) return;

  const now = new Date();
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${currentMatch}</td>
    <td>${rollMap[currentMatch]}</td>
    <td>${now.toLocaleDateString()}</td>
    <td>${now.toLocaleTimeString()}</td>
  `;

  attendanceBody.appendChild(row);
  confirmBtn.disabled = true;
};
