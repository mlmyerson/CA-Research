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
  className = ''
}: CellularAutomatonGridProps) => {
  // Calculate grid dimensions
  const gridWidth = latticeWidth * cellSize;
  const gridHeight = lightconeLength * cellSize;

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
          const isAlive = data[generation]?.[position] || false;
          return (
            <div
              key={`cell-${generation}-${position}`}
              className={`cell ${isAlive ? 'alive' : 'dead'}`}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: isAlive ? '#000' : '#fff',
                border: '0.5px solid #eee',
                transition: 'background-color 0.2s ease'
              }}
            />
          );
        })
      )}
    </div>
  );
};

export default CellularAutomatonGrid;
