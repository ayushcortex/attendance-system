const video = document.getElementById("video");
const nameSpan = document.getElementById("name");
const rollSpan = document.getElementById("roll");
const statusText = document.getElementById("status");
const startCamBtn = document.getElementById("startCamBtn");
const confirmBtn = document.getElementById("confirmBtn");

// 🔹 Face database
const students = [
  { label: "rahul", name: "Rahul", roll: "101" },
  { label: "amit", name: "Amit", roll: "102" },
  { label: "neha", name: "Neha", roll: "103" },
  { label: "priya", name: "Priya", roll: "104" },
  { label: "arjun", name: "Arjun", roll: "105" }
];

// 🔹 Load models
const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
]).then(() => {
  statusText.innerText = "Models loaded. Tap Start Camera.";
});

// 🔹 Load known faces
async function loadKnownFaces() {
  return Promise.all(
    students.map(async s => {
      const img = await faceapi.fetchImage(`known_faces/${s.label}.jpg`);
      const det = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      return new faceapi.LabeledFaceDescriptors(
        s.label,
        [det.descriptor]
      );
    })
  );
}

// 🔹 Start camera ONLY on button click (iPhone rule)
startCamBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    startCamBtn.disabled = true;
    startCamBtn.innerText = "Camera Started";

    statusText.innerText = "Scanning face...";
    startRecognition();

  } catch (err) {
    alert("Camera permission denied");
    console.error(err);
  }
};

// 🔹 Face recognition loop
async function startRecognition() {
  const labeledFaces = await loadKnownFaces();
  const matcher = new faceapi.FaceMatcher(labeledFaces, 0.5);

  setInterval(async () => {
    const det = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!det) return;

    const result = matcher.findBestMatch(det.descriptor);

    if (result.label !== "unknown") {
      const student = students.find(s => s.label === result.label);

      nameSpan.innerText = student.name;
      rollSpan.innerText = student.roll;

      confirmBtn.disabled = false;
      statusText.innerText = "Face detected. Please confirm.";
    }
  }, 1200);
}

// 🔹 Final confirmation
confirmBtn.onclick = () => {
  statusText.style.color = "green";
  statusText.innerText = "✅ Authorized – Attendance Marked";
};