const students = [
  { email: "ayush1@gmail.com", name: "ayush", roll: "72" },
  { email: "student2@gmail.com", name: "Amit", roll: "102" },
  { email: "student3@gmail.com", name: "Neha", roll: "103" },
  { email: "student4@gmail.com", name: "Priya", roll: "104" },
  { email: "student5@gmail.com", name: "Arjun", roll: "105" }
];

function goNext() {
  const email = document.getElementById("email").value.trim().toLowerCase();

  if (!email) {
    alert("Enter email");
    return;
  }

  const user = students.find(s => s.email.toLowerCase() === email);

  if (!user) {
    alert("❌ Unauthorized email");
    return;
  }

  localStorage.setItem("email", email);
  document.getElementById("page1").style.display = "none";
  document.getElementById("page2").style.display = "block";
}

function goBack() {
  document.getElementById("page2").style.display = "none";
  document.getElementById("page1").style.display = "block";
}

function verify() {
  const email = localStorage.getItem("email");
  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();

  const user = students.find(s => s.email.toLowerCase() === email);

  if (!name || !roll) {
    alert("Enter name and roll number");
    return;
  }

  if (user.name.toLowerCase() === name.toLowerCase() && user.roll === roll) {
    document.getElementById("status").style.color = "green";
    document.getElementById("status").innerText = "✔ Authorized";
  } else {
    document.getElementById("status").style.color = "red";
    document.getElementById("status").innerText = "❌ Unauthorized";
  }
}
