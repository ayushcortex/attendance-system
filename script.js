// ===== ELEMENTS =====
const video = document.getElementById("video");
const startCamBtn = document.getElementById("startCamBtn");
const confirmBtn = document.getElementById("confirmBtn");
const nameSpan = document.getElementById("name");
const rollSpan = document.getElementById("roll");
const statusText = document.getElementById("status");

// ===== STUDENTS =====
const students = [
  { label: "ayush", name: "Ayush", roll: "101" },
  { label: "amit", name: "Amit", roll: "102" },
  { label: "neha", name: "Neha", roll: "103" },
  { label: "priya", name: "Priya", roll: "104" },
  { label: "arjun", name: "Arjun", roll: "105" }
];

// ===== LOAD MODELS =====
const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
]).then(() => {
  statusText.innerText = "Models loaded. Click Start Camera.";
});

// ===== CAMERA (SAFE VERSION) =====
startCamBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
    };

    startCamBtn.disabled = true;
    startCamBtn.innerText = "Camera Started";

    startFaceRecognition();

  } catch (err) {
    console.error(err);
    alert("Camera blocked by browser/OS");
  }
});

// ===== LOAD KNOWN FACES =====
async function loadKnownFaces() {
  const labeled = [];

  for (const s of students) {
    const descriptors = [];

    for (let i = 1; i <= 3; i++) {
      const url = `known_faces/${s.label}/${i}.jpg`;

      try {
        const img = await faceapi.fetchImage(url);
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
  statusText.innerText = "Loading face data…";

  const knownFaces = await loadKnownFaces();
  const matcher = new faceapi.FaceMatcher(knownFaces);

  statusText.innerText = "Looking for face…";

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

    const distance = result.distance;
    const percent = Math.round((1 - distance) * 100);

    const student = students.find(s => s.label === result.label);

    nameSpan.innerText = student.name;
    rollSpan.innerText = student.roll;

    statusText.innerText = `Match: ${percent}%`;

    if (percent >= 65) {
      statusText.innerText = `✅ Match: ${percent}%`;
      confirmBtn.disabled = false;
    } else {
      confirmBtn.disabled = true;
    }

  }, 1000);
}
