// ========= BASIC DOM =========
const video = document.getElementById("video");
const startCamBtn = document.getElementById("startCamBtn");
const statusText = document.getElementById("status");

// ========= SAFETY FLAGS =========
let cameraStarted = false;

// ========= CAMERA TEST =========
startCamBtn.onclick = async () => {
  if (cameraStarted) return; // prevent double start
  cameraStarted = true;

  statusText.innerText = "Requesting camera…";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();
      statusText.innerText = "✅ Camera opened successfully";
    };

  } catch (err) {
    console.error("Camera error:", err);
    statusText.innerText = "❌ Camera error (check console)";
  }
};
