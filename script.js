const btn = document.getElementById("startCamBtn");
const video = document.getElementById("video");

btn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });
    video.srcObject = stream;
    await video.play();
    console.log("Camera opened");
  } catch (e) {
    console.error("Camera error:", e);
    alert("Camera blocked by browser");
  }
};