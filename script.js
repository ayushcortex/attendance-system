const video = document.getElementById("video");
const startCamBtn = document.getElementById("startCamBtn");
const confirmBtn = document.getElementById("confirmBtn");
const nameSpan = document.getElementById("name");
const rollSpan = document.getElementById("roll");
const statusText = document.getElementById("status");

const tableBody = document.querySelector("#attendanceTable tbody");

// 🔹 STUDENT FACE DATABASE
const students = [
  { label: "rahul", name: "Rahul", roll: "101" },
  { label: "amit",  name: "Amit",  roll: "102" },
  { label: "neha",  name: "Neha",  roll: "103" },
  { label: "priya", name: "Priya", roll: "104" },
  { label: "arjun", name: "Arjun", roll: "105" }
];

let recognizedStudent = null;

// 🔹 LOAD MODELS
const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
]).then(() => {
  statusText.innerText = "Models loaded. Tap Start Camera.";
});

// 🔹 LOAD KNOWN FACES
async function loadKnownFaces() {
  return Promise.all(
    students.map(async s => {
      const img = await faceapi.fetchImage(`known_faces/${s.label}.jpg`);
      const det = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      return new faceapi.LabeledFaceDescriptors(s.label, [det.descriptor]);
    })
  );
}

// 🔹 START CAMERA (USER CLICK REQUIRED)
startCamBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    startCamBtn.disabled = true;
    startCamBtn.innerText = "Camera Started";

    startRecognition();

  } catch (err) {
    alert("Camera permission denied");
  }
};

// 🔹 FACE RECOGNITION LOOP
async function startRecognition() {
  const labeledFaces = await loadKnownFaces();
  const matcher = new faceapi.FaceMatcher(labeledFaces, 0.5);

  setInterval(async () => {
    const det = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!det) return;

    const result = matcher.findBestMatch(det.descriptor);

    if (result.label !== "unknown") {
      recognizedStudent = students.find(s => s.label === result.label);

      nameSpan.innerText = recognizedStudent.name;
      rollSpan.innerText = recognizedStudent.roll;

      confirmBtn.disabled = false;
      statusText.innerText = "Face recognized. Confirm attendance.";
    }
  }, 1200);
}

// 🔹 SAVE ATTENDANCE
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

  statusText.style.color = "green";
  statusText.innerText = "✅ Attendance Saved";

  confirmBtn.disabled = true;
};

// 🔹 LOAD TABLE
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