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

/* ---------------- TIMER ---------------- */
setInterval(() => {
  seconds++;
  timerText.innerText = seconds;
}, 1000);

/* ---------------- LOAD MODELS ---------------- */
async function loadModels() {
  const base = "https://ayushcortex.github.io/attendance-system/models";
  console.log("Loading models from:", base);

  await faceapi.nets.tinyFaceDetector.loadFromUri(base);
  await faceapi.nets.faceLandmark68Net.loadFromUri(base);
  await faceapi.nets.faceRecognitionNet.loadFromUri(base);

  console.log("Models loaded");
  statusText.innerText = "Models loaded";
}

/* ---------------- LOAD KNOWN FACES ---------------- */
async function loadKnownFaces() {
  const students = [
    "ayush_72",
    "Rahul_15",
    "Neha_21"
  ];

  for (let student of students) {
    try {
      const imgUrl = `https://ayushcortex.github.io/attendance-system/known_faces/${student}.jpg`;
      console.log("Loading:", imgUrl);

      const img = await faceapi.fetchImage(imgUrl);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        console.warn("❌ No face found in", student);
        continue;
      }

      labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(student, [detection.descriptor])
      );

      console.log("✅ Loaded:", student);
    } catch (err) {
      console.error("Image load error:", student, err);
    }
  }

  console.log("Total registered faces:", labeledDescriptors.length);
}

/* ---------------- START CAMERA ---------------- */
startBtn.onclick = async () => {
  await loadModels();
  await loadKnownFaces();

  if (labeledDescriptors.length === 0) {
    statusText.innerText = "❌ No known faces loaded";
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" }
  });

  video.srcObject = stream;
  statusText.innerText = "Camera started ✅";

  startRecognition();
};

/* ---------------- FACE RECOGNITION LOOP ---------------- */
function startRecognition() {
  const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

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
    console.log("Match:", result.toString());

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
  }, 1500);
}

/* ---------------- SAVE ATTENDANCE ---------------- */
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
