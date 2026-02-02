const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const timerText = document.getElementById("timer");

let scanSeconds = 0;
let scanInterval = null;

async function loadModels() {
  console.log("Loading models...");
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
  console.log("Models loaded");
}

loadModels();

startBtn.addEventListener("click", async () => {
  console.log("Start Camera clicked");

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false
  });

  video.srcObject = stream;
  video.play();

  statusText.innerText = "Camera started ✅";

  video.addEventListener("play", startFaceDetection);
});

let labeledDescriptors = [];
const students = {
  ayush: "72",
  rahul: "45"
};

async function loadKnownFaces() {
  const labels = Object.keys(students);

  for (const label of labels) {
    const descriptions = [];

    for (let i = 1; i <= 2; i++) {
      const img = await faceapi.fetchImage(`./known_faces/${label}/${i}.jpg`);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        descriptions.push(detection.descriptor);
      }
    }

    labeledDescriptors.push(
      new faceapi.LabeledFaceDescriptors(label, descriptions)
    );
  }

  console.log("Known faces loaded");
}
