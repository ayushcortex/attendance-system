let video = document.getElementById("video");

/* ✅ ALLOWED STUDENTS (MASTER LIST) */
const allowedStudents = [
  { email: "student1@gmail.com", name: "Rahul", roll: "101" },
  { email: "student2@gmail.com", name: "Amit",  roll: "102" },
  { email: "student3@gmail.com", name: "Neha",  roll: "103" },
  { email: "student4@gmail.com", name: "Priya", roll: "104" },
  { email: "student5@gmail.com", name: "Arjun", roll: "105" }
];

/* PAGE 1 → PAGE 2 */
function goNext() {
  const email = document.getElementById("email").value.trim().toLowerCase();

  if (!email) {
    alert("Please enter email");
    return;
  }

  // store entered email (even if wrong)
  localStorage.setItem("enteredEmail", email);

  const student = allowedStudents.find(
    s => s.email.toLowerCase() === email
  );

  if (!student) {
    localStorage.setItem("authStatus", "unauthorized");
    alert("❌ Unauthorized email");
    return;
  }

  localStorage.setItem("authStatus", "email_verified");
  document.getElementById("page1").style.display = "none";
  document.getElementById("page2").style.display = "block";
}

/* BACK */
function goBack() {
  document.getElementById("page2").style.display = "none";
  document.getElementById("page1").style.display = "block";

  if (video.srcObject) {
    video.srcObject.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }
}

/* CAMERA */
function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(() => alert("Camera access denied"));
}

/* NAME + ROLL CHECK + STORE */
function capture() {
  const email = localStorage.getItem("enteredEmail");
  const name  = document.getElementById("name").value.trim();
  const roll  = document.getElementById("roll").value.trim();

  // store entered values (even if wrong)
  localStorage.setItem("enteredName", name);
  localStorage.setItem("enteredRoll", roll);

  if (!name || !roll) {
    alert("Enter Name and Roll Number");
    return;
  }

  const student = allowedStudents.find(
    s => s.email.toLowerCase() === email
  );

  if (!student) {
    localStorage.setItem("authStatus", "unauthorized");
    alert("❌ Unauthorized student");
    return;
  }

  if (
    student.name.toLowerCase() !== name.toLowerCase() ||
    student.roll !== roll
  ) {
    localStorage.setItem("authStatus", "unauthorized");
    alert("❌ Name or Roll Number incorrect");
    return;
  }

  if (!video.srcObject) {
    alert("Camera not started");
    return;
  }

  // fully authorized
  localStorage.setItem("authStatus", "authorized");
  localStorage.setItem("verifiedName", name);
  localStorage.setItem("verifiedRoll", roll);

  document.getElementById("status").innerText =
    "✔ Authorized: Email, Name & Roll verified";
}
