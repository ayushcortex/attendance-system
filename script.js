startCamBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });
    video.srcObject = stream;
    await video.play();
    alert("Camera opened ✅");
  } catch (e) {
    alert("Camera blocked ❌");
  }
};