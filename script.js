const verifyBtn = document.getElementById("verifyBtn");
const confirmBtn = document.getElementById("confirmBtn");
const video = document.getElementById("video");

const statusText = document.getElementById("status");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const attendanceBody = document.getElementById("attendanceBody");

let cameraStream = null;
let faceCheckInterval = null;

// Simple user database
const users = {
  "ayush@gmail.com": { name: "Ayush", roll: "72" },
  "vidyansh@gmail.com": { name: "Vidyansh", roll: "61" }
  "alok@gmail.com": { name: "Alok", roll: "71" }
};

verifyBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();

  if (!users[email]) {
    alert("Email not recognized");
    return;
  }

  nameText.innerText = users[email].name;
  rollText.innerText = users[email].roll;

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = cameraStream;

    statusText.innerText = "Camera started ⏳";
    confirmBtn.disabled = true;

    startFaceStatusCheck();

  } catch (err) {
    alert("Camera permission denied");
  }
});

// Fake face presence checker (safe demo logic)
function startFaceStatusCheck() {
  if (faceCheckInterval) clearInterval(faceCheckInterval);

  faceCheckInterval = setInterval(() => {
    if (
      video.readyState === 4 &&
      video.videoWidth > 0 &&
      video.videoHeight > 0
    ) {
      statusText.innerText = "Face recognized ✅";
      confirmBtn.disabled = false;
    } else {
      statusText.innerText = "No face detected ❌";
      confirmBtn.disabled = true;
    }
  }, 1000);
}

confirmBtn.addEventListener("click", () => {
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
});