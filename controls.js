function initControls() {
  document.getElementById('steps-slider').addEventListener('input', (e) => {
    document.getElementById('steps-value').textContent = e.target.value;
  });

  document.getElementById('run-button').addEventListener('click', () => {
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
    const width = 101;
    const initial_state = createInitialState(width, initPattern);

    let history;
    if (mode === 'Binary') {
      history = evolveCABinary(initial_state, rule_map, steps, toroidal);
      drawCA(history, 'Binary');
      document.querySelector('.binary-legend').style.display = 'block';
      document.querySelector('.ruleindex-legend').style.display = 'none';
    } else {
      history = evolveCAAscending(initial_state, rule_map, steps, toroidal);
      drawCA(history, 'RuleIndex');
      document.querySelector('.binary-legend').style.display = 'none';
      document.querySelector('.ruleindex-legend').style.display = 'block';
    }
  });

  // Add fullscreen button handler
  document.getElementById('fullscreen-button').addEventListener('click', () => {
    enterFullscreenMode();
  });

  // Initialize fullscreen controls when they become available
  setTimeout(initFullscreenControls, 100);
}

function initFullscreenControls() {
  // Fullscreen steps slider
  const fsStepsSlider = document.getElementById('fs-steps-slider');
  if (fsStepsSlider) {
    fsStepsSlider.addEventListener('input', (e) => {
      document.getElementById('fs-steps-value').textContent = e.target.value;
    });
  }

  // Fullscreen run button
  const fsRunButton = document.getElementById('fs-run-button');
  if (fsRunButton) {
    fsRunButton.addEventListener('click', runFullscreenECA);
  }

  // Exit fullscreen button
  const exitButton = document.getElementById('exit-fullscreen-button');
  if (exitButton) {
    exitButton.addEventListener('click', exitFullscreenMode);
  }
}