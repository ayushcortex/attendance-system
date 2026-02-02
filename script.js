// ===== ELEMENTS =====
const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const confirmBtn = document.getElementById("confirmBtn");

const statusText = document.getElementById("status");
const timerText = document.getElementById("timer");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const attendanceBody = document.getElementById("attendanceBody");

let faceMatcher;
let scanSeconds = 0;
let scanInterval;
let currentPerson = null;

// ===== LOAD MODELS =====
async function loadModels() {
  const MODEL_URL = "./models";
  statusText.innerText = "Loading models...";
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  statusText.innerText = "Models loaded";
}

// ===== LOAD KNOWN FACES =====
async function loadKnownFaces() {
  const students = [
    { name: "Ayush", roll: "72" },
    { name: "Rahul", roll: "15" }
  ];

  const descriptors = [];

  for (const s of students) {
    const img = await faceapi.fetchImage(
      `./known_faces/${s.name}_${s.roll}.jpg`
    );

    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      descriptors.push(
        new faceapi.LabeledFaceDescriptors(
          `${s.name}_${s.roll}`,
          [detection.descriptor]
        )
      );
    }
  }

  faceMatcher = new faceapi.FaceMatcher(descriptors, 0.5);
}

// ===== START CAMERA =====
startBtn.addEventListener("click", async () => {
  await loadModels();
  await loadKnownFaces();

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false
  });

  video.srcObject = stream;
  await video.play();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  statusText.innerText = "Camera started";
  startTimer();
  startRecognition();
});

// ===== TIMER =====
function startTimer() {
  scanSeconds = 0;
  clearInterval(scanInterval);
  scanInterval = setInterval(() => {
    scanSeconds++;
    timerText.innerText = scanSeconds;
  }, 1000);
}

// ===== FACE RECOGNITION LOOP =====
function startRecognition() {
  setInterval(async () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      statusText.innerText = "No face detected";
      confirmBtn.disabled = true;
      return;
    }

    const result = faceMatcher.findBestMatch(detection.descriptor);
    const box = detection.detection.box;

    ctx.strokeStyle = result.label === "unknown" ? "red" : "lime";
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    if (result.label === "unknown") {
      statusText.innerText = "Unknown face";
      nameText.innerText = "---";
      rollText.innerText = "---";
      confirmBtn.disabled = true;
      return;
    }

    const [name, roll] = result.label.split("_");
    currentPerson = { name, roll };

    nameText.innerText = name;
    rollText.innerText = roll;
    statusText.innerText = "Face recognized";
    confirmBtn.disabled = false;
  }, 800);
}

// ===== SAVE ATTENDANCE =====
confirmBtn.addEventListener("click", () => {
  if (!currentPerson) return;

  const now = new Date();
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${currentPerson.name}</td>
    <td>${currentPerson.roll}</td>
    <td>${now.toLocaleDateString()}</td>
    <td>${now.toLocaleTimeString()}</td>
  `;

  attendanceBody.appendChild(row);
  confirmBtn.disabled = true;
});