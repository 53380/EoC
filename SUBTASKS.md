# Suggested Codex Subtasks for Echo of Cayael

Below are three enhancements that could be implemented using the Codex agent.
Each suggestion references the current repository to show where work might start.

## 1. Add Save/Load Functionality
The global `state` object in `game.js` manages scene, player stats, and inventory:
```
// Game state
const state = {
  scene: 'start',
  health: 100,
  fatigue: 0,
  honor: 50,
  inventory: ['Fallen Comrade\'s Mask', 'Infantry Blade', 'Meager Rations'],
  flags: {
    combatTutorialComplete: false,
    echoExperienced: false,
    banditEncounter: false,
    simiaEncounter: false,
    maskCommitted: false,
    pathChosen: ''
  },
  inCombat: false,
  enemy: null,
  combatPhase: null
};
```
【F:game.js†L1-L19】
Implementing a simple save/load mechanism using `localStorage` would let players continue where they left off, enhancing usability for longer story sessions.

## 2. Unify the "Cayael" Naming
The README instructs users to open `Echo of Cayeal.html`:
```
2. Locate the file `Echo of Cayeal.html`.
```
【F:README.md†L9-L11】
However, the HTML file displays "Cayael" in the title:
```
<title>The Echo of Cayael</title>
```
【F:Echo of Cayeal.html†L6-L6】
Standardizing the spelling across documentation and code avoids confusion when searching for files and references.

## 3. Expand Styling and Accessibility
Styles currently rely on system fonts with minimal responsiveness:
```
/* Removed external Google Fonts import. Using system font fallbacks instead. */
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Crimson Text', 'Times New Roman', Times, serif; background:linear-gradient(to bottom,#1a1a2e,#0f0f1e);
  color:#e0d0b0; min-height:100vh; display:flex; justify-content:center; align-items:center;
  padding:20px; font-size:18px; line-height:1.6; }
```
【F:style.css†L1-L5】
Improving keyboard navigation and adding larger text options would make the game more accessible to a wider audience.
