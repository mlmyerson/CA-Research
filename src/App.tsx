import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import {
  Container,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Chip,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
  Collapse,
  List,
  ListItemButton,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { theme } from './theme';
import CellularAutomatonGrid from './components/CellularAutomatonGrid';
import './components/CellularAutomatonGrid.css';

// Elementary cellular automaton rule (e.g., Rule 30)
const applyRule = (left: number, center: number, right: number, rule: number): number => {
  const pattern = (left ? 4 : 0) + (center ? 2 : 0) + (right ? 1 : 0);
  return (rule >> pattern) & 1 ? 1 : 0;
};

// Apply rule and return which rule pattern was used (for state mode)
const applyRuleWithState = (left: number, center: number, right: number, rule: number): number => {
  const pattern = (left ? 4 : 0) + (center ? 2 : 0) + (right ? 1 : 0);
  const result = (rule >> pattern) & 1;
  return result ? pattern : 0; // Return the pattern number if cell becomes alive
};

// Generate cellular automaton data
const generateCellularAutomaton = (
  width: number, 
  generations: number, 
  rule: number = 30,
  mode: 'binary' | 'state' = 'binary'
): number[][] => {
  const data: number[][] = [];
  
  // Initialize first generation with single center cell
  const firstGeneration = new Array(width).fill(0);
  firstGeneration[Math.floor(width / 2)] = 1;
  data.push(firstGeneration);
  
  // Generate subsequent generations
  for (let gen = 1; gen < generations; gen++) {
    const newGeneration = new Array(width).fill(0);
    const prevGeneration = data[gen - 1];
    
    for (let i = 0; i < width; i++) {
      const left = prevGeneration[(i - 1 + width) % width];
      const center = prevGeneration[i];
      const right = prevGeneration[(i + 1) % width];
      
      if (mode === 'binary') {
        newGeneration[i] = applyRule(left, center, right, rule);
      } else {
        newGeneration[i] = applyRuleWithState(left, center, right, rule);
      }
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
  const [mode, setMode] = useState<'binary' | 'state'>('binary');
  const [data, setData] = useState<number[][]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [parametersExpanded, setParametersExpanded] = useState(true);

  // Generate data when parameters change
  useEffect(() => {
    const newData = generateCellularAutomaton(latticeWidth, lightconeLength, rule, mode);
    setData(newData);
  }, [latticeWidth, lightconeLength, rule, mode]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleParameters = () => {
    setParametersExpanded(!parametersExpanded);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* App Bar */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Elementary Cellular Automaton
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 400,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} pb={0}>
              <Typography variant="h6">Controls</Typography>
              <IconButton onClick={toggleDrawer}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <List>
              <ListItemButton onClick={toggleParameters}>
                <ListItemText 
                  primary="Parameters" 
                  secondary={!parametersExpanded ? `Rule ${rule} • ${latticeWidth}×${lightconeLength} • ${cellSize}px • ${mode}` : undefined}
                />
                {parametersExpanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={parametersExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Lattice Width"
                          type="number"
                          value={latticeWidth}
                          onChange={(e) => setLatticeWidth(parseInt(e.target.value))}
                          inputProps={{ min: 10, max: 200 }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Generations"
                          type="number"
                          value={lightconeLength}
                          onChange={(e) => setLightconeLength(parseInt(e.target.value))}
                          inputProps={{ min: 10, max: 100 }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Cell Size"
                          type="number"
                          value={cellSize}
                          onChange={(e) => setCellSize(parseInt(e.target.value))}
                          inputProps={{ min: 2, max: 20 }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Rule"
                          type="number"
                          value={rule}
                          onChange={(e) => setRule(parseInt(e.target.value))}
                          inputProps={{ min: 0, max: 255 }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Mode</InputLabel>
                          <Select
                            value={mode}
                            label="Mode"
                            onChange={(e) => setMode(e.target.value as 'binary' | 'state')}
                          >
                            <MenuItem value="binary">Binary</MenuItem>
                            <MenuItem value="state">State</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              </Collapse>
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Grid Section */}
            <Box display="flex" justifyContent="center" mb={3}>
              <CellularAutomatonGrid
                latticeWidth={latticeWidth}
                lightconeLength={lightconeLength}
                cellSize={cellSize}
                data={data}
                mode={mode}
                className="main-grid"
              />
            </Box>
            
            {/* Status Section */}
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Rule {rule} - {latticeWidth} cells × {lightconeLength} generations
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={1}>
                <Chip 
                  label={`${mode} mode`} 
                  color={mode === 'binary' ? 'primary' : 'secondary'} 
                  size="small" 
                />
              </Box>
              {mode === 'state' && (
                <Box mt={2}>
                  <Typography variant="caption" display="block" gutterBottom>
                    State Colors:
                  </Typography>
                  <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
                    {[
                      { state: 0, color: '#fff', label: 'White' },
                      { state: 1, color: '#ff0000', label: 'Red' },
                      { state: 2, color: '#00ff00', label: 'Green' },
                      { state: 3, color: '#0000ff', label: 'Blue' },
                      { state: 4, color: '#ffff00', label: 'Yellow' },
                      { state: 5, color: '#ff00ff', label: 'Magenta' },
                      { state: 6, color: '#00ffff', label: 'Cyan' },
                      { state: 7, color: '#000000', label: 'Black' },
                    ].map(({ state, color, label }) => (
                      <Chip
                        key={state}
                        label={`${state}: ${label}`}
                        size="small"
                        sx={{
                          bgcolor: color,
                          color: color === '#fff' || color === '#ffff00' || color === '#00ffff' ? '#000' : '#fff',
                          border: color === '#fff' ? '1px solid #ccc' : 'none'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App
