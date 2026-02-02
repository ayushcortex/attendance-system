const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");

startBtn.addEventListener("click", async () => {
  try {
    console.log("Start camera clicked");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    video.srcObject = stream;
    statusText.innerText = "Camera started ✅";

  } catch (err) {
    alert("Camera permission denied ❌");
    console.error(err);
  }
});
