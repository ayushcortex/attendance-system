const video = document.getElementById("video");
const startCamBtn = document.getElementById("startCamBtn");
const confirmBtn = document.getElementById("confirmBtn");
const nameSpan = document.getElementById("name");
const rollSpan = document.getElementById("roll");
const statusText = document.getElementById("status");
const blinkStatus = document.getElementById("blinkStatus");
const tableBody = document.querySelector("#attendanceTable tbody");

const students = [
  { label: "rahul", name: "Rahul", roll: "101" },
  { label: "amit",  name: "Amit",  roll: "102" },
  { label: "neha",  name: "Neha",  roll: "103" },
  { label: "priya", name: "Priya", roll: "104" },
  { label: "arjun", name: "Arjun", roll: "105" }
];

let recognizedStudent = null;
let blinked = false;
let eyeClosed = false;

// LOAD MODELS
const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
]).then(() => {
  statusText.innerText = "Models loaded. Tap Start Camera.";
});

// LOAD KNOWN FACES (MULTIPLE PHOTOS)
async function loadKnownFaces() {
  const labeled = [];

  for (const s of students) {
    const descriptors = [];

    for (let i = 1; i <= 3; i++) {
      const img = await faceapi.fetchImage(`known_faces/${s.label}/${i}.jpg`);
      const det = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (det) descriptors.push(det.descriptor);
    }

    if (descriptors.length > 0) {
      labeled.push(new faceapi.LabeledFaceDescriptors(s.label, descriptors));
    }
  }
  return labeled;
}

// START CAMERA
startCamBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false
  });

  video.srcObject = stream;
  await video.play();

  startCamBtn.disabled = true;
  startCamBtn.innerText = "Camera Started";
  statusText.innerText = "Scanning face...";
  startRecognition();
};

// BLINK LOGIC (EAR)
function eyeAspectRatio(eye) {
  const A = distance(eye[1], eye[5]);
  const B = distance(eye[2], eye[4]);
  const C = distance(eye[0], eye[3]);
  return (A + B) / (2.0 * C);
}

function distance(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// FACE + BLINK LOOP
async function startRecognition() {
  const labeledFaces = await loadKnownFaces();
  const matcher = new faceapi.FaceMatcher(labeledFaces, 0.65);

  setInterval(async () => {
    const det = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!det) return;

    // BLINK DETECTION
    const leftEye = det.landmarks.getLeftEye();
    const rightEye = det.landmarks.getRightEye();

    const ear =
      (eyeAspectRatio(leftEye) + eyeAspectRatio(rightEye)) / 2;

    if (ear < 0.22) {
      eyeClosed = true;
    }

    if (ear > 0.25 && eyeClosed) {
      blinked = true;
      blinkStatus.innerText = "Blink detected ✅";
    }

    const result = matcher.findBestMatch(det.descriptor);

    if (result.label !== "unknown") {
      recognizedStudent = students.find(s => s.label === result.label);
      nameSpan.innerText = recognizedStudent.name;
      rollSpan.innerText = recognizedStudent.roll;

      if (blinked) {
        confirmBtn.disabled = false;
        statusText.innerText = "Face + Blink verified. Confirm attendance.";
      }
    }
  }, 1000);
}

// SAVE ATTENDANCE
confirmBtn.onclick = () => {
  const now = new Date();

  const record = {
    name: recognizedStudent.name,
    roll: recognizedStudent.roll,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString()
  };

  const data = JSON.parse(localStorage.getItem("attendance") || "[]");
  data.push(record);
  localStorage.setItem("attendance", JSON.stringify(data));

  renderAttendance();

  statusText.style.color = "green";
  statusText.innerText = "✅ Attendance Saved";
  confirmBtn.disabled = true;
};

// TABLE RENDER
function renderAttendance() {
  tableBody.innerHTML = "";
  const data = JSON.parse(localStorage.getItem("attendance") || "[]");

  data.forEach(r => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.name}</td>
      <td>${r.roll}</td>
      <td>${r.date}</td>
      <td>${r.time}</td>
    `;
    tableBody.appendChild(row);
  });
}

renderAttendance();
