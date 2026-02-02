window.onload = () => {
  console.log("✅ Page loaded");
  main();
};

async function main() {
  const video = document.getElementById("video");
  const startBtn = document.getElementById("startBtn");
  const statusText = document.getElementById("status");
  const timerText = document.getElementById("timer");
  const nameText = document.getElementById("name");
  const rollText = document.getElementById("roll");
  const confirmBtn = document.getElementById("confirmBtn");
  const attendanceBody = document.getElementById("attendanceBody");

  let scanTime = 0;
  let timerInterval;
  let faceDetected = false;

  console.log("🔄 Loading models...");

  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
    console.log("✅ Models loaded");
    statusText.innerText = "Status: Models loaded ✅";
  } catch (e) {
    console.error("❌ Model loading error", e);
    statusText.innerText = "❌ Model loading failed";
    return;
  }

  startBtn.onclick = async () => {
    console.log("▶ Start Camera clicked");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });

      video.srcObject = stream;
      await video.play();

      statusText.innerText = "Status: Camera started ✅";
      console.log("📷 Camera started");

      scanTime = 0;
      timerText.innerText = "Scanner Time: 0 sec";
      timerInterval = setInterval(() => {
        scanTime++;
        timerText.innerText = `Scanner Time: ${scanTime} sec`;
      }, 1000);

      detectFace();

    } catch (err) {
      console.error("❌ Camera error", err);
      alert("Camera permission denied");
    }
  };

  async function detectFace() {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight
    };

    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detection = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        faceDetected = true;
        statusText.innerText = "Status: Face detected ✅";
        confirmBtn.disabled = false;

        nameText.innerText = "Ayush";
        rollText.innerText = "72";

        const resized = faceapi.resizeResults(detection, displaySize);
        faceapi.draw.drawDetections(canvas, resized, {
          boxColor: "green",
          lineWidth: 3
        });

        console.log("🙂 Face detected");

      } else {
        faceDetected = false;
        statusText.innerText = "Status: No face ❌";
        confirmBtn.disabled = true;
      }

    }, 500);
  }

  confirmBtn.onclick = () => {
    if (!faceDetected) return;

    const now = new Date();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>ayush</td>
      <td>72</td>
      <td>${now.toLocaleDateString()}</td>
      <td>${now.toLocaleTimeString()}</td>
    `;

    attendanceBody.appendChild(row);
    confirmBtn.disabled = true;

    console.log("📝 Attendance saved");
  };
}
