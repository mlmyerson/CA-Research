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

// Canvas interaction state for fullscreen canvas
let fsCanvasState = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
  isInitialized: false
};

// Current data storage
let currentHistory = null;
let currentMode = 'Binary';

function drawCA(history, mode) {
  // Store current data for fullscreen use
  currentHistory = history;
  currentMode = mode;
  
  // Draw on normal canvas
  drawOnCanvas('ca-canvas', history, mode, false);
}

function drawOnCanvas(canvasId, history, mode, isFullscreen = false) {
  let steps = history.length;
  let width = history[0].length;
  const canvas = document.getElementById(canvasId);
  
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

  if (isFullscreen) {
    // For fullscreen, make it fit nicely but maintain aspect ratio
    const containerWidth = window.innerWidth - 40;
    const containerHeight = window.innerHeight - 120; // Account for menubar
    
    const scaleX = containerWidth / width;
    const scaleY = containerHeight / steps;
    const baseScale = Math.min(scaleX, scaleY, 8); // Cap at 8x for very small patterns
    
    canvas.style.width = (width * baseScale) + "px";
    canvas.style.height = (steps * baseScale) + "px";
    
    // Initialize fullscreen interactions if not already done
    if (!fsCanvasState.isInitialized) {
      initFullscreenCanvasInteractions();
      fsCanvasState.isInitialized = true;
    }
    
    // Reset transform state when new data is drawn
    resetFullscreenCanvasTransform();
  } else {
    // Normal canvas scaling
    const scaleFactor = 4;
    canvas.style.width = (width * scaleFactor) + "px";
    canvas.style.height = (steps * scaleFactor) + "px";
  }
}

function initFullscreenCanvasInteractions() {
  const canvas = document.getElementById('fs-ca-canvas');
  if (!canvas) return;
  
  // Mouse wheel zoom
  canvas.addEventListener('wheel', handleFullscreenMouseWheel, { passive: false });
  
  // Mouse drag pan
  canvas.addEventListener('mousedown', handleFullscreenMouseDown);
  canvas.addEventListener('mousemove', handleFullscreenMouseMove);
  canvas.addEventListener('mouseup', handleFullscreenMouseUp);
  canvas.addEventListener('mouseleave', handleFullscreenMouseUp);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleFullscreenKeyDown);
  
  // Prevent context menu on right click
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Make canvas focusable and focus it
  canvas.tabIndex = 0;
  canvas.style.cursor = 'grab';
}

function handleFullscreenMouseWheel(e) {
  e.preventDefault();
  
  const canvas = document.getElementById('fs-ca-canvas');
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.max(0.1, Math.min(10, fsCanvasState.scale * zoomFactor));
  
  if (newScale !== fsCanvasState.scale) {
    // Zoom towards mouse position
    fsCanvasState.offsetX = mouseX - (mouseX - fsCanvasState.offsetX) * (newScale / fsCanvasState.scale);
    fsCanvasState.offsetY = mouseY - (mouseY - fsCanvasState.offsetY) * (newScale / fsCanvasState.scale);
    fsCanvasState.scale = newScale;
    
    applyFullscreenCanvasTransform();
  }
}

function handleFullscreenMouseDown(e) {
  if (e.button === 0) { // Left mouse button
    fsCanvasState.isDragging = true;
    fsCanvasState.lastMouseX = e.clientX;
    fsCanvasState.lastMouseY = e.clientY;
    
    const canvas = document.getElementById('fs-ca-canvas');
    canvas.style.cursor = 'grabbing';
    
    // Add dragging class to container for CSS styling
    const container = document.getElementById('fs-canvas-container');
    if (container) {
      container.classList.add('canvas-dragging');
    }
  }
}

function handleFullscreenMouseMove(e) {
  if (fsCanvasState.isDragging) {
    const deltaX = e.clientX - fsCanvasState.lastMouseX;
    const deltaY = e.clientY - fsCanvasState.lastMouseY;
    
    fsCanvasState.offsetX += deltaX;
    fsCanvasState.offsetY += deltaY;
    fsCanvasState.lastMouseX = e.clientX;
    fsCanvasState.lastMouseY = e.clientY;
    
    applyFullscreenCanvasTransform();
  }
}

function handleFullscreenMouseUp(e) {
  fsCanvasState.isDragging = false;
  
  const canvas = document.getElementById('fs-ca-canvas');
  canvas.style.cursor = 'grab';
  
  // Remove dragging class from container
  const container = document.getElementById('fs-canvas-container');
  if (container) {
    container.classList.remove('canvas-dragging');
  }
}

function handleFullscreenKeyDown(e) {
  // Only handle keys when in fullscreen mode
  const fullscreenView = document.getElementById('fullscreen-view');
  if (!fullscreenView || fullscreenView.style.display === 'none') {
    return;
  }
  
  switch(e.key) {
    case 'Escape':
      e.preventDefault();
      exitFullscreenMode();
      break;
    case 'r':
    case 'R':
      e.preventDefault();
      resetFullscreenCanvasTransform();
      break;
    case '+':
    case '=':
      e.preventDefault();
      zoomFullscreenCanvas(1.2);
      break;
    case '-':
    case '_':
      e.preventDefault();
      zoomFullscreenCanvas(0.8);
      break;
    case '0':
      e.preventDefault();
      resetFullscreenCanvasTransform();
      break;
  }
}

function zoomFullscreenCanvas(factor) {
  const canvas = document.getElementById('fs-ca-canvas');
  const rect = canvas.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const newScale = Math.max(0.1, Math.min(10, fsCanvasState.scale * factor));
  
  if (newScale !== fsCanvasState.scale) {
    fsCanvasState.offsetX = centerX - (centerX - fsCanvasState.offsetX) * (newScale / fsCanvasState.scale);
    fsCanvasState.offsetY = centerY - (centerY - fsCanvasState.offsetY) * (newScale / fsCanvasState.scale);
    fsCanvasState.scale = newScale;
    
    applyFullscreenCanvasTransform();
  }
}

function applyFullscreenCanvasTransform() {
  const canvas = document.getElementById('fs-ca-canvas');
  canvas.style.transform = `translate(${fsCanvasState.offsetX}px, ${fsCanvasState.offsetY}px) scale(${fsCanvasState.scale})`;
  canvas.style.transformOrigin = '0 0';
}

function resetFullscreenCanvasTransform() {
  fsCanvasState.scale = 1;
  fsCanvasState.offsetX = 0;
  fsCanvasState.offsetY = 0;
  applyFullscreenCanvasTransform();
}

function enterFullscreenMode() {
  // Copy current control values to fullscreen controls
  copyControlsToFullscreen();
  
  // Show fullscreen view
  document.getElementById('normal-view').style.display = 'none';
  document.getElementById('fullscreen-view').style.display = 'flex';
  
  // If we have current data, draw it on the fullscreen canvas
  if (currentHistory) {
    drawOnCanvas('fs-ca-canvas', currentHistory, currentMode, true);
  }
  
  // Focus the canvas for keyboard controls
  setTimeout(() => {
    const canvas = document.getElementById('fs-ca-canvas');
    if (canvas) canvas.focus();
  }, 100);
}

function exitFullscreenMode() {
  document.getElementById('fullscreen-view').style.display = 'none';
  document.getElementById('normal-view').style.display = 'block';
}

function copyControlsToFullscreen() {
  // Copy values from normal controls to fullscreen controls
  const normalRule = document.getElementById('rule-input');
  const normalInitial = document.getElementById('initial-input');
  const normalMode = document.querySelector('input[name="mode"]:checked');
  const normalSteps = document.getElementById('steps-slider');
  const normalToroidal = document.getElementById('toroidal-checkbox');
  
  if (normalRule) document.getElementById('fs-rule-input').value = normalRule.value;
  if (normalInitial) document.getElementById('fs-initial-input').value = normalInitial.value;
  if (normalMode) {
    const fsMode = document.querySelector(`input[name="fs-mode"][value="${normalMode.value}"]`);
    if (fsMode) fsMode.checked = true;
  }
  if (normalSteps) {
    document.getElementById('fs-steps-slider').value = normalSteps.value;
    document.getElementById('fs-steps-value').textContent = normalSteps.value;
  }
  if (normalToroidal) document.getElementById('fs-toroidal-checkbox').checked = normalToroidal.checked;
}

function runFullscreenECA() {
  let ruleVal = document.getElementById('fs-rule-input').value.trim();
  let rule = parseInt(ruleVal, 10);
  if (isNaN(rule) || rule < 0 || rule > 255) {
    rule = 30; // default if invalid
  }

  const initPattern = document.getElementById('fs-initial-input').value.trim();
  const mode = document.querySelector('input[name="fs-mode"]:checked').value;
  const toroidal = document.getElementById('fs-toroidal-checkbox').checked; 
  const steps = parseInt(document.getElementById('fs-steps-slider').value, 10);

  const rule_map = generateAscendingRuleMap(rule);
  const width = 101;
  const initial_state = createInitialState(width, initPattern);

  let history;
  if (mode === 'Binary') {
    history = evolveCABinary(initial_state, rule_map, steps, toroidal);
  } else {
    history = evolveCAAscending(initial_state, rule_map, steps, toroidal);
  }
  
  currentHistory = history;
  currentMode = mode;
  
  drawOnCanvas('fs-ca-canvas', history, mode, true);
}