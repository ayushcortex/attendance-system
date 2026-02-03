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

let faceMatcher = null;
let seconds = 0;
let timerInterval = null;
let currentPerson = null;

/* ================= LOAD MODELS ON PAGE LOAD ================= */
(async function init() {
  try {
    statusText.innerText = "Loading models...";
    const URL = "./models";

    await faceapi.nets.tinyFaceDetector.loadFromUri(URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(URL);

    await loadKnownFaces();
    statusText.innerText = "Models loaded. Tap Start Camera.";
  } catch (e) {
    statusText.innerText = "Model load failed";
    console.error(e);
  }
})();

/* ================= KNOWN FACES ================= */
async function loadKnownFaces() {
  const students = [
    { name: "Ayush", roll: "72" },
    { name: "Rahul", roll: "15" }
  ];

  const labeled = [];

  for (let s of students) {
    const img = await faceapi.fetchImage(
      `./known_faces/${s.name}_${s.roll}.jpg`
    );

    const det = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (det) {
      labeled.push(
        new faceapi.LabeledFaceDescriptors(
          `${s.name}_${s.roll}`,
          [det.descriptor]
        )
      );
    }
  }

  faceMatcher = new faceapi.FaceMatcher(labeled, 0.5);
}

/* ================= START CAMERA (IPHONE SAFE) ================= */
startBtn.addEventListener("click", async () => {
  try {
    statusText.innerText = "Requesting camera...";

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      statusText.innerText = "Camera started ✅";
      startTimer();
      startDetection();
    };
  } catch (err) {
    statusText.innerText = "Camera permission denied ❌";
    console.error(err);
  }
});

/* ================= TIMER ================= */
function startTimer() {
  seconds = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    seconds++;
    timerText.innerText = seconds;
  }, 1000);
}

/* ================= FACE RECOGNITION ================= */
function startDetection() {
  setInterval(async () => {
    if (!faceMatcher) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const det = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!det) {
      statusText.innerText = "No face detected";
      confirmBtn.disabled = true;
      return;
    }

    const best = faceMatcher.findBestMatch(det.descriptor);
    const box = det.detection.box;

    ctx.strokeStyle = best.label === "unknown" ? "red" : "lime";
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    if (best.label === "unknown") {
      nameText.innerText = "---";
      rollText.innerText = "---";
      statusText.innerText = "Unknown face";
      confirmBtn.disabled = true;
      return;
    }

    const [name, roll] = best.label.split("_");
    currentPerson = { name, roll };

    nameText.innerText = name;
    rollText.innerText = roll;
    statusText.innerText = "Face recognized ✅";
    confirmBtn.disabled = false;
  }, 700);
}

/* ================= SAVE ATTENDANCE ================= */
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