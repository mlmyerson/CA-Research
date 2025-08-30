import { Box } from '@mui/material';
import { useState, useRef, useCallback, useEffect } from 'react';

interface CellularAutomatonGridProps {
  /** Width of the lattice (number of cells horizontally) */
  latticeWidth: number;
  /** Number of generations to display (lightcone length) */
  lightconeLength: number;
  /** Zoom level (1 = normal, 2 = 2x zoom, etc.) */
  zoom: number;
  /** Pan offset X */
  panX: number;
  /** Pan offset Y */
  panY: number;
  /** Callback when zoom changes */
  onZoom: (zoom: number) => void;
  /** Callback when pan changes */
  onPan: (x: number, y: number) => void;
  /** The cellular automaton data - 2D array where [generation][position] */
  data: number[][];
  /** Display mode: 'binary' for 0/1 values, 'state' for 0-7 rule states */
  mode: 'binary' | 'state';
  /** Display type: 'colors' for colored cells, 'numbers' for text numbers */
  displayMode: 'colors' | 'numbers';
  /** Dark mode for dark theme */
  darkMode: boolean;
  /** Color for alive cells in binary mode */
  aliveColor: string;
  /** Color for dead cells in binary mode */
  deadColor: string;
  /** Colors for state mode (array of 8 colors for states 0-7) */
  stateColors: string[];
  /** Optional CSS class name */
  className?: string;
}

const CellularAutomatonGrid = ({
  latticeWidth,
  lightconeLength,
  zoom,
  panX,
  panY,
  onZoom,
  onPan,
  data,
  mode,
  displayMode,
  darkMode,
  aliveColor,
  deadColor,
  stateColors,
  className = ''
}: CellularAutomatonGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Base cell size for the source image
  const baseCellSize = 4;
  
  // Get cell color based on mode and value
  const getCellColor = (value: number): string => {
    if (mode === 'binary') {
      return value === 0 ? deadColor : aliveColor;
    } else {
      // State mode: use custom colors from stateColors array
      return stateColors[value] || stateColors[0] || '#ffffff';
    }
  };

  // Draw the cellular automaton to canvas
  const drawToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to container size
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas with proper dark mode background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scaled dimensions
    const scaledCellSize = baseCellSize * zoom;
    const scaledWidth = latticeWidth * scaledCellSize;
    const scaledHeight = lightconeLength * scaledCellSize;

    // Calculate bounds for panning (keep image within viewport)
    const maxPanX = Math.max(0, scaledWidth - canvas.width);
    const maxPanY = Math.max(0, scaledHeight - canvas.height);
    const minPanX = Math.min(0, canvas.width - scaledWidth);
    const minPanY = Math.min(0, canvas.height - scaledHeight);

    // Constrain pan values to bounds
    const constrainedPanX = Math.max(minPanX, Math.min(maxPanX, panX));
    const constrainedPanY = Math.max(minPanY, Math.min(maxPanY, panY));

    // If pan values were constrained, update them
    if (constrainedPanX !== panX || constrainedPanY !== panY) {
      onPan(constrainedPanX, constrainedPanY);
    }

    // Position the image (center it if smaller than canvas, or use constrained pan offset)
    const offsetX = scaledWidth <= canvas.width ? (canvas.width - scaledWidth) / 2 : -constrainedPanX;
    const offsetY = scaledHeight <= canvas.height ? (canvas.height - scaledHeight) / 2 : -constrainedPanY;

    // Draw each cell
    for (let generation = 0; generation < lightconeLength; generation++) {
      for (let position = 0; position < latticeWidth; position++) {
        const cellValue = data[generation]?.[position] || 0;
        
        const x = offsetX + position * scaledCellSize;
        const y = offsetY + generation * scaledCellSize;
        
        // Only draw cells that are visible
        if (x + scaledCellSize >= 0 && x <= canvas.width && 
            y + scaledCellSize >= 0 && y <= canvas.height) {
          
          if (displayMode === 'colors') {
            // Color mode: fill with colors
            const color = getCellColor(cellValue);
            ctx.fillStyle = color;
            ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
          } else {
            // Numbers mode: fill with background and draw text
            ctx.fillStyle = darkMode ? '#1a1a1a' : '#f5f5f5';
            ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
            
            // Draw border for grid effect
            ctx.strokeStyle = darkMode ? '#333333' : '#cccccc';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, scaledCellSize, scaledCellSize);
            
            // Draw number if cell is large enough and has a value
            if (scaledCellSize >= 4) { // Very small minimum for debugging
              ctx.fillStyle = darkMode ? '#ffffff' : '#000000';
              const fontSize = Math.max(8, Math.min(scaledCellSize * 0.8, 32)); // Larger font
              ctx.font = `${fontSize}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              // Only show non-zero values for both binary and state modes
              if (cellValue !== 0) {
                ctx.fillText(
                  cellValue.toString(),
                  x + scaledCellSize / 2,
                  y + scaledCellSize / 2
                );
              }
            }
          }
        }
      }
    }
  }, [data, latticeWidth, lightconeLength, zoom, panX, panY, mode, displayMode, darkMode, aliveColor, deadColor, stateColors, baseCellSize, getCellColor, onPan]);

  // Redraw when data or view parameters change
  useEffect(() => {
    drawToCanvas();
  }, [drawToCanvas]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      drawToCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawToCanvas]);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const zoomFactor = 0.1;
    const newZoom = Math.max(0.25, Math.min(8, zoom + (e.deltaY > 0 ? -zoomFactor : zoomFactor)));
    
    // Reset pan when changing zoom to prevent the image from getting lost
    if (newZoom !== zoom) {
      onZoom(newZoom);
      // Reset pan to center when zoom changes significantly
      if (Math.abs(newZoom - zoom) > 0.5) {
        onPan(0, 0);
      }
    }
  }, [zoom, onZoom, onPan]);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX + panX, y: e.clientY + panY });
  }, [panX, panY]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate new pan values (reversed for natural dragging feel)
    const newPanX = dragStart.x - e.clientX;
    const newPanY = dragStart.y - e.clientY;

    // Calculate scaled dimensions for bounds checking
    const scaledCellSize = baseCellSize * zoom;
    const scaledWidth = latticeWidth * scaledCellSize;
    const scaledHeight = lightconeLength * scaledCellSize;

    // Calculate bounds
    const maxPanX = Math.max(0, scaledWidth - canvas.width);
    const maxPanY = Math.max(0, scaledHeight - canvas.height);
    const minPanX = Math.min(0, canvas.width - scaledWidth);
    const minPanY = Math.min(0, canvas.height - scaledHeight);

    // Constrain pan to bounds
    const constrainedPanX = Math.max(minPanX, Math.min(maxPanX, newPanX));
    const constrainedPanY = Math.max(minPanY, Math.min(maxPanY, newPanY));

    onPan(constrainedPanX, constrainedPanY);
  }, [isDragging, dragStart, zoom, latticeWidth, lightconeLength, baseCellSize, onPan]);

  // Handle mouse up
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Handle mouse enter - prevent page scrolling
  const handleMouseEnter = useCallback(() => {
    // Disable page scrolling when mouse is over the component
    document.body.style.overflow = 'hidden';
  }, []);

  // Handle mouse leave - restore page scrolling
  const handleMouseLeave = useCallback(() => {
    // Re-enable page scrolling when mouse leaves the component
    document.body.style.overflow = 'auto';
    setIsDragging(false);
  }, []);

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: 0
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </Box>
  );
};

export default CellularAutomatonGrid;
