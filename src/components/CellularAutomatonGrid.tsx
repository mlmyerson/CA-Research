import { Box, Paper } from '@mui/material';

interface CellularAutomatonGridProps {
  /** Width of the lattice (number of cells horizontally) */
  latticeWidth: number;
  /** Number of generations to display (lightcone length) */
  lightconeLength: number;
  /** Size of each cell in pixels */
  cellSize: number;
  /** The cellular automaton data - 2D array where [generation][position] */
  data: number[][];
  /** Display mode: 'binary' for 0/1 values, 'state' for 0-7 rule states */
  mode: 'binary' | 'state';
  /** Optional CSS class name */
  className?: string;
}

const CellularAutomatonGrid = ({
  latticeWidth,
  lightconeLength,
  cellSize,
  data,
  mode,
  className = ''
}: CellularAutomatonGridProps) => {
  // Calculate grid dimensions
  const gridWidth = latticeWidth * cellSize;
  const gridHeight = lightconeLength * cellSize;

  // Get cell color based on mode and value
  const getCellColor = (value: number): string => {
    if (mode === 'binary') {
      return value === 0 ? '#fff' : '#000';
    } else {
      // State mode: different colors for each rule (0-7)
      const stateColors = [
        '#fff',     // 0 - white
        '#ff0000',  // 1 - red
        '#00ff00',  // 2 - green
        '#0000ff',  // 3 - blue
        '#ffff00',  // 4 - yellow
        '#ff00ff',  // 5 - magenta
        '#00ffff',  // 6 - cyan
        '#000000',  // 7 - black
      ];
      return stateColors[value] || '#fff';
    }
  };

  // Get cell CSS class based on mode and value
  const getCellClass = (value: number): string => {
    if (mode === 'binary') {
      return value === 0 ? 'dead' : 'alive';
    } else {
      return `state-${value}`;
    }
  };

  return (
    <Paper 
      elevation={4}
      className={`cellular-automaton-grid ${className}`}
      sx={{
        width: gridWidth,
        height: gridHeight,
        display: 'grid',
        gridTemplateColumns: `repeat(${latticeWidth}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${lightconeLength}, ${cellSize}px)`,
        gap: 0,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}
    >
      {Array.from({ length: lightconeLength }, (_, generation) =>
        Array.from({ length: latticeWidth }, (_, position) => {
          const cellValue = data[generation]?.[position] || 0;
          return (
            <Box
              key={`cell-${generation}-${position}`}
              className={`cell ${getCellClass(cellValue)}`}
              sx={{
                width: cellSize,
                height: cellSize,
                backgroundColor: getCellColor(cellValue),
                border: '0.5px solid #f0f0f0',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                  transform: 'scale(1.05)',
                  zIndex: 1,
                  boxShadow: '0 0 4px rgba(0,0,0,0.3)'
                }
              }}
              title={mode === 'state' ? `Rule: ${cellValue}` : `Value: ${cellValue}`}
            />
          );
        })
      )}
    </Paper>
  );
};

export default CellularAutomatonGrid;
