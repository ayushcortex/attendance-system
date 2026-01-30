const video = document.getElementById("video");
const startCamBtn = document.getElementById("startCamBtn");

startCamBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });
    video.srcObject = stream;
    await video.play();
    alert("Camera opened successfully ✅");
  } catch (err) {
    alert("Camera blocked ❌");
    console.error(err);
  }
};