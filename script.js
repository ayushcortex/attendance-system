window.onload = () => {
  main();
};

async function main() {
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

let labeledDescriptors = [];
let currentMatch = null;
let seconds = 0;

/* ================= LOAD MODELS ================= */

async function loadModels() {
  statusText.innerText = "Loading models...";
  await faceapi.nets.tinyFaceDetector.loadFromUri("models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("models");
  statusText.innerText = "Models loaded";
}

loadModels();

/* ================= LOAD KNOWN FACES ================= */

async function loadKnownFaces() {
  const students = [
    "ayush_72",
    "Rahul_15",
    "Aman_23"
  ];

  for (let student of students) {
    const img = await faceapi.fetchImage(`known_faces/${student}.jpg`);
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      labeledDescriptors.push(
        new faceapi.LabeledFaceDescriptors(student, [detection.descriptor])
      );
    }
  }
}

/* ================= START CAMERA ================= */

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("video");
const statusText = document.getElementById("status");

startBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    video.srcObject = stream;
    await video.play();

    statusText.innerText = "Camera started ✅";
    console.log("Camera stream started");

  } catch (err) {
    console.error(err);
    alert("Camera permission denied or not available");
  }
};


/* ================= TIMER ================= */

function startTimer() {
  seconds = 0;
  setInterval(() => {
    seconds++;
    timerText.innerText = seconds;
  }, 1000);
}

/* ================= FACE RECOGNITION ================= */

function startRecognition() {
  const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

  setInterval(async () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      statusText.innerText = "❌ No face detected";
      confirmBtn.disabled = true;
      return;
    }

    const resized = faceapi.resizeResults(detection, {
      width: canvas.width,
      height: canvas.height
    });

    const result = matcher.findBestMatch(detection.descriptor);

    ctx.lineWidth = 3;

    if (result.label === "unknown") {
      ctx.strokeStyle = "red";
      ctx.strokeRect(
        resized.detection.box.x,
        resized.detection.box.y,
        resized.detection.box.width,
        resized.detection.box.height
      );
      statusText.innerText = "⚠️ Unknown face";
      confirmBtn.disabled = true;
      return;
    }

    ctx.strokeStyle = "lime";
    ctx.strokeRect(
      resized.detection.box.x,
      resized.detection.box.y,
      resized.detection.box.width,
      resized.detection.box.height
    );

    const [name, roll] = result.label.split("_");
    nameText.innerText = name;
    rollText.innerText = roll;
    statusText.innerText = "✅ Face recognized";
    confirmBtn.disabled = false;

    currentMatch = { name, roll };
  }, 1200);
}

/* ================= SAVE ATTENDANCE ================= */

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

}
