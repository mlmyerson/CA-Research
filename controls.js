function initControls() {
  // Steps slider
  document.getElementById('steps-slider').addEventListener('input', (e) => {
    document.getElementById('steps-value').textContent = e.target.value;
  });

  // Width slider
  document.getElementById('width-slider').addEventListener('input', (e) => {
    document.getElementById('width-value').textContent = e.target.value;
  });

  // Run button
  document.getElementById('run-button').addEventListener('click', runECA);
}

function runECA() {
  let ruleVal = document.getElementById('rule-input').value.trim();
  let rule = parseInt(ruleVal, 10);
  if (isNaN(rule) || rule < 0 || rule > 255) {
    rule = 30; // default if invalid
  }

  const initPattern = document.getElementById('initial-input').value.trim();
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const toroidal = document.getElementById('toroidal-checkbox').checked; 
  const steps = parseInt(document.getElementById('steps-slider').value, 10);

  const rule_map = generateAscendingRuleMap(rule);
  const width = parseInt(document.getElementById('width-slider').value, 10);
  const initial_state = createInitialState(width, initPattern);

  let history;
  if (mode === 'Binary') {
    history = evolveCABinary(initial_state, rule_map, steps, toroidal);
  } else {
    history = evolveCAAscending(initial_state, rule_map, steps, toroidal);
  }
  
  drawCA(history, mode);
}