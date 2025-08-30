import { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import {
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  Button,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
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
  const [rule, setRule] = useState(30);
  const [mode, setMode] = useState<'binary' | 'state'>('binary');
  const [displayMode, setDisplayMode] = useState<'colors' | 'numbers'>('colors');
  const [data, setData] = useState<number[][]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [parametersExpanded, setParametersExpanded] = useState(true);
  const [generalExpanded, setGeneralExpanded] = useState(false);
  const [regexExpanded, setRegexExpanded] = useState(false);
  const [currentRegex, setCurrentRegex] = useState('');
  const [savedRegexes, setSavedRegexes] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [binaryColorsExpanded, setBinaryColorsExpanded] = useState(false);
  const [aliveColor, setAliveColor] = useState('#000000');
  const [deadColor, setDeadColor] = useState('#ffffff');
  const [stateColorsExpanded, setStateColorsExpanded] = useState(false);
  const [stateColors, setStateColors] = useState([
    '#ffffff',  // 0 - white
    '#ff0000',  // 1 - red
    '#00ff00',  // 2 - green
    '#0000ff',  // 3 - blue
    '#ffff00',  // 4 - yellow
    '#ff00ff',  // 5 - magenta
    '#00ffff',  // 6 - cyan
    '#000000',  // 7 - black
  ]);
  
  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Generate data when parameters change
  useEffect(() => {
    const newData = generateCellularAutomaton(latticeWidth, lightconeLength, rule, mode);
    setData(newData);
  }, [latticeWidth, lightconeLength, rule, mode]);

  // Calculate optimal initial zoom to fit the image to the viewport
  useEffect(() => {
    const baseCellSize = 4;
    const imageWidth = latticeWidth * baseCellSize;
    const imageHeight = lightconeLength * baseCellSize;
    
    // Get viewport dimensions (subtract app bar height)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 64; // 64px for app bar
    
    // Calculate zoom to fit both dimensions
    const zoomToFitWidth = viewportWidth / imageWidth;
    const zoomToFitHeight = viewportHeight / imageHeight;
    
    // Use the smaller zoom to ensure the entire image fits
    let optimalZoom = Math.min(zoomToFitWidth, zoomToFitHeight);
    
    // If in numbers mode, ensure zoom is high enough to show text
    if (displayMode === 'numbers') {
      optimalZoom = Math.max(optimalZoom, 2); // Minimum zoom of 2 for numbers
    }
    
    setZoom(Math.max(0.1, optimalZoom)); // Minimum zoom of 0.1
    setPanX(0);
    setPanY(0);
  }, [latticeWidth, lightconeLength, displayMode]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleParameters = () => {
    setParametersExpanded(!parametersExpanded);
  };

  const toggleGeneral = () => {
    setGeneralExpanded(!generalExpanded);
  };

  const toggleRegex = () => {
    setRegexExpanded(!regexExpanded);
  };

  const toggleBinaryColors = () => {
    setBinaryColorsExpanded(!binaryColorsExpanded);
  };

  const toggleStateColors = () => {
    setStateColorsExpanded(!stateColorsExpanded);
  };

  const updateStateColor = (index: number, color: string) => {
    const newStateColors = [...stateColors];
    newStateColors[index] = color;
    setStateColors(newStateColors);
  };

  const saveRegex = () => {
    if (currentRegex.trim() && !savedRegexes.includes(currentRegex.trim())) {
      setSavedRegexes([...savedRegexes, currentRegex.trim()]);
      setCurrentRegex('');
    }
  };

  const removeRegex = (regexToRemove: string) => {
    setSavedRegexes(savedRegexes.filter(regex => regex !== regexToRemove));
  };

  // Create dynamic theme based on dark mode
  const dynamicTheme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#000000' : '#ffffff',
        paper: darkMode ? '#121212' : '#ffffff',
      },
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
        secondary: darkMode ? '#b0b0b0' : '#666666',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#000000' : '#1976d2',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? '#121212' : '#ffffff',
          },
        },
      },
    },
  }), [darkMode]);

  return (
    <ThemeProvider theme={dynamicTheme}>
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
              <ListItemButton onClick={toggleGeneral}>
                <ListItemText 
                  primary="General" 
                />
                {generalExpanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={generalExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={darkMode}
                              onChange={(e) => setDarkMode(e.target.checked)}
                              name="darkMode"
                            />
                          }
                          label="Dark Mode"
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={mode === 'state'}
                              onChange={(e) => setMode(e.target.checked ? 'state' : 'binary')}
                              name="colorMode"
                            />
                          }
                          label={mode === 'binary' ? 'Binary' : 'State'}
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={displayMode === 'numbers'}
                              onChange={(e) => setDisplayMode(e.target.checked ? 'numbers' : 'colors')}
                              name="displayMode"
                            />
                          }
                          label={displayMode === 'colors' ? 'Colors' : 'Numbers'}
                        />
                      </Grid>
                      
                      {mode === 'binary' && (
                        <Grid size={{ xs: 12 }}>
                          <ListItemButton onClick={toggleBinaryColors} sx={{ pl: 0, pr: 0 }}>
                            <ListItemText 
                              primary="Binary Colors"
                              secondary={!binaryColorsExpanded ? `Alive: ${aliveColor} • Dead: ${deadColor}` : undefined}
                            />
                            {binaryColorsExpanded ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>
                          <Collapse in={binaryColorsExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ minWidth: '40px' }}>Alive:</Typography>
                                    <input
                                      type="color"
                                      value={aliveColor}
                                      onChange={(e) => setAliveColor(e.target.value)}
                                      style={{
                                        width: '40px',
                                        height: '30px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    />
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                      {aliveColor}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ minWidth: '40px' }}>Dead:</Typography>
                                    <input
                                      type="color"
                                      value={deadColor}
                                      onChange={(e) => setDeadColor(e.target.value)}
                                      style={{
                                        width: '40px',
                                        height: '30px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    />
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                      {deadColor}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </Grid>
                      )}

                      {mode === 'state' && (
                        <Grid size={{ xs: 12 }}>
                          <ListItemButton onClick={toggleStateColors} sx={{ pl: 0, pr: 0 }}>
                            <ListItemText 
                              primary="State Colors"
                              secondary={!stateColorsExpanded ? `8 colors configured` : undefined}
                            />
                            {stateColorsExpanded ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>
                          <Collapse in={stateColorsExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                              <Grid container spacing={2}>
                                {stateColors.map((color, index) => (
                                  <Grid size={{ xs: 6 }} key={index}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body2" sx={{ minWidth: '20px' }}>
                                        {index}:
                                      </Typography>
                                      <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => updateStateColor(index, e.target.value)}
                                        style={{
                                          width: '40px',
                                          height: '30px',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer'
                                        }}
                                      />
                                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                        {color}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          </Collapse>
                        </Grid>
                      )}

                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Export"
                          value="PNG Image"
                          fullWidth
                          size="small"
                          disabled
                          helperText="Export functionality coming soon"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              </Collapse>
              
              <ListItemButton onClick={toggleParameters}>
                <ListItemText 
                  primary="Parameters" 
                  secondary={!parametersExpanded ? `Rule ${rule} • ${latticeWidth}×${lightconeLength} • ${mode}` : undefined}
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
              
              <ListItemButton onClick={toggleRegex}>
                <ListItemText 
                  primary="Regex" 
                />
                {regexExpanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={regexExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 8 }}>
                        <TextField
                          label="Enter Regex Pattern"
                          value={currentRegex}
                          onChange={(e) => setCurrentRegex(e.target.value)}
                          fullWidth
                          size="small"
                          placeholder="e.g., \\d{3}-\\d{2}-\\d{4}"
                          helperText="Enter a regular expression pattern"
                        />
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Button
                          variant="contained"
                          onClick={saveRegex}
                          disabled={!currentRegex.trim() || savedRegexes.includes(currentRegex.trim())}
                          fullWidth
                          size="small"
                          sx={{ height: '40px' }}
                        >
                          Save
                        </Button>
                      </Grid>
                      
                      {savedRegexes.length > 0 && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Saved Regex Patterns ({savedRegexes.length})
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {savedRegexes.map((regex, index) => (
                              <Chip
                                key={index}
                                label={regex}
                                onDelete={() => removeRegex(regex)}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                  maxWidth: '100%'
                                }}
                              />
                            ))}
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Box>
              </Collapse>
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, position: 'relative' }}>
          {/* Grid Section - Full Width and Height */}
          <CellularAutomatonGrid
            latticeWidth={latticeWidth}
            lightconeLength={lightconeLength}
            zoom={zoom}
            panX={panX}
            panY={panY}
            onZoom={setZoom}
            onPan={(x, y) => { setPanX(x); setPanY(y); }}
            data={data}
            mode={mode}
            displayMode={displayMode}
            darkMode={darkMode}
            aliveColor={aliveColor}
            deadColor={deadColor}
            stateColors={stateColors}
            className="main-grid"
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App
