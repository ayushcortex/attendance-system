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

let labeledDescriptors;
let faceMatcher;
let scanTimer = 0;
let interval;
let detectedPerson = null;

/* ================= LOAD MODELS ================= */

async function loadModels() {
  const MODEL_URL = "./models";

  console.log("Loading models...");
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  console.log("Models loaded");
}

/* ============ LOAD KNOWN FACES ================= */

async function loadKnownFaces() {
  const students = [
    { name: "Ayush", roll: "72" },
    { name: "Rahul", roll: "45" }
  ];

  return Promise.all(
    students.map(async student => {
      const descriptors = [];

      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(
          `./known_faces/${student.name.toLowerCase()}/${i}.jpg`
        );

        const detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) descriptors.push(detection.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(
        student.name,
        descriptors
      );
    })
  );
}

/* ================= START CAMERA ================= */

startBtn.onclick = async () => {
  await loadModels();
  labeledDescriptors = await loadKnownFaces();
  faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  statusText.innerText = "Camera started ✅";
  scanTimer = 0;
  interval = setInterval(() => timerText.innerText = ++scanTimer, 1000);

  detectLoop();
};

/* ================= DETECTION LOOP ================= */

async function detectLoop() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  setInterval(async () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      statusText.innerText = "No face ❌";
      confirmBtn.disabled = true;
      return;
    }

    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

    const box = detection.detection.box;
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    ctx.fillStyle = "lime";
    ctx.fillText(bestMatch.label, box.x, box.y - 5);

    if (bestMatch.label !== "unknown") {
      detectedPerson = bestMatch.label;
      nameText.innerText = bestMatch.label;
      rollText.innerText = bestMatch.label === "Ayush" ? "72" : "45";
      statusText.innerText = "Face recognized ✅";
      confirmBtn.disabled = false;
    }
  }, 800);
}

/* ================= SAVE ATTENDANCE ================= */

confirmBtn.onclick = () => {
  const now = new Date();

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${nameText.innerText}</td>
    <td>${rollText.innerText}</td>
    <td>${now.toLocaleDateString()}</td>
    <td>${now.toLocaleTimeString()}</td>
  `;

  attendanceBody.appendChild(row);
  confirmBtn.disabled = true;
};
