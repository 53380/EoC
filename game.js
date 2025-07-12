const state = {
  scene: 'intro',
  health: 100,
  er: 0,
  momentum: 10,
  fatigue: 0,
  honor: 50
};

const enemies = {
  shade: { name: 'wandering shade', health: 20 }
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
    choices: [
      { text: 'Seek out the lurking shade', next: 'battle' },
      { text: 'Return to camp', next: 'intro' }
    ]
  },
  battle: {
    text: [
      'A shadowy figure emerges from the gloom.'
    ],
    choices: [
      { text: 'Fight', combat: 'shade', next: 'victory' },
      { text: 'Flee', next: 'trail' }
    ]
  },
  victory: {
    text: [
      'The shade dissipates, leaving silence behind.'
    ],
    choices: [
      { text: 'Continue down the trail', next: 'trail' }
    ]
  }
};

function updateStats() {
  document.getElementById('health').textContent = state.health;
  document.getElementById('er').textContent = state.er;
  document.getElementById('momentum').textContent = state.momentum;
  document.getElementById('fatigue').textContent = state.fatigue;
  document.getElementById('honor').textContent = state.honor;
}

function startCombat(enemyKey, nextScene) {
  const enemy = enemies[enemyKey];
  if (!enemy) {
    alert('Combat encounter missing enemy data.');
    if (nextScene) renderScene(nextScene);
    return;
  }

  let enemyHealth = enemy.health;
  const log = [];

  while (enemyHealth > 0 && state.health > 0) {
    const playerDamage = Math.ceil(Math.random() * 6);
    enemyHealth -= playerDamage;
    log.push(`You strike the ${enemy.name} for ${playerDamage} damage.`);
    if (enemyHealth <= 0) break;
    const enemyDamage = Math.ceil(Math.random() * 4);
    state.health -= enemyDamage;
    log.push(`The ${enemy.name} hits you for ${enemyDamage}.`);
  }

  if (state.health <= 0) {
    log.push('You were defeated.');
  } else {
    log.push(`You defeated the ${enemy.name}!`);
  }

  alert(log.join('\n'));
  updateStats();
  if (state.health > 0 && nextScene) {
    renderScene(nextScene);
  }
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
    btn.addEventListener('click', () => {
      if (choice.combat) {
        startCombat(choice.combat, choice.next);
      } else {
        renderScene(choice.next);
      }
    });
    choiceContainer.appendChild(btn);
  });
  updateStats();
}

document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  renderScene(state.scene);
});
