const state = {
  scene: 'intro',
  health: 100,
  er: 0,
  momentum: 10,
  fatigue: 0,
  honor: 50
};

const scenes = {
  intro: {
    text: [
      'The sky thrums with distant echoes of war.',
      'You march toward a fate written among the stars.'
    ],
    choices: [
      { text: 'Step onto the shattered trail', next: 'trail' },
      { text: 'Check your equipment', next: 'inventory' }
    ]
  },
  inventory: {
    text: [
      'Your mask and blade remain close at hand.',
      'A ration or two clink in your pack.'
    ],
    choices: [
      { text: 'Return to the trail', next: 'intro' }
    ]
  },
  trail: {
    text: [
      'The barren land stretches before you, whispering of battles yet to come.'
    ],
    choices: []
  }
};

function updateStats() {
  document.getElementById('health').textContent = state.health;
  document.getElementById('er').textContent = state.er;
  document.getElementById('momentum').textContent = state.momentum;
  document.getElementById('fatigue').textContent = state.fatigue;
  document.getElementById('honor').textContent = state.honor;
}

function renderScene(key) {
  state.scene = key;
  const scene = scenes[key];
  const story = document.getElementById('story-text');
  story.innerHTML = scene.text.map(p => `<p>${p}</p>`).join('');

  const choiceContainer = document.getElementById('choices');
  choiceContainer.innerHTML = '';
  scene.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-button';
    btn.textContent = choice.text;
    btn.addEventListener('click', () => renderScene(choice.next));
    choiceContainer.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  renderScene(state.scene);
});
