import { useState, useEffect } from 'react';
import CellularAutomatonGrid from './components/CellularAutomatonGrid';
import './components/CellularAutomatonGrid.css';

// Elementary cellular automaton rule (e.g., Rule 30)
const applyRule = (left: boolean, center: boolean, right: boolean, rule: number): boolean => {
  const pattern = (left ? 4 : 0) + (center ? 2 : 0) + (right ? 1 : 0);
  return (rule >> pattern) & 1 ? true : false;
};

// Generate cellular automaton data
const generateCellularAutomaton = (
  width: number, 
  generations: number, 
  rule: number = 30
): boolean[][] => {
  const data: boolean[][] = [];
  
  // Initialize first generation with single center cell
  const firstGeneration = new Array(width).fill(false);
  firstGeneration[Math.floor(width / 2)] = true;
  data.push(firstGeneration);
  
  // Generate subsequent generations
  for (let gen = 1; gen < generations; gen++) {
    const newGeneration = new Array(width).fill(false);
    const prevGeneration = data[gen - 1];
    
    for (let i = 0; i < width; i++) {
      const left = prevGeneration[(i - 1 + width) % width];
      const center = prevGeneration[i];
      const right = prevGeneration[(i + 1) % width];
      
      newGeneration[i] = applyRule(left, center, right, rule);
    }
    
    data.push(newGeneration);
  }
  
  return data;
};

function App() {
  const [latticeWidth, setLatticeWidth] = useState(101);
  const [lightconeLength, setLightconeLength] = useState(50);
  const [cellSize, setCellSize] = useState(8);
  const [rule, setRule] = useState(30);
  const [data, setData] = useState<boolean[][]>([]);

  // Generate data when parameters change
  useEffect(() => {
    const newData = generateCellularAutomaton(latticeWidth, lightconeLength, rule);
    setData(newData);
  }, [latticeWidth, lightconeLength, rule]);

  return (
    <div className="App" style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Elementary Cellular Automaton
      </h1>
      
      {/* Temporary controls - will be replaced by slide-out menu */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <div>
          <label htmlFor="latticeWidth">Lattice Width: </label>
          <input
            id="latticeWidth"
            type="number"
            value={latticeWidth}
            onChange={(e) => setLatticeWidth(parseInt(e.target.value))}
            min="10"
            max="200"
            style={{ width: '80px' }}
          />
        </div>
        
        <div>
          <label htmlFor="lightconeLength">Generations: </label>
          <input
            id="lightconeLength"
            type="number"
            value={lightconeLength}
            onChange={(e) => setLightconeLength(parseInt(e.target.value))}
            min="10"
            max="100"
            style={{ width: '80px' }}
          />
        </div>
        
        <div>
          <label htmlFor="cellSize">Cell Size: </label>
          <input
            id="cellSize"
            type="number"
            value={cellSize}
            onChange={(e) => setCellSize(parseInt(e.target.value))}
            min="2"
            max="20"
            style={{ width: '80px' }}
          />
        </div>
        
        <div>
          <label htmlFor="rule">Rule: </label>
          <input
            id="rule"
            type="number"
            value={rule}
            onChange={(e) => setRule(parseInt(e.target.value))}
            min="0"
            max="255"
            style={{ width: '80px' }}
          />
        </div>
      </div>

      <CellularAutomatonGrid
        latticeWidth={latticeWidth}
        lightconeLength={lightconeLength}
        cellSize={cellSize}
        data={data}
        className="main-grid"
      />
      
      <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
        <p>Rule {rule} - {latticeWidth} cells × {lightconeLength} generations</p>
      </div>
    </div>
  );
}

export default App
