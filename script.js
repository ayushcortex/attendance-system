document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const video = document.getElementById("video");
  const status = document.getElementById("status");

  if (!startBtn) {
    console.error("Start button not found");
    return;
  }

  startBtn.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      status.innerText = "Camera started";
    } catch (err) {
      status.innerText = "Camera permission denied";
      console.error(err);
    }
  });
});
