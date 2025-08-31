import { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import {
  Typography,
  Box,
  TextField,
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
  mode: 'binary' | 'state' = 'binary',
  initialConditions: string = ''
): number[][] => {
  // Validate inputs to prevent crashes
  if (width < 3 || generations < 1 || rule < 0 || rule > 255) {
    console.warn('Invalid parameters for cellular automaton generation');
    return [];
  }
  
  const data: number[][] = [];
  
  // Initialize first generation
  const firstGeneration = new Array(width).fill(0);
  
  if (initialConditions.trim()) {
    // Parse initial conditions string
    const initString = initialConditions.trim();
    const centerOffset = Math.floor((width - initString.length) / 2);
    
    for (let i = 0; i < initString.length && i + centerOffset < width; i++) {
      const char = initString[i];
      const cellValue = parseInt(char) || 0;
      
      // Validate cell value based on mode
      if (mode === 'binary' && (cellValue === 0 || cellValue === 1)) {
        firstGeneration[centerOffset + i] = cellValue;
      } else if (mode === 'state' && cellValue >= 0 && cellValue <= 7) {
        firstGeneration[centerOffset + i] = cellValue;
      }
    }
  } else {
    // Default: single center cell
    firstGeneration[Math.floor(width / 2)] = 1;
  }
  
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
  const [initialConditions, setInitialConditions] = useState('');
  
  // Temporary input values for debouncing
  const [latticeWidthInput, setLatticeWidthInput] = useState('101');
  const [lightconeLengthInput, setLightconeLengthInput] = useState('50');
  const [ruleInput, setRuleInput] = useState('30');
  const [parametersExpanded, setParametersExpanded] = useState(true);
  const [generalExpanded, setGeneralExpanded] = useState(false);
  const [regexExpanded, setRegexExpanded] = useState(false);
  const [currentRegex, setCurrentRegex] = useState('');
  const [currentRegexName, setCurrentRegexName] = useState('');
  const [currentRegexColor, setCurrentRegexColor] = useState('#ff0000');
  const [savedRegexes, setSavedRegexes] = useState<{name: string, pattern: string, color: string}[]>([]);
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
    const newData = generateCellularAutomaton(latticeWidth, lightconeLength, rule, mode, initialConditions);
    setData(newData);
  }, [latticeWidth, lightconeLength, rule, mode, initialConditions]);

  // Debounced validation for lattice width
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = parseInt(latticeWidthInput);
      if (latticeWidthInput === '' || isNaN(value) || value < 3) {
        const correctedValue = 3;
        setLatticeWidth(correctedValue);
        setLatticeWidthInput(correctedValue.toString());
      } else if (value > 500) {
        const correctedValue = 500;
        setLatticeWidth(correctedValue);
        setLatticeWidthInput(correctedValue.toString());
      } else {
        setLatticeWidth(value);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [latticeWidthInput]);

  // Debounced validation for generations
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = parseInt(lightconeLengthInput);
      if (lightconeLengthInput === '' || isNaN(value) || value < 1) {
        const correctedValue = 1;
        setLightconeLength(correctedValue);
        setLightconeLengthInput(correctedValue.toString());
      } else if (value > 500) {
        const correctedValue = 500;
        setLightconeLength(correctedValue);
        setLightconeLengthInput(correctedValue.toString());
      } else {
        setLightconeLength(value);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [lightconeLengthInput]);

  // Debounced validation for rule
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = parseInt(ruleInput);
      if (ruleInput === '' || isNaN(value) || value < 0) {
        const correctedValue = 0;
        setRule(correctedValue);
        setRuleInput(correctedValue.toString());
      } else if (value > 255) {
        const correctedValue = 255;
        setRule(correctedValue);
        setRuleInput(correctedValue.toString());
      } else {
        setRule(value);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [ruleInput]);

  // Calculate optimal initial zoom to fit the image to the viewport
  useEffect(() => {
    const baseCellSize = 4;
    const imageWidth = latticeWidth * baseCellSize;
    const imageHeight = lightconeLength * baseCellSize;
    
    // Get full viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
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

  const resetToDefaults = () => {
    // Reset all parameters to default values
    setLatticeWidth(101);
    setLightconeLength(50);
    setLatticeWidthInput('101');
    setLightconeLengthInput('50');
    setRule(30);
    setRuleInput('30');
    setMode('binary');
    setDisplayMode('colors');
    setDarkMode(false);
    setInitialConditions('');
    
    // Reset binary colors to defaults
    setAliveColor('#000000');
    setDeadColor('#ffffff');
    
    // Reset state colors to defaults
    setStateColors([
      '#ffffff',  // 0 - white
      '#ff0000',  // 1 - red
      '#00ff00',  // 2 - green
      '#0000ff',  // 3 - blue
      '#ffff00',  // 4 - yellow
      '#ff00ff',  // 5 - magenta
      '#00ffff',  // 6 - cyan
      '#000000',  // 7 - black
    ]);
    
    // Reset zoom and pan
    setZoom(1);
    setPanX(0);
    setPanY(0);
    
    // Reset expanded states
    setBinaryColorsExpanded(false);
    setStateColorsExpanded(false);
    setParametersExpanded(true);
    setGeneralExpanded(false);
    setRegexExpanded(false);
    
    // Clear saved regexes
    setSavedRegexes([]);
    setCurrentRegex('');
    setCurrentRegexName('');
    setCurrentRegexColor('#ff0000');
  };

  const exportSettings = () => {
    const settings = {
      latticeWidth,
      lightconeLength,
      rule,
      mode,
      displayMode,
      darkMode,
      aliveColor,
      deadColor,
      stateColors,
      savedRegexes,
      currentRegexColor,
      initialConditions,
      zoom,
      panX,
      panY,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cellular-automaton-settings-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string);
          
          // Apply imported settings
          if (settings.latticeWidth !== undefined) {
            setLatticeWidth(settings.latticeWidth);
            setLatticeWidthInput(settings.latticeWidth.toString());
          }
          if (settings.lightconeLength !== undefined) {
            setLightconeLength(settings.lightconeLength);
            setLightconeLengthInput(settings.lightconeLength.toString());
          }
          if (settings.rule !== undefined) {
            setRule(settings.rule);
            setRuleInput(settings.rule.toString());
          }
          if (settings.mode !== undefined) setMode(settings.mode);
          if (settings.displayMode !== undefined) setDisplayMode(settings.displayMode);
          if (settings.darkMode !== undefined) setDarkMode(settings.darkMode);
          if (settings.aliveColor !== undefined) setAliveColor(settings.aliveColor);
          if (settings.deadColor !== undefined) setDeadColor(settings.deadColor);
          if (settings.stateColors !== undefined) setStateColors(settings.stateColors);
          if (settings.savedRegexes !== undefined) setSavedRegexes(settings.savedRegexes);
          if (settings.currentRegexColor !== undefined) setCurrentRegexColor(settings.currentRegexColor);
          if (settings.initialConditions !== undefined) setInitialConditions(settings.initialConditions);
          if (settings.zoom !== undefined) setZoom(settings.zoom);
          if (settings.panX !== undefined) setPanX(settings.panX);
          if (settings.panY !== undefined) setPanY(settings.panY);
          
        } catch (error) {
          alert('Error importing settings: Invalid JSON file');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const exportPNG = () => {
    if (!data.length) {
      alert('No cellular automaton data to export');
      return;
    }

    // Create a high-resolution canvas for export
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) {
      alert('Failed to create export canvas');
      return;
    }

    // High-quality settings
    const exportCellSize = 16; // Higher resolution for readable numbers
    const exportWidth = latticeWidth * exportCellSize;
    const exportHeight = lightconeLength * exportCellSize;
    
    // Set canvas size to full resolution
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = false; // Keep crisp edges for cellular automaton
    
    // Clear with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, exportWidth, exportHeight);

    // Helper function to get cell color
    const getExportCellColor = (value: number): string => {
      if (mode === 'binary') {
        return value === 0 ? deadColor : aliveColor;
      } else {
        return stateColors[value] || stateColors[0] || '#ffffff';
      }
    };

    // Draw each cell at high resolution
    for (let generation = 0; generation < lightconeLength; generation++) {
      for (let position = 0; position < latticeWidth; position++) {
        const cellValue = data[generation]?.[position] || 0;
        
        const x = position * exportCellSize;
        const y = generation * exportCellSize;
        
        if (displayMode === 'colors') {
          // Color mode: fill with colors
          const color = getExportCellColor(cellValue);
          ctx.fillStyle = color;
          ctx.fillRect(x, y, exportCellSize, exportCellSize);
        } else {
          // Numbers mode: fill with background and draw text
          ctx.fillStyle = darkMode ? '#1a1a1a' : '#f5f5f5';
          ctx.fillRect(x, y, exportCellSize, exportCellSize);
          
          // Draw border for grid effect
          ctx.strokeStyle = darkMode ? '#333333' : '#cccccc';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, exportCellSize, exportCellSize);
          
          // Draw number if cell has a non-zero value
          if (cellValue !== 0) {
            ctx.fillStyle = darkMode ? '#ffffff' : '#000000';
            const fontSize = Math.max(6, exportCellSize * 0.7); // Scale font with cell size
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
              cellValue.toString(),
              x + exportCellSize / 2,
              y + exportCellSize / 2
            );
          }
        }
      }
    }
    
    // Convert to blob and download
    exportCanvas.toBlob((blob) => {
      if (!blob) {
        alert('Failed to generate PNG');
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cellular-automaton-rule${rule}-${latticeWidth}x${lightconeLength}-${mode}-${displayMode}-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const saveRegex = () => {
    if (currentRegex.trim() && !savedRegexes.some(r => r.pattern === currentRegex.trim())) {
      const name = currentRegexName.trim() || `Pattern ${savedRegexes.length + 1}`;
      setSavedRegexes([...savedRegexes, { name, pattern: currentRegex.trim(), color: currentRegexColor }]);
      setCurrentRegex('');
      setCurrentRegexName('');
    }
  };

  const removeRegex = (regexToRemove: {name: string, pattern: string, color: string}) => {
    setSavedRegexes(savedRegexes.filter(regex => regex.pattern !== regexToRemove.pattern));
  };

  const updateRegexColor = (pattern: string, newColor: string) => {
    setSavedRegexes(savedRegexes.map(regex => 
      regex.pattern === pattern ? { ...regex, color: newColor } : regex
    ));
  };

  const updateRegexName = (pattern: string, newName: string) => {
    setSavedRegexes(savedRegexes.map(regex => 
      regex.pattern === pattern ? { ...regex, name: newName.trim() || 'Unnamed Pattern' } : regex
    ));
  };

  const generateRandomInitialConditions = () => {
    let randomPattern = '';
    for (let i = 0; i < latticeWidth; i++) {
      if (mode === 'binary') {
        randomPattern += Math.random() < 0.5 ? '0' : '1';
      } else {
        randomPattern += Math.floor(Math.random() * 8).toString();
      }
    }
    setInitialConditions(randomPattern);
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
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 4 }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              fullWidth
                              onClick={importSettings}
                              size="small"
                            >
                              Import
                            </Button>
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              fullWidth
                              onClick={exportSettings}
                              size="small"
                            >
                              Save
                            </Button>
                          </Grid>
                          <Grid size={{ xs: 4 }}>
                            <Button
                              variant="outlined"
                              color="secondary"
                              fullWidth
                              onClick={exportPNG}
                              size="small"
                            >
                              Export
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Button
                          variant="outlined"
                          color="warning"
                          fullWidth
                          onClick={resetToDefaults}
                          sx={{ mt: 2 }}
                        >
                          Reset to Defaults
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              </Collapse>
              
              <ListItemButton onClick={toggleParameters}>
                <ListItemText 
                  primary="Parameters" 
                  secondary={!parametersExpanded ? `Rule ${rule} • ${latticeWidth}×${lightconeLength} • ${mode}${initialConditions ? ' • Custom Init' : ''}` : undefined}
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
                          value={latticeWidthInput}
                          onChange={(e) => {
                            setLatticeWidthInput(e.target.value);
                          }}
                          inputProps={{ min: 3, max: 500 }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Generations"
                          type="number"
                          value={lightconeLengthInput}
                          onChange={(e) => {
                            setLightconeLengthInput(e.target.value);
                          }}
                          inputProps={{ min: 1, max: 500 }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Rule"
                          type="number"
                          value={ruleInput}
                          onChange={(e) => {
                            setRuleInput(e.target.value);
                          }}
                          inputProps={{ min: 0, max: 255 }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Initial Conditions"
                          value={initialConditions}
                          onChange={(e) => setInitialConditions(e.target.value)}
                          fullWidth
                          size="small"
                          placeholder={mode === 'binary' ? "e.g., 10110101" : "e.g., 12034567"}
                          helperText={mode === 'binary' 
                            ? "Enter 0s and 1s for initial pattern (empty = single center cell)" 
                            : "Enter digits 0-7 for initial pattern (empty = single center cell)"
                          }
                          inputProps={{ 
                            fontFamily: 'monospace',
                            pattern: mode === 'binary' ? '[01]*' : '[0-7]*'
                          }}
                          sx={{
                            '& input': {
                              fontFamily: 'monospace',
                              fontSize: '0.9rem'
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <Button
                          variant="outlined"
                          onClick={generateRandomInitialConditions}
                          fullWidth
                          size="small"
                          sx={{ mt: 1 }}
                        >
                          Generate Random Initial Conditions
                        </Button>
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
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Pattern Name (optional)"
                          value={currentRegexName}
                          onChange={(e) => setCurrentRegexName(e.target.value)}
                          fullWidth
                          size="small"
                          placeholder="e.g., Phone Number Pattern"
                          helperText="Give your pattern a descriptive name"
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
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
                      <Grid size={{ xs: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">Color</Typography>
                          <input
                            type="color"
                            value={currentRegexColor}
                            onChange={(e) => setCurrentRegexColor(e.target.value)}
                            style={{
                              width: '40px',
                              height: '40px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 3 }}>
                        <Button
                          variant="contained"
                          onClick={saveRegex}
                          disabled={!currentRegex.trim() || savedRegexes.some(r => r.pattern === currentRegex.trim())}
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
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            {savedRegexes.map((regex, index) => (
                              <Box key={index} sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: 2, 
                                p: 2, 
                                border: '1px solid',
                                borderColor: darkMode ? '#333' : '#ddd',
                                borderRadius: 1,
                                backgroundColor: darkMode ? '#1e1e1e' : '#f9f9f9'
                              }}>
                                {/* Name field */}
                                <TextField
                                  label="Pattern Name"
                                  value={regex.name}
                                  onChange={(e) => updateRegexName(regex.pattern, e.target.value)}
                                  fullWidth
                                  size="small"
                                  variant="outlined"
                                />
                                
                                {/* Pattern display and controls */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                      Pattern:
                                    </Typography>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontFamily: 'monospace',
                                        fontSize: '0.8rem',
                                        wordBreak: 'break-all',
                                        backgroundColor: darkMode ? '#333' : '#f0f0f0',
                                        padding: '4px 8px',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      {regex.pattern}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ minWidth: '40px' }}>Color:</Typography>
                                    <input
                                      type="color"
                                      value={regex.color}
                                      onChange={(e) => updateRegexColor(regex.pattern, e.target.value)}
                                      style={{
                                        width: '40px',
                                        height: '30px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    />
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                      {regex.color}
                                    </Typography>
                                  </Box>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    onClick={() => removeRegex(regex)}
                                    sx={{ minWidth: 'auto', px: 1 }}
                                  >
                                    ×
                                  </Button>
                                </Box>
                              </Box>
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
            savedRegexes={savedRegexes}
            className="main-grid"
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App
