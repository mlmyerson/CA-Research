const binaryColors = [
  [255,255,255],
  [0,0,0]
];

const ruleIndexColors = {
  0: [255,255,255],
  1: [0,0,0],
  2: [255,0,0],
  3: [0,0,255],
  4: [0,128,0],
  5: [255,165,0],
  6: [128,0,128],
  7: [255,255,0]
};

function drawCA(history, mode) {
    let steps = history.length;
    let width = history[0].length;
    const canvas = document.getElementById('ca-canvas');
    canvas.width = width;
    canvas.height = steps;
    const ctx = canvas.getContext('2d');
    let imageData = ctx.createImageData(width, steps);
    let data = imageData.data;
  
    if (mode === 'Binary') {
      for (let y=0; y<steps; y++) {
        for (let x=0; x<width; x++) {
          let c = binaryColors[history[y][x]];
          let idx = (y*width + x)*4;
          data[idx] = c[0];
          data[idx+1] = c[1];
          data[idx+2] = c[2];
          data[idx+3] = 255;
        }
      }
    } else {
      for (let y=0; y<steps; y++) {
        for (let x=0; x<width; x++) {
          let c = ruleIndexColors[history[y][x]];
          let idx = (y*width + x)*4;
          data[idx] = c[0];
          data[idx+1] = c[1];
          data[idx+2] = c[2];
          data[idx+3] = 255;
        }
      }
    }
  
    ctx.putImageData(imageData, 0, 0);
  
    // Scale factor for a larger output
    const scaleFactor = 4;
    canvas.style.width = (width * scaleFactor) + "px";
    canvas.style.height = (steps * scaleFactor) + "px";
  }