const video = document.getElementById("video");
const startBtn = document.getElementById("startCamBtn");
const confirmBtn = document.getElementById("confirmBtn");
const statusText = document.getElementById("status");
const nameSpan = document.getElementById("name");
const rollSpan = document.getElementById("roll");
const tableBody = document.querySelector("#attendanceTable tbody");

const MODEL_URL = "./models";
const KNOWN_FACES_URL = "./known_faces";

let faceMatcher;
let currentUser = null;

async function loadModels() {
  statusText.innerText = "Loading models...";
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  statusText.innerText = "Models loaded";
}

async function loadKnownFaces() {
  const users = ["ayush_101"]; // add more if needed
  const descriptors = [];

  for (let user of users) {
    const img = await faceapi.fetchImage(`${KNOWN_FACES_URL}/${user}.jpg`);
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      descriptors.push(
        new faceapi.LabeledFaceDescriptors(user, [detection.descriptor])
      );
    }
  }

  faceMatcher = new faceapi.FaceMatcher(descriptors, 0.5);
}

startBtn.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

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

    const result = faceMatcher.findBestMatch(detection.descriptor);

    if (result.label === "unknown") {
      statusText.innerText = "❌ Face not recognized";
      confirmBtn.disabled = true;
      return;
    }

    const [name, roll] = result.label.split("_");
    nameSpan.innerText = name;
    rollSpan.innerText = roll;
    statusText.innerText = "✅ Face recognized";
    currentUser = { name, roll };
    confirmBtn.disabled = false;
  }, 1500);
});

confirmBtn.addEventListener("click", () => {
  if (!currentUser) return;

  const now = new Date();
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${currentUser.name}</td>
    <td>${currentUser.roll}</td>
    <td>${now.toLocaleDateString()}</td>
    <td>${now.toLocaleTimeString()}</td>
  `;
  tableBody.appendChild(row);
  confirmBtn.disabled = true;
});

(async () => {
  await loadModels();
  await loadKnownFaces();
})();