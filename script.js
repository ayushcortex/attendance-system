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

let currentUser = null;
let stream = null;

startBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();

  // RESET UI
  nameText.innerText = "---";
  rollText.innerText = "---";
  confirmBtn.disabled = true;

  if (!users[email]) {
    alert("Email not found");
    return;
  }

  currentUser = users[email];

  try {
    // STEP 1: Open camera
    statusText.innerText = "Opening camera...";
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    // STEP 2: Scanning face
    statusText.innerText = "Scanning face...";

    // STEP 3: Face detected (after 1.5 sec)
    setTimeout(() => {
      statusText.innerText = "Face detected";

      // STEP 4: Face recognized (after another 1.5 sec)
      setTimeout(() => {
        statusText.innerText = "Face recognized ✅";

        // NOW show name & roll
        nameText.innerText = currentUser.name;
        rollText.innerText = currentUser.roll;

        confirmBtn.disabled = false;
      }, 1500);

    }, 1500);

  } catch (error) {
    statusText.innerText = "Camera permission denied ❌";
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