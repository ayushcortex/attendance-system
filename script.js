const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const statusText = document.getElementById("status");
const timerText = document.getElementById("timer");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const confirmBtn = document.getElementById("confirmBtn");
const attendanceBody = document.getElementById("attendanceBody");

let labeledDescriptors = [];
let faceMatcher;
let scanSeconds = 0;
let scanInterval;

// Load models
async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("./models");
}

// Load known faces
async function loadKnownFaces() {
  const students = [
    { name: "ayush", roll: "72" },
    { name: "Rahul", roll: "15" }
  ];

  for (const s of students) {
    const img = await faceapi.fetchImage(`./known_faces/${s.name}_${s.roll}.jpg`);
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    labeledDescriptors.push(
      new faceapi.LabeledFaceDescriptors(
        `${s.name}_${s.roll}`,
        [detection.descriptor]
      )
    );
  }

  faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
}

// Start camera
document.getElementById("startBtn").addEventListener("click", async () => {
  console.log("Start Camera clicked");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();
      statusText.innerText = "Camera started ✅";
      console.log("Camera stream running");
    };

  } catch (err) {
    console.error(err);
    alert("Camera permission denied or camera not available");
  }
});


// Face detection loop
async function detectLoop() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  setInterval(async () => {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!detection) {
      statusText.innerText = "No face ❌";
      confirmBtn.disabled = true;
      return;
    }

    const match = faceMatcher.findBestMatch(detection.descriptor);

    const box = detection.detection.box;
    ctx.strokeStyle = "green";
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    if (match.label === "unknown") {
      statusText.innerText = "Unknown face ❌";
      nameText.innerText = "---";
      rollText.innerText = "---";
      confirmBtn.disabled = true;
    } else {
      const [name, roll] = match.label.split("_");
      statusText.innerText = "Face recognized ✅";
      nameText.innerText = name;
      rollText.innerText = roll;
      confirmBtn.disabled = false;
    }
  }, 700);
}

// Save attendance
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
