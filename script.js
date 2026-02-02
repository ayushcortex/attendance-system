const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const confirmBtn = document.getElementById("confirmBtn");

const statusText = document.getElementById("status");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const attendanceBody = document.getElementById("attendanceBody");

let labeledDescriptors;
let currentMatch = null;

// 1️⃣ LOAD MODELS
async function loadModels() {
  statusText.innerText = "Loading models...";
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("./models");
  statusText.innerText = "Models loaded ✅";
}

// 2️⃣ LOAD KNOWN FACES
async function loadKnownFaces() {
  const students = [
    { name: "Ayush", roll: "72", img: "ayush_72.jpg" },
    { name: "Rahul", roll: "15", img: "rahul_15.jpg" },
    { name: "Aman", roll: "33", img: "aman_33.jpg" }
  ];

  return Promise.all(
    students.map(async (student) => {
      const img = await faceapi.fetchImage(`./known_faces/${student.img}`);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      return new faceapi.LabeledFaceDescriptors(
        `${student.name}|${student.roll}`,
        [detection.descriptor]
      );
    })
  );
}

// 3️⃣ START CAMERA
startBtn.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user", width: 640, height: 480 }
  });
  video.srcObject = stream;
  statusText.innerText = "Camera started ✅";
  setTimeout(startRecognition, 1500);
});

// 4️⃣ FACE RECOGNITION LOOP
async function startRecognition() {
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);

  setInterval(async () => {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      statusText.innerText = "❌ No face detected";
      confirmBtn.disabled = true;
      return;
    }

    const match = faceMatcher.findBestMatch(detection.descriptor);

    if (match.label === "unknown") {
      statusText.innerText = "❌ Face not recognized";
      confirmBtn.disabled = true;
      return;
    }

    const [name, roll] = match.label.split("|");
    currentMatch = { name, roll };

    statusText.innerText = "✅ Face recognized";
    nameText.innerText = name;
    rollText.innerText = roll;
    confirmBtn.disabled = false;
  }, 1200);
}

// 5️⃣ SAVE ATTENDANCE
confirmBtn.addEventListener("click", () => {
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
});

// INIT
(async () => {
  await loadModels();
  labeledDescriptors = await loadKnownFaces();
})();
