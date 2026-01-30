const video = document.getElementById("video");
const btn = document.getElementById("startCamBtn");

btn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });
    video.srcObject = stream;
    await video.play();
    alert("Camera opened ✅");
  } catch (e) {
    alert("Camera blocked ❌");
    console.error(e);
  }
};
