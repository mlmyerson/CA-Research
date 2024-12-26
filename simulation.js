function generateAscendingRuleMap(rule_number) {

    let rule_binary = rule_number.toString(2).padStart(8,'0');
    let rule_map = {};
    for (let i=0; i<8; i++) {
      let nb = ASCENDING_NEIGHBORHOODS[i];
      let bit_val = parseInt(rule_binary[7 - i], 10);
      rule_map[nb.join('')] = bit_val;
    }
    return rule_map;
  }
  
  function createInitialState(width, pattern) {
    let initial = new Array(width).fill(0);
    if (pattern && /^[01]+$/.test(pattern)) {
      let p_len = pattern.length;
      let start = Math.floor(width/2 - p_len/2);
      for (let i=0; i<p_len; i++) {
        initial[start+i] = parseInt(pattern[i],10);
      }
    } else {
      initial[Math.floor(width/2)] = 1;
    }
    return initial;
  }
  
  function getNeighborsBinary(line, toroidal) {
    let width = line.length;
    let left = new Array(width);
    let right = new Array(width);
  
    if (!toroidal) {
      for (let i = 0; i < width; i++) {
        left[i] = line[(i - 1 + width) % width];
        right[i] = line[(i + 1) % width];
      }
    } else {
      for (let i = 0; i < width; i++) {
        left[i] = (i - 1 >= 0) ? line[i - 1] : 0;
        right[i] = (i + 1 < width) ? line[i + 1] : 0;
      }
    }
  
    return { left, right };
  }
  
  function evolveCABinary(initial_state, rule_map, steps, toroidal) {
    let width = initial_state.length;
    let history = new Array(steps);
    history[0] = initial_state.slice();
    for (let t=1; t<steps; t++) {
      let prev = history[t-1];
      let { left, right } = getNeighborsBinary(prev, toroidal);
      let new_line = new Array(width);
      for (let i=0; i<width; i++) {
        let nb = [left[i], prev[i], right[i]];
        let a_idx = (nb[0]<<2)|(nb[1]<<1)|nb[2];
        let key = ASCENDING_NEIGHBORHOODS[a_idx].join('');
        new_line[i] = rule_map[key];
      }
      history[t] = new_line;
    }
    return history;
  }
  
  function evolveCAAscending(initial_state, rule_map, steps, toroidal) {
    let width = initial_state.length;
    let binary_states = new Array(steps);
    let ascending_history = new Array(steps);
  
    binary_states[0] = initial_state.slice();
    {
      let { left, right } = getNeighborsBinary(binary_states[0], toroidal);
      let line = new Array(width);
      for (let i=0; i<width; i++) {
        let nb = [left[i], binary_states[0][i], right[i]];
        let a_idx = (nb[0]<<2)|(nb[1]<<1)|nb[2];
        line[i] = a_idx;
      }
      ascending_history[0] = line;
    }
  
    for (let t=1; t<steps; t++) {
      let prev = binary_states[t-1];
      let { left, right } = getNeighborsBinary(prev, toroidal);
      let new_line = new Array(width);
      let asc_line = new Array(width);
      for (let i=0; i<width; i++) {
        let nb = [left[i], prev[i], right[i]];
        let a_idx = (nb[0]<<2)|(nb[1]<<1)|nb[2];
        let key = ASCENDING_NEIGHBORHOODS[a_idx].join('');
        new_line[i] = rule_map[key];
        asc_line[i] = a_idx;
      }
      binary_states[t] = new_line;
      ascending_history[t] = asc_line;
    }
    return ascending_history;
  }