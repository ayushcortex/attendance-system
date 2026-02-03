const verifyBtn = document.getElementById("verifyBtn");
const confirmBtn = document.getElementById("confirmBtn");
const video = document.getElementById("video");

const statusText = document.getElementById("status");
const nameText = document.getElementById("name");
const rollText = document.getElementById("roll");
const attendanceBody = document.getElementById("attendanceBody");

// Simple database
const users = {
  "ayush@gmail.com": { name: "Ayush", roll: "72" },
  "rahul@gmail.com": { name: "Rahul", roll: "15" }
};

verifyBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();

  if (!users[email]) {
    alert("Email not recognized");
    return;
  }

  // Show details
  nameText.innerText = users[email].name;
  rollText.innerText = users[email].roll;

  // Start camera
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    statusText.innerText = "Yes, face recognized ✅";
    confirmBtn.disabled = false;

  } catch (err) {
    alert("Camera permission denied");
  }
});

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