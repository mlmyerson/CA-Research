# Elementary Cellular Automaton Explorer 🔬

A quick-and-dirty web tool for exploring elementary cellular automata with regex pattern highlighting. This was whipped up as a free utility for researchers, students, and anyone curious about cellular automata - it's not a polished enterprise application, just a handy tool that does what it needs to do!

## 🚀 Live Demo

**Try it here:** [https://mlmyerson.github.io/CA-Research/](https://mlmyerson.github.io/CA-Research/)

## 🎯 What This App Does

- **Generate cellular automata** using any of the 256 elementary rules (Rule 30, Rule 110, etc.)
- **Highlight patterns** with regex - find and colorize specific sequences in the evolution
- **Export high-quality PNGs** with all your color customizations and pattern highlights
- **Mobile-friendly** interface that works on phones and tablets
- **Customize everything** - colors, initial conditions, grid size, and more

## 🛠️ Quick Start

### Run Locally
```bash
# Clone and install
git clone https://github.com/mlmyerson/CA-Research.git
cd CA-Research
npm install

# Start development server
npm run dev
# Open http://localhost:5173
```

### Build for Production
```bash
npm run build
# Output goes to ./dist folder
```

## 📱 How to Use

1. **Open the controls** - Click the hamburger menu (☰)
2. **Set your rule** - Try Rule 30 for chaos, Rule 110 for computation, or Rule 184 for traffic flow
3. **Adjust the grid** - Set width and number of generations
4. **Add regex patterns** - Find repeating sequences, gliders, or any pattern you want
5. **Export images** - Save high-res PNGs with all your customizations

### Example Regex Patterns
- `111` - Find three consecutive 1s
- `(10)+` - Find repeating "10" patterns  
- `1.*1` - Find sequences that start and end with 1
- `[1-7]{3,}` - Find 3+ consecutive non-zero states (state mode)

## 🎨 Features

- **Binary & State Modes** - Classic 0/1 or colorful state-based visualization
- **Regex Highlighting** - Pattern matching with custom colors
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode** - Easy on the eyes
- **Export to PNG** - High-resolution images with all colors preserved
- **Toroidal/Fixed Boundaries** - Choose edge behavior
- **Custom Initial Conditions** - Start with any pattern you want

## 🤷 Disclaimer

This is a quickly-built research tool, not production software. It might have rough edges, but it gets the job done! Feel free to fork it, fix bugs, or add features. The goal was to create something useful for the community, not to win any coding awards.

## 🔧 Tech Stack

- React + TypeScript for the UI
- Material-UI for components
- Vite for fast development
- Canvas API for rendering
- GitHub Pages for hosting

## 🐛 Found a Bug?

Open an issue! Or better yet, fork and fix it - this is a community tool after all.

## 📖 Learn More About Cellular Automata

- [Wolfram MathWorld - Elementary Cellular Automaton](https://mathworld.wolfram.com/ElementaryCellularAutomaton.html)
- [Wikipedia - Elementary Cellular Automaton](https://en.wikipedia.org/wiki/Elementary_cellular_automaton)
- [Stephen Wolfram - A New Kind of Science](https://www.wolframscience.com/)

---

*Built with ☕ and curiosity. Free for everyone to use and improve!*
```
