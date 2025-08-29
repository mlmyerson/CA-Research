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
    <div 
      className={`cellular-automaton-grid ${className}`}
      style={{
        width: gridWidth,
        height: gridHeight,
        display: 'grid',
        gridTemplateColumns: `repeat(${latticeWidth}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${lightconeLength}, ${cellSize}px)`,
        gap: 0,
        border: '1px solid #ccc',
        margin: '20px auto'
      }}
    >
      {Array.from({ length: lightconeLength }, (_, generation) =>
        Array.from({ length: latticeWidth }, (_, position) => {
          const cellValue = data[generation]?.[position] || 0;
          return (
            <div
              key={`cell-${generation}-${position}`}
              className={`cell ${getCellClass(cellValue)}`}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: getCellColor(cellValue),
                border: '0.5px solid #eee',
                transition: 'background-color 0.2s ease'
              }}
              title={mode === 'state' ? `Rule: ${cellValue}` : `Value: ${cellValue}`}
            />
          );
        })
      )}
    </div>
  );
};

export default CellularAutomatonGrid;
