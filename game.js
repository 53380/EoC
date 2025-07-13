// Game state
const state = {
  scene: 'start',
  health: 100,
  maxHealth: 100,
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
  maxER: 100,
  momentum: 10,
  maxMomentum: 30,
  nextScene: null,
  skills: {
    infantry: 1,
    lightCavalry: 0,
    heavyCavalry: 0
  },
  currentVerb: null,
  baseDamage: 10,
  incomingMultiplier: 1.0,
  comboCount: 0,
  abilities: {
    attack: { name: 'Soldier\'s Strike', outMulti: 1.0, inMulti: 1.0 },
    defend: { name: 'Infantry Guard', outMulti: 0.6, inMulti: 0.675 },
    control: { name: 'Binding Maneuver', outMulti: 0.6, inMulti: 0.775, cc: 1.25 }
  }
};

const branches = {
  attack: [
    { name: 'Aggressive Attack', flavor: 'Overwhelming Force', effect: 'Maximum damage, but leaves you exposed', outMulti: 1.5, inMulti: 1.5 },
    { name: 'Aggressive Defense', flavor: 'Balanced Assault', effect: 'Moderate damage with defensive stance', outMulti: 0.8, inMulti: 0.8 },
    { name: 'Aggressive Control', flavor: 'Stunning Strike', effect: 'Good damage with brief stun', outMulti: 1.2, inMulti: 0.9, cc: 1.0 },
    { name: 'Special Attack', flavor: 'Cavalry Charge Memory', effect: 'Channel the fury of the Third Cavalry', outMulti: 2.0, inMulti: 1.0, erCost: 40, isSpecial: true }
  ],
  defend: [
    { name: 'Safe Attack', flavor: 'Counter Strike', effect: 'Light damage from defensive position', outMulti: 0.65, inMulti: 0.7 },
    { name: 'Heavy Defense', flavor: 'Fortress Stance', effect: 'Maximum protection, minimal offense', outMulti: 0.5, inMulti: 0.5 },
    { name: 'Safe Control', flavor: 'Binding Guard', effect: 'Defensive control with protection', outMulti: 0.45, inMulti: 0.68, cc: 1.1 },
    { name: 'Special Defense', flavor: 'Iron Discipline', effect: 'Years of training make you untouchable', outMulti: 0, inMulti: 0.1, erCost: 40, isSpecial: true }
  ],
  control: [
    { name: 'Attacking Control', flavor: 'Disabling Strike', effect: 'Damage with short control', outMulti: 0.75, inMulti: 0.8, cc: 0.9 },
    { name: 'Defensive Control', flavor: 'Tactical Binding', effect: 'Balanced control and protection', outMulti: 0.6, inMulti: 0.775, cc: 1.25 },
    { name: 'Heavy Control', flavor: 'Complete Immobilization', effect: 'Extended control duration', outMulti: 0.725, inMulti: 0.8, cc: 1.75 },
    { name: 'Special Control', flavor: "Officer's Command", effect: 'Your authority freezes them in place', outMulti: 1.2, inMulti: 0.5, cc: 2.0, erCost: 40, isSpecial: true }
  ]
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
      '<p>The ritual ends with a low thrum from the Green as the last echoes of your comrade\'s memories fade.</p>',
      '<p>The gathered witnesses watch you expectantly. News of a conspiracy has unsettled them, and they look to you for direction.</p>',
      '<p>Your vow to the dead is fulfilled, but the living still need your aid. Where will you turn next?</p>'
    ],
    choices: [
      { text: 'Seek Commander Thrace at the Font', next: 'afterCeremonyFont' },
      { text: 'Search the Midnight Archive for answers', next: 'afterCeremonyArchive' },
      { text: 'Leave Uunsh behind while you still can', next: 'epilogue' }
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
      '<p>A trio of armed thugs step from the shadows, blocking your path.</p>',
      '<p>\"Hand over the mask, and maybe you walk away,\" their leader sneers. Their movements are too precise for common bandits&mdash;someone sent them.</p>'
    ],
    choices: [
      { text: 'Stand and fight', next: 'urgentWarning', combat: 'bandits' },
      { text: 'Try to slip past and flee', next: 'hastyEscape' }
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
      '<p>The soaring arches of the Font echo with solemn chants as you arrive.</p>',
      '<p>You recount the vision and the plot against Uunsh. The priests exchange worried glances, unsure how to proceed.</p>',
      '<p>They offer what aid they can but urge you to act quickly before fear turns to panic.</p>'
    ],
    choices: [
      { text: 'Seek Commander Thrace', next: 'urgentWarning' },
      { text: 'Return to the Grove for guidance', next: 'groveApproach' },
      { text: 'Consult the Midnight Archive', next: 'archiveSearch' }
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


  morningRoutine: {
    text: [
      '<p>You pack up camp and set out toward Uunsh.</p>'
    ],
    choices: [
      { text: 'Continue', next: 'roadWalk1' }
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

  // New narrative scenes
  banditVictory: {
    text: [
      '<p>The bandit leader falls, clutching his wounds. His companions flee into the wilderness, leaving their leader to his fate.</p>',
      '<p>The other travelers slowly emerge from their hiding places, looking at you with a mixture of gratitude and fear. You\'ve saved them, but at what cost to your own soul?</p>'
    ],
    choices: [
      { text: 'Help the wounded bandit', next: 'showMercy' },
      { text: 'Check on the travelers', next: 'helpTravelers' },
      { text: 'Leave immediately', next: 'coldDeparture' },
      { text: 'Search the bandit', next: 'lootBandit' }
    ]
  },

  banditDefeat: {
    text: [
      '<p>You fall to one knee, overwhelmed. The bandits, sensing weakness, close in—but suddenly freeze.</p>',
      '<p>"Enough!" The elderly merchant steps forward, holding a purse. "Take this and go. No more blood today."</p>',
      '<p>The bandits snatch the gold and flee. The merchant helps you to your feet. "One kindness deserves another, soldier."</p>'
    ],
    choices: [
      { text: 'Thank the merchant', next: 'afterBanditEncounter' },
      { text: 'Refuse their help proudly', next: 'afterBanditEncounter' }
    ],
    effects: { health: -10 }
  },

  combatTutorial: {
    text: [
      '<p class="combat-text">Your hand moves to your blade with practiced ease. Years of training take over as you shift into a combat stance—weight balanced, blade held low but ready.</p>',
      '<p>"Mistake," you say quietly.</p>',
      '<p>The bandits hesitate. They expected fear, not the cold confidence of a trained Imperial officer.</p>'
    ],
    choices: [
      { text: 'Begin Combat', next: 'afterBanditEncounter', combat: 'bandits' }
    ]
  },

  roadWalk1: {
    text: [
      '<p class="location-text">The Road - Morning</p>',
      '<p>The Road beneath your feet is ancient, its stones worn smooth by countless pilgrims, merchants, and armies.</p>',
      '<p>As the sun climbs higher, you pass other travelers. Most give you a wide berth when they notice your military bearing.</p>',
      '<p>Ahead, you notice a disturbance. Several travelers have stopped, clustering nervously at the roadside.</p>'
    ],
    choices: [
      { text: 'Investigate the disturbance', next: 'banditEncounter' },
      { text: 'Avoid the crowd and continue walking', next: 'avoidTrouble' },
      { text: 'Approach cautiously and observe', next: 'cautiousApproach' }
    ]
  },

  firstEcho: {
    text: [
      '<p class="location-text">The Road - Twilight</p>',
      '<p>As evening approaches, the air grows thick with otherworldly tension. You feel a strange pulling sensation.</p>',
      '<p class="echo-text">Suddenly, the world shifts. You are no longer alone on the Road. A figure walks beside you—translucent, shimmering like heat mirages. Another Cayael, on another pilgrimage.</p>',
      '<p class="echo-text">"The wheel turns," the Echo says. "We have walked this road before. We will walk it again. Until the pattern breaks."</p>'
    ],
    choices: [
      { text: 'Try to understand what you saw', next: 'afterEcho' },
      { text: 'Press on, disturbed', next: 'afterEcho' }
    ],
    effects: { flags: { echoExperienced: true } }
  },

  nightEncounter: {
    text: [
      '<p>A figure emerges from the shadows—tall, wrapped in the distinctive robes of the Simia. The moonlight catches their features: angular, almost bird-like.</p>',
      '<p>"Soldier," they say in accented Imperial. "You walk toward Uunsh. You carry death. We have seen your arrival in the turning of stars."</p>'
    ],
    choices: [
      { text: 'Ask about their prophecy', next: 'simiaProphecy' },
      { text: 'Demand they explain themselves', next: 'simiaConfrontation' },
      { text: 'Offer to share your fire', next: 'simiaFriendship' }
    ],
    effects: { flags: { simiaEncounter: true } }
  },

  showMercy: {
    text: [
      '<p>You kneel beside the wounded bandit. "Because I\'ve seen enough death," you reply to his question.</p>',
      '<p>The other travelers watch in amazement as you tend to your fallen enemy.</p>'
    ],
    choices: [
      { text: 'Continue your journey', next: 'afterBanditEncounter' }
    ],
    effects: { honor: 15, fatigue: 5 }
  },

  helpTravelers: {
    text: [
      '<p>You help the frightened travelers gather their belongings. A child peers at you from behind her mother\'s skirts.</p>',
      '<p>"Bless you, warrior," the elderly merchant says.</p>'
    ],
    choices: [
      { text: 'Continue your journey', next: 'afterBanditEncounter' }
    ],
    effects: { honor: 20, fatigue: 5 }
  },

  coldDeparture: {
    text: [
      '<p>You clean your blade and sheathe it without a second glance. Death is an old companion now.</p>'
    ],
    choices: [
      { text: 'Continue your journey', next: 'afterBanditEncounter' }
    ],
    effects: { honor: -5 }
  },

  lootBandit: {
    text: [
      '<p>You search the bandit, finding some coins and a healing salve.</p>'
    ],
    choices: [
      { text: 'Continue your journey', next: 'afterBanditEncounter' }
    ],
    effects: { inventory: ['Healing Salve'] }
  },

  afterBanditEncounter: {
    text: [
      '<p>The sun climbs higher as you leave the scene behind. As evening approaches, the world begins to feel strange...</p>'
    ],
    choices: [
      { text: 'Experience your first Echo', next: 'firstEcho' }
    ]
  },

  afterEcho: {
    text: [
      '<p>You make camp as darkness falls, still shaken by the Echo. Tomorrow you\'ll reach the crossroads.</p>',
      '<p>As you settle for sleep, you hear something in the darkness.</p>'
    ],
    choices: [
      { text: 'Investigate the sound', next: 'nightEncounter' },
      { text: 'Try to sleep', next: 'crossroadsChoice' }
    ]
  },

  crossroadsChoice: {
    text: [
      '<p class="location-text">The Crossroads - Morning</p>',
      '<p>You stand where the road divides. Which path calls to you?</p>'
    ],
    choices: [
      { text: 'Take the dangerous shortcut', next: 'groveApproach' },
      { text: 'Follow the safe highway', next: 'groveApproach' }
    ]
  },

  groveApproach: {
    text: [
      '<p class="location-text">The Grove of Remembrance - Uunsh</p>',
      '<p>After days of travel, you finally stand before the Grove. Ancient trees form a natural cathedral. Thousands of masks hang from the boughs.</p>',
      '<p>The keeper approaches—an elderly woman with kind eyes. "Welcome, soldier. You carry a heavy burden."</p>'
    ],
    choices: [
      { text: 'Present the mask formally', next: 'formalCeremony' },
      { text: 'Ask about the ritual', next: 'ritualInquiry' }
    ]
  },

  ritualInquiry: {
    text: [
      '<p>You inquire about the ritual, seeking to understand its meaning before you commit the mask.</p>'
    ],
    choices: [
      { text: 'Proceed with the ceremony', next: 'formalCeremony' }
    ]
  },

  formalCeremony: {
    text: [
      '<p>You kneel and unwrap the mask with trembling hands. The keeper accepts it with grave dignity.</p>',
      '<p>"Speak her name," the keeper intones.</p>',
      '<p>"Lysandra of the Third Cavalry," you say, voice cracking. "She died with honor at Voln."</p>',
      '<p>The keeper nods and begins the ritual. As she works, something strange happens—the mask begins to glow...</p>'
    ],
    choices: [
      { text: 'Watch in awe', next: 'maskVision' }
    ],
    effects: { flags: { maskCommitted: true } }
  },

  maskVision: {
    text: [
      '<p class="echo-text">The world fractures. You see through Lysandra\'s eyes—not her death, but days before. A secret meeting. Officers exchanging gold.</p>',
      '<p class="echo-text">Senator Crassus\'s face appears. "The Third must fall for the war to begin. Their deaths will inflame the people."</p>',
      '<p class="echo-text">The vision shifts. Aug forces, yes, but led by Imperial guides. Your unit rode into a trap built by your own people.</p>'
    ],
    choices: [
      { text: 'Share what you saw', next: 'revealVision' },
      { text: 'Keep it secret for now', next: 'hideVision' }
    ]
  },

  revealVision: {
    text: [
      '<p>"I saw... betrayal," you gasp. "The ambush at Voln—it was arranged by our own people. Senator Crassus, others. They wanted us dead to justify a war."</p>',
      '<p>The keeper\'s expression hardens. "The mask remembers what the dead have seen. What will you do with this knowledge?"</p>'
    ],
    choices: [
      { text: 'Go to the authorities immediately', next: 'seekJustice' },
      { text: 'Disappear—this is too dangerous', next: 'flee' },
      { text: 'Gather more evidence first', next: 'investigate' }
    ]
  },

  seekJustice: {
    text: [
      '<p>You leave the Grove with new purpose. The Font is your destination. Someone there must listen.</p>',
      '<p>Commander Thrace emerges. "Cayael? I\'ve been gathering loyalists. The war faction moves tonight."</p>'
    ],
    choices: [
      { text: 'Join Thrace\'s resistance', next: 'finalChoice' }
    ]
  },

  finalChoice: {
    text: [
      '<p>The Senate must now choose, but so must you. Where does your path lead from here?</p>',
      '<p>The Echo of Cayael—your echo—will resonate through time. What ending will you write?</p>'
    ],
    choices: [
      { text: 'Stay and fight for justice in the capital', next: 'endingJustice' },
      { text: 'Return to the border to prevent war', next: 'endingWarPrevention' },
      { text: 'Vanish into the wilderness', next: 'endingExile' },
      { text: 'Seek the deeper mystery of the Echoes', next: 'endingMystery' }
    ]
  },

  endingJustice: {
    text: [
      '<p class="location-text">Epilogue - The Font</p>',
      '<p>You chose to stay and fight. The capital becomes a battleground of truth against lies.</p>',
      '<p>Some senators fall. Others rise. The war is postponed, though not prevented.</p>',
      '<p>Late at night, you still see Echoes. Other Cayaels making other choices.</p>',
      '<p class="system-message">Your choices have shaped the world. The events of your pilgrimage will echo through time.</p>'
    ],
    choices: [
      { text: 'Begin a new journey', next: 'start' }
    ]
  },

  endingWarPrevention: {
    text: [
      '<p class="location-text">Epilogue - The Borderlands</p>',
      '<p>You rode hard for the border, arriving just as the first skirmishes began.</p>',
      '<p>The war is averted—for now. But the conspirators remain in power.</p>',
      '<p class="system-message">Your path of prevention has created new possibilities.</p>'
    ],
    choices: [
      { text: 'Begin a new journey', next: 'start' }
    ]
  },

  endingExile: {
    text: [
      '<p class="location-text">Epilogue - The Wild Places</p>',
      '<p>You disappeared into the wilderness, leaving behind a testimony that shook the Empire.</p>',
      '<p>Years pass. You help other pilgrims reach the Grove. They call you the Silent Guardian.</p>',
      '<p class="system-message">Your choice of exile has created a legend.</p>'
    ],
    choices: [
      { text: 'Begin a new journey', next: 'start' }
    ]
  },

  endingMystery: {
    text: [
      '<p class="location-text">Epilogue - Between the Echoes</p>',
      '<p>You chose to pursue the deeper mystery. Why do the Echoes exist?</p>',
      '<p>Now you walk between worlds, neither fully here nor there.</p>',
      '<p class="system-message">Your transcendent choice has touched the very fabric of the game world.</p>'
    ],
    choices: [
      { text: 'Begin a new journey', next: 'start' }
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
  document.getElementById('fatigue').textContent = state.fatigue;
  document.getElementById('honor').textContent = state.honor;

  if (state.inCombat) {
    document.getElementById('er').textContent = state.er;
    document.getElementById('momentum').textContent = state.momentum;
  }

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
  state.combatPhase = 'opener';
  state.comboCount = 0;
  state.er = 0;

  if (enemyType === 'bandits') {
    state.enemy = {
      name: 'Bandit Leader',
      description: 'A desperate highwayman with more greed than skill',
      health: 60,
      maxHealth: 60,
      damage: 8
    };
  }

  state.nextScene = nextScene;

  document.getElementById('er-display').style.display = 'flex';
  document.getElementById('momentum-display').style.display = 'flex';

  updateStats();
  showCombatScene();
}

function showCombatScene() {
  const storyText = document.getElementById('story-text');
  storyText.innerHTML = '<p class="combat-text">Combat has begun!</p>';
  storyText.innerHTML += `\n    <div class="enemy-status">\n      <strong>${state.enemy.name}</strong><br>\n      ${state.enemy.description}<br>\n      Health: ${state.enemy.health}/${state.enemy.maxHealth}\n    </div>`;

  if (state.combatPhase === 'opener') {
    showOpenerChoices();
  }
}

function showOpenerChoices() {
  const storyText = document.getElementById('story-text');
  storyText.innerHTML += '<p><strong>OPENER PHASE:</strong> Choose your opening move.</p>';

  const choicesContainer = document.getElementById('choices');
  choicesContainer.innerHTML = '';

  const abilities = ['attack', 'defend', 'control'];
  abilities.forEach(verb => {
    const ability = state.abilities[verb];
    const button = document.createElement('button');
    button.className = 'choice-button';
    button.innerHTML = `${verb.charAt(0).toUpperCase() + verb.slice(1)} - ${ability.name}<br>\n      <span class="choice-effect">${verb === 'attack' ? 'Full damage output' : verb === 'defend' ? '40% damage, 32.5% damage reduction' : '40% damage, 1.25s stun'}</span>`;
    button.onclick = () => executeOpener(verb);
    choicesContainer.appendChild(button);
  });
}

function executeOpener(verb) {
  const ability = state.abilities[verb];
  state.currentVerb = verb;

  const storyText = document.getElementById('story-text');
  storyText.innerHTML += `<div class="combat-message">You execute ${ability.name}!</div>`;

  const damage = Math.round(state.baseDamage * ability.outMulti);
  if (damage > 0) {
    state.enemy.health = Math.max(0, state.enemy.health - damage);
    storyText.innerHTML += `<p>Deal ${damage} damage to ${state.enemy.name}.</p>`;
  }

  if (verb === 'defend') {
    state.incomingMultiplier = ability.inMulti;
    storyText.innerHTML += `<p>You take a defensive stance.</p>`;
  } else if (verb === 'control' && ability.cc) {
    storyText.innerHTML += `<p>Enemy is stunned!</p>`;
  }

  const erGain = verb === 'attack' ? 8 : verb === 'defend' ? 5 : 6;
  state.er = Math.min(state.maxER, state.er + erGain);
  storyText.innerHTML += `<div class="system-message">+${erGain} ER</div>`;

  updateStats();

  if (state.enemy.health <= 0) {
    endCombat(true);
  } else {
    state.combatPhase = 'branch';
    setTimeout(() => showBranchChoices(), 1000);
  }
}

function showBranchChoices() {
  const storyText = document.getElementById('story-text');
  storyText.innerHTML = `<p><strong>BRANCH PHASE:</strong> Your ${state.currentVerb} creates opportunities!</p>`;

  const choicesContainer = document.getElementById('choices');
  choicesContainer.innerHTML = '';

  const verbBranches = branches[state.currentVerb];
  verbBranches.forEach(branch => {
    const button = document.createElement('button');
    button.className = 'choice-button';
    button.innerHTML = `${branch.name} - ${branch.flavor}<br>\n      <span class="choice-effect">${branch.effect}</span>`;

    if (branch.erCost) {
      button.innerHTML += `<span class="choice-cost">${branch.erCost} ER</span>`;
      if (state.er < branch.erCost) {
        button.disabled = true;
      }
    }

    button.onclick = () => executeBranch(branch);
    choicesContainer.appendChild(button);
  });
}

function executeBranch(branch) {
  if (branch.erCost) {
    state.er -= branch.erCost;
  }

  const storyText = document.getElementById('story-text');
  storyText.innerHTML += `<div class="branch-message">You branch into ${branch.name}!</div>`;

  const rootMulti = state.abilities[state.currentVerb].outMulti;
  const totalDamage = Math.round(state.baseDamage * rootMulti * branch.outMulti);

  if (totalDamage > 0) {
    state.enemy.health = Math.max(0, state.enemy.health - totalDamage);
    storyText.innerHTML += `<p>${branch.flavor} deals ${totalDamage} damage!</p>`;
  }

  state.incomingMultiplier = branch.inMulti;

  if (!branch.isSpecial) {
    state.comboCount++;
    const erGain = 5 + state.comboCount * 3;
    state.er = Math.min(state.maxER, state.er + erGain);
    storyText.innerHTML += `<div class="system-message">Combo ${state.comboCount}! +${erGain} ER</div>`;
  }

  updateStats();

  if (state.enemy.health <= 0) {
    endCombat(true);
  } else {
    setTimeout(() => enemyTurn(), 1500);
  }
}

function enemyTurn() {
  const storyText = document.getElementById('story-text');
  storyText.innerHTML = `<p><strong>ENEMY TURN:</strong> ${state.enemy.name} attacks!</p>`;

  const damage = Math.round(state.enemy.damage * state.incomingMultiplier);
  state.health = Math.max(0, state.health - damage);
  storyText.innerHTML += `<p>You take ${damage} damage.</p>`;

  updateStats();

  if (state.health <= 0) {
    endCombat(false);
    return;
  }

  const erGain = 4;
  state.er = Math.min(state.maxER, state.er + erGain);

  state.incomingMultiplier = 1.0;

  updateStats();

  state.combatPhase = 'opener';
  setTimeout(() => showOpenerChoices(), 1000);
}

function endCombat(victory) {
  state.inCombat = false;
  document.getElementById('er-display').style.display = 'none';
  document.getElementById('momentum-display').style.display = 'none';

  if (victory) {
    state.momentum = Math.min(state.maxMomentum, state.momentum + 5);
    renderScene('banditVictory');
  } else {
    renderScene('banditDefeat');
  }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
  updateStats();
  renderScene('start');
});

