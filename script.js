const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const confirmBtn = document.getElementById("confirmBtn");

const statusText = document.getElementById("status");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const attendanceBody = document.getElementById("attendanceBody");

// USER DATABASE
const users = {
  "ayush@gmail.com": { name: "Ayush", roll: "72" },
  "alok@gmail.com": { name: "Alok", roll: "15" },
  "vidyansh@gmail.com": { name: "Vidyansh", roll: "21" }
};

let stream = null;

// START CAMERA
startBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();

  if (!users[email]) {
    alert("Email not found");
    return;
  }

  nameText.innerText = users[email].name;
  rollText.innerText = users[email].roll;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    video.srcObject = stream;
    statusText.innerText = "Face recognized ✅";
    confirmBtn.disabled = false;

  } catch (error) {
    alert("Camera permission denied");
    statusText.innerText = "Camera error ❌";
  }
});

// SAVE ATTENDANCE
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