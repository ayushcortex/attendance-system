document.addEventListener("DOMContentLoaded", () => {

  const students = [
    { email: "student1@gmail.com", name: "Rahul", roll: "101" },
    { email: "student2@gmail.com", name: "Amit", roll: "102" },
    { email: "student3@gmail.com", name: "Neha", roll: "103" },
    { email: "student4@gmail.com", name: "Priya", roll: "104" },
    { email: "student5@gmail.com", name: "Arjun", roll: "105" }
  ];

  const nextBtn = document.getElementById("nextBtn");
  const verifyBtn = document.getElementById("verifyBtn");
  const backBtn = document.getElementById("backBtn");

  nextBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim().toLowerCase();
    if (!email) {
      alert("Enter email");
      return;
    }

    const user = students.find(s => s.email === email);
    if (!user) {
      alert("❌ Unauthorized email");
      return;
    }

    localStorage.setItem("email", email);
    document.getElementById("page1").style.display = "none";
    document.getElementById("page2").style.display = "block";
  });

  verifyBtn.addEventListener("click", () => {
    const email = localStorage.getItem("email");
    const name = document.getElementById("name").value.trim();
    const roll = document.getElementById("roll").value.trim();

    const user = students.find(s => s.email === email);

    if (!name || !roll) {
      alert("Enter name and roll");
      return;
    }

    if (
      user.name.toLowerCase() === name.toLowerCase() &&
      user.roll === roll
    ) {
      document.getElementById("status").style.color = "green";
      document.getElementById("status").innerText = "✔ Authorized";
    } else {
      document.getElementById("status").style.color = "red";
      document.getElementById("status").innerText = "❌ Unauthorized";
    }
  });

  backBtn.addEventListener("click", () => {
    document.getElementById("page2").style.display = "none";
    document.getElementById("page1").style.display = "block";
    document.getElementById("status").innerText = "";
  });

});