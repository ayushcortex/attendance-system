const video = document.getElementById("video");
const btn = document.getElementById("startCamBtn");
const msg = document.getElementById("msg");

btn.onclick = async () => {
  msg.innerText = "Requesting camera…";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();
      msg.innerText = "✅ Camera is working";
    };

  } catch (err) {
    console.error(err);
    msg.innerText = "❌ Camera blocked by browser or OS";
  }
};
