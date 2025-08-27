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

// Canvas interaction state
let canvasState = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
  isInitialized: false
};

function drawCA(history, mode) {
  let steps = history.length;
  let width = history[0].length;
  const canvas = document.getElementById('ca-canvas');
  
  if (!canvas) return;
  
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

  // Smart canvas sizing - fit nicely but maintain aspect ratio
  const containerWidth = window.innerWidth - 40;
  const containerHeight = window.innerHeight - 120; // Account for menubar
  
  const scaleX = containerWidth / width;
  const scaleY = containerHeight / steps;
  const baseScale = Math.min(scaleX, scaleY, 8); // Cap at 8x for very small patterns
  
  canvas.style.width = (width * baseScale) + "px";
  canvas.style.height = (steps * baseScale) + "px";
  
  // Initialize canvas interactions if not already done
  if (!canvasState.isInitialized) {
    initCanvasInteractions();
    canvasState.isInitialized = true;
  }
  
  // Reset transform state when new data is drawn
  resetCanvasTransform();
}

function initCanvasInteractions() {
  const canvas = document.getElementById('ca-canvas');
  if (!canvas) return;
  
  // Mouse wheel zoom
  canvas.addEventListener('wheel', handleMouseWheel, { passive: false });
  
  // Mouse drag pan
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown);
  
  // Prevent context menu on right click
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Make canvas focusable and focus it
  canvas.tabIndex = 0;
  canvas.style.cursor = 'grab';
}

function handleMouseWheel(e) {
  e.preventDefault();
  
  const canvas = document.getElementById('ca-canvas');
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.max(0.1, Math.min(10, canvasState.scale * zoomFactor));
  
  if (newScale !== canvasState.scale) {
    // Zoom towards mouse position
    canvasState.offsetX = mouseX - (mouseX - canvasState.offsetX) * (newScale / canvasState.scale);
    canvasState.offsetY = mouseY - (mouseY - canvasState.offsetY) * (newScale / canvasState.scale);
    canvasState.scale = newScale;
    
    applyCanvasTransform();
  }
}

function handleMouseDown(e) {
  if (e.button === 0) { // Left mouse button
    canvasState.isDragging = true;
    canvasState.lastMouseX = e.clientX;
    canvasState.lastMouseY = e.clientY;
    
    const canvas = document.getElementById('ca-canvas');
    canvas.style.cursor = 'grabbing';
    
    // Add dragging class to container for CSS styling
    const container = document.getElementById('canvas-container');
    if (container) {
      container.classList.add('canvas-dragging');
    }
  }
}

function handleMouseMove(e) {
  if (canvasState.isDragging) {
    const deltaX = e.clientX - canvasState.lastMouseX;
    const deltaY = e.clientY - canvasState.lastMouseY;
    
    canvasState.offsetX += deltaX;
    canvasState.offsetY += deltaY;
    canvasState.lastMouseX = e.clientX;
    canvasState.lastMouseY = e.clientY;
    
    applyCanvasTransform();
  }
}

function handleMouseUp(e) {
  canvasState.isDragging = false;
  
  const canvas = document.getElementById('ca-canvas');
  canvas.style.cursor = 'grab';
  
  // Remove dragging class from container
  const container = document.getElementById('canvas-container');
  if (container) {
    container.classList.remove('canvas-dragging');
  }
}

function handleKeyDown(e) {
  switch(e.key) {
    case 'i':
    case 'I':
      e.preventDefault();
      toggleInfoModal();
      break;
    case 'r':
    case 'R':
      e.preventDefault();
      resetCanvasTransform();
      break;
    case '+':
    case '=':
      e.preventDefault();
      zoomCanvas(1.2);
      break;
    case '-':
    case '_':
      e.preventDefault();
      zoomCanvas(0.8);
      break;
    case '0':
      e.preventDefault();
      resetCanvasTransform();
      break;
    case 'Escape':
      e.preventDefault();
      closeInfoModal();
      break;
  }
}

function zoomCanvas(factor) {
  const canvas = document.getElementById('ca-canvas');
  const rect = canvas.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const newScale = Math.max(0.1, Math.min(10, canvasState.scale * factor));
  
  if (newScale !== canvasState.scale) {
    canvasState.offsetX = centerX - (centerX - canvasState.offsetX) * (newScale / canvasState.scale);
    canvasState.offsetY = centerY - (centerY - canvasState.offsetY) * (newScale / canvasState.scale);
    canvasState.scale = newScale;
    
    applyCanvasTransform();
  }
}

function applyCanvasTransform() {
  const canvas = document.getElementById('ca-canvas');
  canvas.style.transform = `translate(${canvasState.offsetX}px, ${canvasState.offsetY}px) scale(${canvasState.scale})`;
  canvas.style.transformOrigin = '0 0';
}

function resetCanvasTransform() {
  canvasState.scale = 1;
  canvasState.offsetX = 0;
  canvasState.offsetY = 0;
  applyCanvasTransform();
}

function toggleInfoModal() {
  const modal = document.getElementById('info-modal');
  if (modal.style.display === 'none') {
    modal.style.display = 'flex';
  } else {
    modal.style.display = 'none';
  }
}

function closeInfoModal() {
  const modal = document.getElementById('info-modal');
  modal.style.display = 'none';
}