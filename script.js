// --- Updated script.js snippet ---

async function loadLabeledImages() {
  // Add 'Ayush_72' to this list. 
  // The system will look for /labels/Ayush_72.jpg
  const labels = ['Ayush_72', 'Alice_101', 'Bob_102']; 
  
  return Promise.all(
    labels.map(async label => {
      try {
        const img = await faceapi.fetchImage(`/labels/${label}.jpg`);
        const detections = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        
        if (!detections) {
          throw new Error(`No face detected for ${label}`);
        }
        
        return new faceapi.LabeledFaceDescriptors(label, [detections.descriptor]);
      } catch (e) {
        console.error(e);
      }
    })
  );
}

// BONUS: Function to export the table to Excel/CSV
function downloadCSV() {
  let csv = 'Name,Roll Number,Date,Time\n';
  const rows = document.querySelectorAll("table tr");
  
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].querySelectorAll("td");
    const rowData = Array.from(cols).map(col => col.innerText).join(",");
    csv += rowData + '\n';
  }

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'attendance.csv');
  a.click();
}