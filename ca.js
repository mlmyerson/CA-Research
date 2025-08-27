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

// Simple zoom state
let zoomLevel = 1;

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
  
    // Set up mouse wheel zoom if not already done
    if (!canvas.hasZoomListener) {
      canvas.addEventListener('wheel', handleZoom, { passive: false });
      canvas.hasZoomListener = true;
    }
    
    // Apply current zoom and center the canvas
    applyZoom();
}

function handleZoom(e) {
  e.preventDefault();
  
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  zoomLevel = Math.max(0.1, Math.min(10, zoomLevel * zoomFactor));
  
  applyZoom();
}

function applyZoom() {
  const canvas = document.getElementById('ca-canvas');
  if (!canvas) return;
  
  // Fill the available screen space while maintaining aspect ratio, then apply zoom
  const containerWidth = window.innerWidth;
  const containerHeight = window.innerHeight - 60; // Account for menubar
  
  const scaleX = containerWidth / canvas.width;
  const scaleY = containerHeight / canvas.height;
  const baseScale = Math.min(scaleX, scaleY);
  
  const finalScale = baseScale * zoomLevel;
  
  canvas.style.width = (canvas.width * finalScale) + "px";
  canvas.style.height = (canvas.height * finalScale) + "px";
}