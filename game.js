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
  combatPhase: null,
  er: 0,
  momentum: 10,
  combo: 0,
  damageMultiplier: 1,
  nextScene: null
};

// Basic enemy templates for the prototype combat system
const enemies = {
  bandits: { name: 'Bandits', health: 30, attack: 6 }
};

// Story scenes
const scenes = {
  start: {
    text: [
      '<p class="location-text">The Road - Dawn</p>',
      '<p>The first rays of dawn pierce through the morning mist, painting the sky in shades of amber and rose. You stir from restless sleep, your body aching from another night on the hard ground. The embers of your campfire glow faintly, their warmth a mockery of the cold that has settled into your bones.</p>',
      '<p>Weeks have passed since Voln. Weeks since the screaming, the blood, the betrayal. Your hand instinctively moves to the wrapped bundle beside your bedroll—your fallen comrade\'s mask, its weight heavier than any armor you\'ve ever worn.</p>',
      '<p>The Road stretches before you, endless and unforgiving, leading to Uunsh where you will commit the mask to the Green. It is all that drives you forward now.</p>'
    ],
    choices: [
      { text: 'Pack up camp and continue your pilgrimage', next: 'morningRoutine' },
      { text: 'Examine your comrade\'s mask', next: 'examineMask' },
      { text: 'Try to remember what happened at Voln', next: 'flashback1' }
    ]
  },

  // Continue with scenes from the original game.js...

  // Adding new scenes from pasted text
  seekWitnesses: {
    text: [
      '<p>Several pilgrims approach, having seen your vision manifest. "We saw it too," one says in awe. "The betrayal, the planning. Was that... real?"</p>',
      '<p>"As real as memory," the keeper confirms. "The Grove sometimes shares important truths with all present. You\'ve been given a gift—and a responsibility."</p>',
      '<p>You now have witnesses to what you\'ve seen. The question is what to do with this shared knowledge.</p>'
    ],
    choices: [
      { text: 'Organize the witnesses', next: 'organizeSurvivors' },
      { text: 'Go immediately to the authorities', next: 'urgentMission' }
    ]
  },

  coverupDetails: {
    text: [
      '<p>"Those who profit from war," the keeper says darkly. "And those who fear what the dead might reveal. Some masks carry dangerous truths—evidence of betrayal, names of traitors."</p>',
      '<p>"There\'s a black market in suppressed masks. Collectors who serve shadow masters, ensuring certain stories are never told. Be grateful you made it here safely."</p>',
      '<p>She looks at your wrapped mask meaningfully. "Guard it well until it\'s safely placed."</p>'
    ],
    choices: [
      { text: 'Place the mask immediately', next: 'placeTheMask' },
      { text: 'Ask for extra protection', next: 'seekProtection' }
    ]
  },

  protectionRequest: {
    text: [
      '<p>"I can assign guards," Thrace says. "But that might draw more attention. The enemy has eyes everywhere."</p>',
      '<p>"Alternatively, complete your pilgrimage quickly and return here. The Font is the safest place in the city right now. My people are loyal."</p>',
      '<p>He hands you a small token. "Show this if you need help. Any soldier who\'s truly loyal will recognize it."</p>'
    ],
    choices: [
      { text: 'Take the token and go to the Grove', next: 'groveApproach' }
    ],
    effects: { inventory: ['Thrace\'s Token'] }
  },

  archivistInfo: {
    text: [
      '<p>"The Midnight Archive trades in secrets," Thrace explains with distaste. "They claim neutrality, but information is power, and they sell to the highest bidder."</p>',
      '<p>"If you go there, be careful. They\'ll want something in return for their knowledge. And once they know you carry secrets, they\'ll never stop pursuing you."</p>',
      '<p>"Still, they might have evidence I can\'t obtain through official channels."</p>'
    ],
    choices: [
      { text: 'Share your testimony first', next: 'fullTestimony' },
      { text: 'Decide to visit the Archive', next: 'archiveSearch' }
    ]
  },

  targetConcern: {
    text: [
      '<p>"It might," Thrace admits honestly. "But you\'re already a target. Surviving Voln marked you. Coming here doubled that mark. The only question is whether you\'ll be a silent target or one who fights back."</p>',
      '<p>"I can offer some protection, but ultimately, the best defense is to expose them before they can act against you."</p>'
    ],
    choices: [
      { text: 'Accept the risk', next: 'agreeToTestify' },
      { text: 'Go to the Grove first', next: 'groveApproach' }
    ]
  },

  hopeQuestion: {
    text: [
      '<p>Thrace is quiet for a long moment. "Honestly? I don\'t know. The conspiracy runs deep, and war profits many. But I know we have to try."</p>',
      '<p>"Every war begins with a lie. If we can expose this lie before it fully takes root... perhaps. At the very least, we might save some lives. Isn\'t that worth the attempt?"</p>'
    ],
    choices: [
      { text: 'Agree to help', next: 'agreeToTestify' },
      { text: 'Complete your pilgrimage first', next: 'groveApproach' }
    ]
  },

  crimsonBay: {
    text: [
      '<p>Pain flickers across Thrace\'s face. "Another \'intelligence failure.\' My unit was sent to secure a bridge. Intel said it was lightly defended. We found three full Aug battalions waiting."</p>',
      '<p>"I lost two hundred soldiers in an hour. Good people. Friends. Just like you lost yours at Voln."</p>',
      '<p>"That\'s when I started keeping records, looking for patterns. Voln confirmed what I suspected—we\'re being sacrificed for someone\'s agenda."</p>'
    ],
    choices: [
      { text: 'Share his determination', next: 'agreeToTestify' },
      { text: 'Complete your duty first', next: 'groveApproach' }
    ]
  },

  urgentWarning: {
    text: [
      '<p>You race through the streets, the stolen knowledge burning in your mind. The Font is in danger. In three days, during the Senate vote, it will be attacked.</p>',
      '<p>Guards try to stop you at the gate, but Thrace\'s token (if you have it) or your desperate insistence gets you through. You burst into Thrace\'s office.</p>',
      '<p>"Commander! The Font will be attacked in three days. I have proof!" You thrust the documents at him.</p>'
    ],
    choices: [
      { text: 'Explain everything quickly', next: 'rapidExplanation' }
    ]
  },

  desperateBargain: {
    text: [
      '<p>"What do they seek?" you press. "What could Aug want badly enough to ally with traitors?"</p>',
      '<p>The archivist\'s smile widens. "Now that\'s a valuable question. Your mask might be sufficient payment..."</p>',
      '<p>But footsteps echo in the corridor. "It seems our time is cut short," the archivist says smoothly. "Those approaching bear ill intent. The back exit is through there. We\'ll continue this another time."</p>'
    ],
    choices: [
      { text: 'Flee with what you know', next: 'hastyEscape' },
      { text: 'Stand and face whoever\'s coming', next: 'confrontation' }
    ]
  },

  urgentAgreement: {
    text: [
      '<p>"Yes," you say without hesitation. "If what these documents say is true, we have no time to waste."</p>',
      '<p>Thrace immediately begins preparations. "I\'ll convene an emergency session. With your testimony and these documents, we can force the Senate to listen."</p>',
      '<p>"But your pilgrimage—" he starts.</p>',
      '<p>"Can wait," you interrupt, though it pains you. "The living come first."</p>'
    ],
    choices: [
      { text: 'Prepare for the Senate', next: 'senatePreparation' }
    ],
    effects: { honor: -5 }
  },

  groveFirst: {
    text: [
      '<p>"I must complete my pilgrimage," you insist. "I made a promise to the dead. But immediately after, I\'ll testify."</p>',
      '<p>Thrace\'s jaw tightens with frustration, but he nods. "I understand. Honor matters. But please—be quick. Every hour gives our enemies more time to prepare."</p>',
      '<p>"Complete your duty to the dead, then help me save the living."</p>'
    ],
    choices: [
      { text: 'Rush to the Grove', next: 'groveApproach' }
    ],
    effects: { honor: 5 }
  },

  riskyDemand: {
    text: [
      '<p>"Names aren\'t enough," you say. "I need proof. Documents. Something that will stand before the Senate."</p>',
      '<p>The archivist\'s expression turns dangerous. "You push too hard, soldier. But very well—one more gift. Then we discuss payment."</p>',
      '<p>They produce a crystal containing what appears to be recorded conversations. "Senator Crassus negotiating with Aug representatives. This alone could end him. Now, about that mask..."</p>'
    ],
    choices: [
      { text: 'Grab the crystal and run', next: 'theftAndFlight' },
      { text: 'Negotiate honestly', next: 'honestNegotiation' }
    ]
  },

  urgentMission: {
    text: [
      '<p>Time is everything now. You race through the city streets, Sania\'s warning echoing in your mind. The Font, three days, during the Senate vote.</p>',
      '<p>You must decide quickly: go straight to Commander Thrace with what you know, or try to gather more evidence first?</p>'
    ],
    choices: [
      { text: 'Go directly to Thrace', next: 'straightToThrace' },
      { text: 'Gather evidence at the Archive first', next: 'archiveDetour' },
      { text: 'Try to warn the Senate directly', next: 'senateWarning' }
    ]
  },

  seekInterpretation: {
    text: [
      '<p>The keeper, seeing your distress, guides you to a quiet chamber. "Echo visions can overwhelm," she says gently. "Let me help you sort truth from possibility."</p>',
      '<p>Together, you piece through the fragmentary warnings. Patterns emerge: an attack on the Font, Aug seeking something called "the Heart," traitors in the Senate, and repeated mentions of breaking a cycle.</p>',
      '<p>"The echoes see across time," the keeper explains. "What you\'ve witnessed spans past, present, and potential futures. But the warning about the Font—that feels immediate."</p>'
    ],
    choices: [
      { text: 'Act on the Font warning', next: 'urgentMission' },
      { text: 'Research "the Heart"', next: 'heartInquiry' }
    ]
  },

  healingFirst: {
    text: [
      '<p>Your burned hand needs attention. The Grove\'s healers work quickly, applying salves that cool the supernatural burns. As they work, you share what you learned.</p>',
      '<p>"A vision warning? the healer says. "Those are not given lightly. The Grove itself wants this message delivered."</p>',
      '<p>Within an hour, your hand is bandaged but functional. Time lost, but you\'re in better shape to act.</p>'
    ],
    choices: [
      { text: 'Go to the Font', next: 'afterCeremonyFont' },
      { text: 'Seek more evidence first', next: 'afterCeremonyArchive' }
    ],
    effects: { health: 10 }
  },

  // Add placeholders for any referenced but undefined scenes
  organizeSurvivors: {
    text: [
      '<p>You gather the witnesses together, organizing them into a cohesive group. Together, your testimony will be much harder to dismiss.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'afterCeremony' }
    ]
  },

  seekProtection: {
    text: [
      '<p>You ask for protection, concerned about the risks.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'protectionRequest' }
    ]
  },

  rapidExplanation: {
    text: [
      '<p>You quickly explain everything you\'ve learned to Commander Thrace.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'urgentAgreement' }
    ]
  },

  hastyEscape: {
    text: [
      '<p>You flee through the back exit, carrying the valuable information with you.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'urgentWarning' }
    ]
  },

  confrontation: {
    text: [
      '<p>You stand your ground, ready to face whoever approaches.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'combatStart' }
    ]
  },

  senatePreparation: {
    text: [
      '<p>You prepare your testimony for the Senate, organizing your thoughts and evidence.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'senateMeeting' }
    ]
  },

  theftAndFlight: {
    text: [
      '<p>You grab the crystal and make a run for it, clutching the evidence tightly.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'hastyEscape' }
    ]
  },

  honestNegotiation: {
    text: [
      '<p>You attempt to negotiate honestly with the archivist.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'archiveAgreement' }
    ]
  },

  straightToThrace: {
    text: [
      '<p>You head directly to Commander Thrace with your urgent warning.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'urgentWarning' }
    ]
  },

  archiveDetour: {
    text: [
      '<p>You decide to gather more evidence at the Archive before warning Thrace.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'archiveSearch' }
    ]
  },

  // Newly added placeholders for missing scenes
  afterCeremony: {
    text: [
      '<p>The ceremony concludes and a solemn calm settles over the Grove.</p>'
    ],
    choices: [
      { text: 'Consider your next move', next: 'leavingChoice' }
    ]
  },

  agreeToTestify: {
    text: [
      '<p>You vow to help Commander Thrace expose the conspiracy.</p>'
    ],
    choices: [
      { text: 'Prepare immediately', next: 'urgentAgreement' },
      { text: 'Finish your pilgrimage first', next: 'groveApproach' }
    ]
  },

  archiveSearch: {
    text: [
      '<p>You delve into the Midnight Archive, searching for supporting evidence.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'archiveRevelation' }
    ]
  },

  combatStart: {
    text: [
      '<p>Bandits leap from the shadows. You ready your blade.</p>'
    ],
    choices: [
      { text: 'Fight', next: 'urgentWarning', combat: 'bandits' }
    ]
  },

  examineMask: {
    text: [
      '<p>You unwrap your comrade\'s mask, tracing the familiar lines.</p>'
    ],
    choices: [
      { text: 'Begin your journey', next: 'morningRoutine' }
    ]
  },

  flashback1: {
    text: [
      '<p>Memories of Voln flood back&mdash;the noise, the smoke, the betrayal.</p>'
    ],
    choices: [
      { text: 'Shake off the memories', next: 'morningRoutine' }
    ]
  },

  fontVisit: {
    text: [
      '<p>At the Font, priests listen to your warnings with grave concern.</p>'
    ],
    choices: [
      { text: 'Take your message to Thrace', next: 'urgentWarning' }
    ]
  },

  fullTestimony: {
    text: [
      '<p>You recount everything you remember of the conspiracy.</p>'
    ],
    choices: [
      { text: 'Hear Thrace\'s response', next: 'targetConcern' }
    ]
  },

  groveApproach: {
    text: [
      '<p>You arrive at the Grove where the Green awaits your comrade\'s mask.</p>'
    ],
    choices: [
      { text: 'Place the mask', next: 'placeTheMask' }
    ]
  },

  morningRoutine: {
    text: [
      '<p>You pack up camp and set out toward Uunsh.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'groveApproach' }
    ]
  },

  placeTheMask: {
    text: [
      '<p>You set the mask among the others, honoring your fallen comrade.</p>'
    ],
    choices: [
      { text: 'Seek guidance from the keepers', next: 'seekInterpretation' }
    ],
    effects: { flags: { maskCommitted: true } }
  },

  senateWarning: {
    text: [
      '<p>You attempt to warn the Senate directly about the impending threat.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'senateChaos' }
    ]
  },

  heartInquiry: {
    text: [
      '<p>You ask the keeper about "the Heart" that was mentioned in the visions.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'heartExplanation' }
    ]
  },

  afterCeremonyFont: {
    text: [
      '<p>Having completed the ceremony, you head to the Font to share what you\'ve learned.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'fontVisit' }
    ]
  },

  afterCeremonyArchive: {
    text: [
      '<p>After the ceremony, you decide to visit the Archive to gather more information.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'archiveSearch' }
    ]
  },

  leavingChoice: {
    text: [
      '<p>You consider leaving Uunsh entirely, your duty to the dead now fulfilled.</p>'
    ],
    choices: [
      { text: 'Stay and help', next: 'afterCeremonyFont' },
      { text: 'Leave the city', next: 'epilogue' }
    ]
  },

  senateMeeting: {
    text: [
      '<p>You present your testimony before the Senate, revealing the conspiracy.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'senateReaction' }
    ]
  },

  archiveAgreement: {
    text: [
      '<p>You reach an agreement with the archivist, exchanging information.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'archiveRevelation' }
    ]
  },

  senateChaos: {
    text: [
      '<p>Your attempt to warn the Senate causes chaos as various factions react.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'senateAftermath' }
    ]
  },

  heartExplanation: {
    text: [
      '<p>The keeper explains what "the Heart" is and its significance.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'afterExplanation' }
    ]
  },

  epilogue: {
    text: [
      '<p>Your journey comes to an end, but the echoes of your choices will resonate through time.</p>'
    ],
    choices: [
      { text: 'Start a new journey', next: 'start' }
    ]
  },

  senateReaction: {
    text: [
      '<p>The Senate reacts to your testimony, with some supporting you and others denying everything.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'epilogue' }
    ]
  },

  archiveRevelation: {
    text: [
      '<p>The archivist reveals crucial information that changes your understanding.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'afterRevelation' }
    ]
  },

  senateAftermath: {
    text: [
      '<p>In the aftermath of the Senate warning, you must deal with the consequences.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'epilogue' }
    ]
  },

  afterExplanation: {
    text: [
      '<p>With new understanding about "the Heart," you must decide how to proceed.</p>'
    ],
    choices: [
      { text: 'Warn about the Font attack', next: 'urgentMission' },
      { text: 'Seek the Heart', next: 'heartQuest' }
    ]
  },

  afterRevelation: {
    text: [
      '<p>Armed with new knowledge from the Archive, you must decide your next move.</p>'
    ],
    choices: [
      { text: 'Warn Thrace', next: 'urgentWarning' },
      { text: 'Continue investigating', next: 'deeperInvestigation' }
    ]
  },

  heartQuest: {
    text: [
      '<p>You begin a quest to find "the Heart" before it falls into the wrong hands.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'epilogue' }
    ]
  },

  deeperInvestigation: {
    text: [
      '<p>You delve deeper into the conspiracy, uncovering layers of deception.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'finalRevelation' }
    ]
  },

  finalRevelation: {
    text: [
      '<p>You discover the full extent of the conspiracy and what\'s truly at stake.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'epilogue' }
    ]
  }
};

// Helper functions for game mechanics
function updateStats() {
  document.getElementById('health').textContent = state.health;
  document.getElementById('er').textContent = state.er;
  document.getElementById('momentum').textContent = state.momentum;
  document.getElementById('fatigue').textContent = state.fatigue;
  document.getElementById('honor').textContent = state.honor;

  // Update inventory display
  const inventoryList = document.getElementById('inventory-list');
  inventoryList.innerHTML = '';
  state.inventory.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'inventory-item';
    itemElement.textContent = `\u2022 ${item}`;
    inventoryList.appendChild(itemElement);
  });
}

function applyEffects(effects) {
  if (!effects) return;

  if (effects.health) state.health = Math.max(0, state.health + effects.health);
  if (effects.fatigue) state.fatigue = Math.max(0, state.fatigue + effects.fatigue);
  if (effects.honor) state.honor = Math.max(0, state.honor + effects.honor);

  if (effects.inventory) {
    effects.inventory.forEach(item => {
      if (!state.inventory.includes(item)) {
        state.inventory.push(item);
      }
    });
  }

  if (effects.flags) {
    Object.keys(effects.flags).forEach(flag => {
      state.flags[flag] = effects.flags[flag];
    });
  }

  updateStats();
}

function checkCondition(condition) {
  if (!condition) return true;

  switch(condition) {
    case 'hasEchoStone':
      return state.inventory.includes('Echo Stone');
    // Add more conditions as needed
    default:
      return false;
  }
}

function renderScene(sceneKey) {
  const scene = scenes[sceneKey];
  if (!scene) {
    console.error(`Scene "${sceneKey}" not found!`);
    return;
  }

  state.scene = sceneKey;

  // Render scene text
  const storyText = document.getElementById('story-text');
  storyText.innerHTML = scene.text.join('');

  // Render choices
  const choicesContainer = document.getElementById('choices');
  choicesContainer.innerHTML = '';

  scene.choices.forEach(choice => {
    if (choice.condition && !checkCondition(choice.condition)) return;

    const button = document.createElement('button');
    button.className = 'choice-button';
    button.textContent = choice.text;
    button.addEventListener('click', () => {
      if (scene.effects) applyEffects(scene.effects);
      if (choice.effects) applyEffects(choice.effects);

      if (choice.combat) {
        startCombat(choice.combat, choice.next);
      } else {
        renderScene(choice.next);
      }
    });

    choicesContainer.appendChild(button);
  });

  // Apply scene effects
  if (scene.effects) applyEffects(scene.effects);
}

function startCombat(enemyType, nextScene) {
  state.inCombat = true;
  state.enemy = JSON.parse(JSON.stringify(enemies[enemyType] || { name: 'Enemy', health: 20, attack: 4 }));
  state.er = 0;
  state.momentum = 10;
  state.combo = 0;
  state.damageMultiplier = 1;
  state.nextScene = nextScene;
  state.combatPhase = 'opener';

  document.getElementById('er-display').style.display = 'flex';
  document.getElementById('momentum-display').style.display = 'flex';

  const combatDisplay = document.getElementById('combat-display');
  combatDisplay.style.display = 'block';
  document.getElementById('combat-log').textContent = `You are confronted by ${state.enemy.name}!`;
  renderCombatOptions();
  updateStats();
}

function renderCombatOptions() {
  const options = document.getElementById('combat-options');
  options.innerHTML = '';

  if (!state.inCombat) return;

  if (state.combatPhase === 'opener') {
    ['attack', 'defend', 'control'].forEach(type => {
      const btn = document.createElement('button');
      btn.className = 'combat-button';
      btn.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      btn.addEventListener('click', () => handleOpener(type));
      options.appendChild(btn);
    });
  } else {
    let actions = [];
    if (state.combatPhase === 'attack') {
      actions = [
        { name: 'Strike', key: 'strike', cost: 0 },
        { name: 'Heavy Swing', key: 'heavy', cost: 1 },
        { name: 'Special', key: 'special', cost: 2 }
      ];
    } else if (state.combatPhase === 'defend') {
      actions = [
        { name: 'Block', key: 'block', cost: 0 },
        { name: 'Counter', key: 'counter', cost: 1 },
        { name: 'Special', key: 'special', cost: 2 }
      ];
    } else if (state.combatPhase === 'control') {
      actions = [
        { name: 'Trip', key: 'trip', cost: 0 },
        { name: 'Disarm', key: 'disarm', cost: 1 },
        { name: 'Special', key: 'special', cost: 2 }
      ];
    }

    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'combat-button';
      btn.textContent = a.name + (a.cost ? ` (-${a.cost} ER)` : '');
      if (a.cost && state.er < a.cost) btn.disabled = true;
      btn.addEventListener('click', () => handleBranch(a.key));
      options.appendChild(btn);
    });
  }
}

function handleOpener(type) {
  const log = document.getElementById('combat-log');
  if (type === 'attack') {
    state.momentum += 1;
    state.combo += 1;
    log.textContent = 'You launch an attack!';
  } else if (type === 'defend') {
    state.er += 1;
    state.combo = 0;
    log.textContent = 'You brace for defense!';
  } else if (type === 'control') {
    state.momentum += 1;
    state.combo = 0;
    log.textContent = 'You attempt to control the foe!';
  }
  state.combatPhase = type;
  updateStats();
  renderCombatOptions();
}

function handleBranch(action) {
  const log = document.getElementById('combat-log');
  let playerDamage = 0;
  let enemyDamage = state.enemy.attack;

  switch (action) {
    case 'strike':
      playerDamage = 5;
      state.combo += 1;
      state.momentum += 1;
      break;
    case 'heavy':
      if (state.er >= 1) {
        state.er -= 1;
        playerDamage = 8;
        state.combo += 1;
      } else {
        log.textContent = 'Not enough ER!';
        return;
      }
      break;
    case 'special':
      if (state.er >= 2) {
        state.er -= 2;
        playerDamage = 12;
        state.combo = 0;
      } else {
        log.textContent = 'Not enough ER!';
        return;
      }
      break;
    case 'block':
      enemyDamage = Math.floor(enemyDamage / 2);
      state.combo = 0;
      break;
    case 'counter':
      if (state.er >= 1) {
        state.er -= 1;
        playerDamage = 4;
        enemyDamage = 0;
      } else {
        log.textContent = 'Not enough ER!';
        return;
      }
      break;
    case 'trip':
      playerDamage = 4;
      enemyDamage = Math.max(0, enemyDamage - 2);
      state.combo = 0;
      break;
    case 'disarm':
      if (state.er >= 1) {
        state.er -= 1;
        state.enemy.attack = Math.max(1, Math.floor(state.enemy.attack / 2));
      } else {
        log.textContent = 'Not enough ER!';
        return;
      }
      break;
  }

  state.damageMultiplier = 1 + state.combo * 0.2 + state.momentum * 0.05;
  playerDamage = Math.floor(playerDamage * state.damageMultiplier);
  state.enemy.health = Math.max(0, state.enemy.health - playerDamage);

  log.textContent = `You dealt ${playerDamage} damage.`;

  updateStats();

  if (state.enemy.health <= 0) {
    log.textContent += ` You defeated the ${state.enemy.name}!`;
    endCombat(true);
    return;
  }

  enemyTurn(enemyDamage);
}

function enemyTurn(dmg) {
  const log = document.getElementById('combat-log');
  state.health = Math.max(0, state.health - dmg);
  log.textContent += ` The ${state.enemy.name} hits you for ${dmg}.`;
  updateStats();
  if (state.health <= 0) {
    endCombat(false);
  } else {
    state.combatPhase = 'opener';
    renderCombatOptions();
  }
}

function endCombat(playerWon) {
  state.inCombat = false;
  const options = document.getElementById('combat-options');
  options.innerHTML = '';
  const cont = document.createElement('button');
  cont.className = 'choice-button';
  cont.textContent = 'Continue';
  cont.addEventListener('click', () => {
    document.getElementById('combat-display').style.display = 'none';
    document.getElementById('er-display').style.display = 'none';
    document.getElementById('momentum-display').style.display = 'none';
    if (playerWon) {
      renderScene(state.nextScene);
    } else {
      state.health = 100;
      renderScene('start');
    }
  });
  options.appendChild(cont);
}

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
  updateStats();
  renderScene('start');
});

