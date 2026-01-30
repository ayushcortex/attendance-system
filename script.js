const video = document.getElementById("video");
const statusText = document.getElementById("status");

const students = [
  "rahul",
  "amit",
  "neha",
  "priya",
  "arjun"
];

// Load models
const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
]).then(() => {
  console.log("Models loaded");
});

// Camera
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}

// Load known faces
async function loadKnownFaces() {
  return Promise.all(
    students.map(async name => {
      const img = await faceapi.fetchImage(`known_faces/${name}.jpg`);
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      return new faceapi.LabeledFaceDescriptors(name, [detection.descriptor]);
    })
  );
}

// Eye check (liveness)
async function eyesDetected() {
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  if (!detection) return false;

  return (
    detection.landmarks.getLeftEye().length > 0 &&
    detection.landmarks.getRightEye().length > 0
  );
}

// Face match
async function recognize() {
  const labeledFaces = await loadKnownFaces();
  const matcher = new faceapi.FaceMatcher(labeledFaces, 0.5);

  const detection = await faceapi
    .detectSingleFace(video)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return false;

  const result = matcher.findBestMatch(detection.descriptor);
  return result.label !== "unknown";
}

// Buttons
document.getElementById("nextBtn").onclick = () => {
  document.getElementById("page1").style.display = "none";
  document.getElementById("page2").style.display = "block";
  startCamera();
};

document.getElementById("verifyBtn").onclick = async () => {
  statusText.innerText = "Checking liveness...";

  if (!(await eyesDetected())) {
    statusText.style.color = "red";
    statusText.innerText = "❌ Eyes not detected";
    return;
  }

  statusText.innerText = "Matching face...";

  if (await recognize()) {
    statusText.style.color = "green";
    statusText.innerText = "✅ Authorized – Attendance Marked";
  } else {
    statusText.style.color = "red";
    statusText.innerText = "❌ Face not recognized";
  }
};

document.getElementById("backBtn").onclick = () => {
  location.reload();
};