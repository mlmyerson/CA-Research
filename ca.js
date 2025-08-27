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

// Simple zoom and pan state
let zoomLevel = 1;
let isPanning = false;
let lastPanX = 0;
let lastPanY = 0;

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
  
    // Reset zoom level for new patterns
    zoomLevel = 1;
  
    // Set up mouse interactions if not already done
    if (!canvas.hasInteractions) {
      // Mouse wheel for zoom only
      canvas.addEventListener('wheel', handleZoom, { passive: false });
      
      // Mouse drag for panning
      canvas.addEventListener('mousedown', handlePanStart);
      canvas.addEventListener('mousemove', handlePanMove);
      canvas.addEventListener('mouseup', handlePanEnd);
      canvas.addEventListener('mouseleave', handlePanEnd);
      
      // Prevent context menu
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
      
      canvas.hasInteractions = true;
    }
    
    // Apply current zoom and center the canvas
    applyZoom();
}

function handleZoom(e) {
  e.preventDefault();
  
  const container = document.getElementById('canvas-container');
  const canvas = document.getElementById('ca-canvas');
  
  // Calculate the center of the current viewport before zoom
  const viewCenterX = (container.scrollLeft + container.clientWidth / 2) / canvas.offsetWidth;
  const viewCenterY = (container.scrollTop + container.clientHeight / 2) / canvas.offsetHeight;
  
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  const oldZoomLevel = zoomLevel;
  zoomLevel = Math.max(0.1, Math.min(10, zoomLevel * zoomFactor));
  
  applyZoom(viewCenterX, viewCenterY);
}

function applyZoom(centerX = 0.5, centerY = 0.5) {
  const canvas = document.getElementById('ca-canvas');
  const container = document.getElementById('canvas-container');
  if (!canvas || !container) return;
  
  // Get the container's available space
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  // Calculate base scale to fit the canvas in the container
  const scaleX = containerWidth / canvas.width;
  const scaleY = containerHeight / canvas.height;
  const baseScale = Math.min(scaleX, scaleY);
  
  // Apply zoom on top of base scale
  const finalScale = baseScale * zoomLevel;
  
  canvas.style.width = (canvas.width * finalScale) + "px";
  canvas.style.height = (canvas.height * finalScale) + "px";
  
  // Adjust scroll position to maintain the center point
  const newScrollLeft = (centerX * canvas.offsetWidth) - (containerWidth / 2);
  const newScrollTop = (centerY * canvas.offsetHeight) - (containerHeight / 2);
  
  container.scrollLeft = Math.max(0, newScrollLeft);
  container.scrollTop = Math.max(0, newScrollTop);
}

function handlePanStart(e) {
  if (e.button === 0) { // Left mouse button only
    isPanning = true;
    lastPanX = e.clientX;
    lastPanY = e.clientY;
    
    const canvas = document.getElementById('ca-canvas');
    canvas.style.cursor = 'grabbing';
    
    e.preventDefault();
  }
}

function handlePanMove(e) {
  if (!isPanning) return;
  
  const container = document.getElementById('canvas-container');
  const deltaX = e.clientX - lastPanX;
  const deltaY = e.clientY - lastPanY;
  
  // Pan by adjusting scroll position
  container.scrollLeft -= deltaX;
  container.scrollTop -= deltaY;
  
  lastPanX = e.clientX;
  lastPanY = e.clientY;
  
  e.preventDefault();
}

function handlePanEnd(e) {
  if (isPanning) {
    isPanning = false;
    
    const canvas = document.getElementById('ca-canvas');
    canvas.style.cursor = 'grab';
  }
}