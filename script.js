// ===== DOM ELEMENTS =====
const video = document.getElementById("video");
const startCamBtn = document.getElementById("startCamBtn");
const confirmBtn = document.getElementById("confirmBtn");
const nameSpan = document.getElementById("name");
const rollSpan = document.getElementById("roll");
const statusText = document.getElementById("status");
const tableBody = document.querySelector("#attendanceTable tbody");

// ===== STUDENT DATABASE =====
const students = [
  { label: "ayush", name: "Ayush", roll: "72" },
  { label: "amit",  name: "Amit",  roll: "102" },
  { label: "neha",  name: "Neha",  roll: "103" },
  { label: "priya", name: "Priya", roll: "104" },
  { label: "arjun", name: "Arjun", roll: "105" }
];

let recognizedStudent = null;

// ===== LOAD MODELS =====
const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
]).then(() => {
  statusText.innerText = "Models loaded. Click Start Camera.";
});

// ===== LOAD KNOWN FACES (MULTIPLE PHOTOS) =====
async function loadKnownFaces() {
  const labeledDescriptors = [];

  for (const s of students) {
    const descriptors = [];

    for (let i = 1; i <= 3; i++) {
      const path = `known_faces/${s.label}/${i}.jpg`;

      try {
        const img = await faceapi.fetchImage(path);
        const det = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (det) descriptors.push(det.descriptor);
      } catch {}
    }

    if (descriptors.length > 0) {
      labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(s.label, descriptors)
      );
    }
  }

  return labeledDescriptors;
}

// ===== START CAMERA =====
startCamBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();
    };

    startCamBtn.disabled = true;
    startCamBtn.innerText = "Camera Started";
    statusText.innerText = "Looking for face…";

    startRecognition();

  } catch (err) {
    console.error(err);
    alert("Camera permission blocked");
  }
};


// ===== FACE RECOGNITION LOOP =====
async function startRecognition() {
  const knownFaces = await loadKnownFaces();
  const matcher = new faceapi.FaceMatcher(knownFaces);

  setInterval(async () => {
    const det = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!det) return;

    const result = matcher.findBestMatch(det.descriptor);

    if (result.label === "unknown") {
      statusText.innerText = "Face not recognized";
      confirmBtn.disabled = true;
      return;
    }

    // ===== MATCH PERCENTAGE =====
    const distance = result.distance; // lower = better
    const matchPercent = Math.round((1 - distance) * 100);

    recognizedStudent = students.find(s => s.label === result.label);

    nameSpan.innerText = recognizedStudent.name;
    rollSpan.innerText = recognizedStudent.roll;

    statusText.innerText = `Match: ${matchPercent}%`;

    // ===== THRESHOLD =====
    if (matchPercent >= 65) {
      confirmBtn.disabled = false;
      statusText.innerText = `✅ Match: ${matchPercent}% (Authorized)`;
    } else {
      confirmBtn.disabled = true;
      statusText.innerText = `⚠️ Match: ${matchPercent}% (Too low)`;
    }

  }, 1000);
}

// ===== SAVE ATTENDANCE =====
confirmBtn.onclick = () => {
  if (!recognizedStudent) return;

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

  statusText.innerText = "✅ Attendance Saved";
  confirmBtn.disabled = true;
};

// ===== RENDER TABLE =====
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
