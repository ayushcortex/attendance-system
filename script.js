const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const confirmBtn = document.getElementById("confirmBtn");
const statusText = document.getElementById("status");
const attendanceBody = document.getElementById("attendanceBody");

let faceMatcher;
let matchedName = null;

/* ---------- LOAD MODELS ---------- */
async function loadModels() {
  const MODEL_URL = "./models";

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ]);

  statusText.innerText = "Models loaded ✅";
}

loadModels();

/* ---------- LOAD MULTIPLE STUDENTS ---------- */
async function loadKnownFaces() {
  const students = ["ayush", "rahul", "aman", "neha"]; // 👈 ADD NAMES HERE

  const labeledDescriptors = [];

  for (const student of students) {
    const img = await faceapi.fetchImage(`./known_faces/${student}.jpg`);

    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      console.error(`No face found in ${student}.jpg`);
      continue;
    }

    labeledDescriptors.push(
      new faceapi.LabeledFaceDescriptors(student, [detection.descriptor])
    );
  }

  faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
}

/* ---------- START CAMERA ---------- */
startBtn.addEventListener("click", async () => {
  await loadKnownFaces();

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" }
  });

  video.srcObject = stream;

  video.onloadedmetadata = () => {
    video.play();
    statusText.innerText = "Camera started 📷";
    recognizeFace();
  };
});

/* ---------- FACE RECOGNITION ---------- */
async function recognizeFace() {
  setInterval(async () => {
    if (video.readyState !== 4) return;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      statusText.innerText = "❌ No face detected";
      confirmBtn.disabled = true;
      matchedName = null;
      return;
    }

    const result = faceMatcher.findBestMatch(detection.descriptor);

    if (result.label === "unknown") {
      statusText.innerText = "❌ Unauthorized face";
      confirmBtn.disabled = true;
      matchedName = null;
    } else {
      statusText.innerText = `✅ Verified: ${result.label}`;
      matchedName = result.label;
      confirmBtn.disabled = false;
    }
  }, 1200);
}

/* ---------- SAVE ATTENDANCE ---------- */
confirmBtn.addEventListener("click", () => {
  if (!matchedName) return;

  const now = new Date();

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${matchedName}</td>
    <td>${now.toLocaleDateString()}</td>
    <td>${now.toLocaleTimeString()}</td>
  `;

  attendanceBody.appendChild(row);
  confirmBtn.disabled = true;
});
