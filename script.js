// ===== DOM =====
const video = document.getElementById("video");
const startCamBtn = document.getElementById("startCamBtn");
const statusText = document.getElementById("status");
const nameSpan = document.getElementById("name");
const rollSpan = document.getElementById("roll");
const confirmBtn = document.getElementById("confirmBtn");

let cameraStarted = false;

// ===== STUDENTS =====
const students = [
  { label: "ayush", name: "Ayush", roll: "72" },
  { label: "amit", name: "Amit", roll: "102" },
  { label: "neha", name: "Neha", roll: "103" },
  { label: "priya", name: "Priya", roll: "104" },
  { label: "arjun", name: "Arjun", roll: "105" }
];

// ===== START CAMERA FIRST =====
startCamBtn.onclick = async () => {
  if (cameraStarted) return;
  cameraStarted = true;

  statusText.innerText = "Requesting camera…";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;
    video.onloadedmetadata = () => video.play();

    statusText.innerText = "Camera started. Loading models…";
    loadModelsAndStartRecognition();

  } catch (err) {
    console.error(err);
    statusText.innerText = "❌ Camera error";
  }
};

// ===== LOAD FACE-API MODELS =====
async function loadModelsAndStartRecognition() {
  const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);

    statusText.innerText = "Models loaded. Looking for face…";
    startFaceRecognition();

  } catch (e) {
    console.error(e);
    statusText.innerText = "❌ Model loading error";
  }
}

// ===== LOAD KNOWN FACES =====
async function loadKnownFaces() {
  const labeled = [];

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
      labeled.push(
        new faceapi.LabeledFaceDescriptors(s.label, descriptors)
      );
    }
  }

  return labeled;
}

// ===== FACE RECOGNITION =====
async function startFaceRecognition() {
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

    const percent = Math.round((1 - result.distance) * 100);
    const student = students.find(s => s.label === result.label);

    nameSpan.innerText = student.name;
    rollSpan.innerText = student.roll;

    statusText.innerText = `Match: ${percent}%`;

    confirmBtn.disabled = percent < 65;
  }, 1000);
}
