/* LANTERN DUEL — a 1v1 card duel of light and ash.
   Original game: four suits, lantern mana, Surge combos, guard creatures.
   No network, no libraries. Runs from static files. */
'use strict';

/* ---------------- suits ---------------- */
const SUITS = {
  ember: { name: 'Ember', color: '#c0392b', light: '#e74c3c',
    svg: '<svg viewBox="0 0 24 24"><path d="M12 2 C14 6 18 8 18 13 A6 6 0 0 1 6 13 C6 10 8 8 9 6 C10 8 11 9 12 9 C12 6 12 4 12 2 Z" fill="#e74c3c" stroke="#7b241c" stroke-width="1"/></svg>' },
  tide:  { name: 'Tide', color: '#2e5da8', light: '#4a90d9',
    svg: '<svg viewBox="0 0 24 24"><path d="M12 2 C12 2 5 11 5 15 A7 7 0 0 0 19 15 C19 11 12 2 12 2 Z" fill="#4a90d9" stroke="#1a3a66" stroke-width="1"/><path d="M9 15 a3 3 0 0 0 3 3" fill="none" stroke="#bcd6f5" stroke-width="1.4" stroke-linecap="round"/></svg>' },
  thorn: { name: 'Thorn', color: '#2e7d32', light: '#4caf50',
    svg: '<svg viewBox="0 0 24 24"><path d="M12 22 C12 14 12 8 12 2 C16 5 20 8 20 13 A8 8 0 0 1 12 22 Z" fill="#4caf50" stroke="#1b4d1f" stroke-width="1"/><path d="M12 22 C8 19 4 16 4 11 C8 12 11 15 12 18 Z" fill="#66bb6a" stroke="#1b4d1f" stroke-width="1"/></svg>' },
  gale:  { name: 'Gale', color: '#b5891d', light: '#f6c453',
    svg: '<svg viewBox="0 0 24 24"><path d="M3 8 H14 a3 3 0 1 0 -3 -3" fill="none" stroke="#f6c453" stroke-width="2.2" stroke-linecap="round"/><path d="M3 12 H18 a3 3 0 1 1 -3 3" fill="none" stroke="#e8a020" stroke-width="2.2" stroke-linecap="round"/><path d="M3 16 H10 a2.5 2.5 0 1 1 -2.5 2.5" fill="none" stroke="#f6c453" stroke-width="2.2" stroke-linecap="round"/></svg>' },
};

/* ---------------- card pool ---------------- */
/* type: creature | spell. effect kinds for spells:
   dmg n (target), face n (enemy hero), heal n, draw n, ramp n,
   boardDmg n (all enemy creatures), bounce (enemy creature to hand).
   onPlay: 'draw' — draw n when the creature enters. */
const CARDS = {
  wisp:     { name: 'Lantern Wisp',   suit: 'gale',  cost: 0, type: 'creature', atk: 1, hp: 1, text: 'A small light, freely given.' },
  imp:      { name: 'Cinder Imp',     suit: 'ember', cost: 1, type: 'creature', atk: 2, hp: 1, text: 'It giggles as it burns.' },
  sprite:   { name: 'Flame Sprite',   suit: 'ember', cost: 2, type: 'creature', atk: 3, hp: 2, kw: ['Swift'], text: 'Swift. Strikes the turn it arrives.' },
  ignite:   { name: 'Ignite',         suit: 'ember', cost: 1, type: 'spell', effect: 'dmg', n: 2, text: 'Deal 2 damage to a creature.' },
  fireball: { name: 'Fireball',       suit: 'ember', cost: 2, type: 'spell', effect: 'dmg', n: 3, text: 'Deal 3 damage to any target.' },
  knight:   { name: 'Ember Knight',   suit: 'ember', cost: 3, type: 'creature', atk: 3, hp: 4, text: 'His shield is still warm.' },
  inferno:  { name: 'Inferno',        suit: 'ember', cost: 4, type: 'spell', effect: 'face', n: 4, text: 'Deal 4 damage to the enemy hero.' },
  drake:    { name: 'Ash Drake',      suit: 'ember', cost: 5, type: 'creature', atk: 5, hp: 5, text: 'Where it lands, nothing grows.' },
  phoenix:  { name: 'Phoenix',        suit: 'ember', cost: 6, type: 'creature', atk: 6, hp: 6, kw: ['Swift'], text: 'Swift. From ash, it rises again.' },
  diver:    { name: 'Pearl Diver',    suit: 'tide',  cost: 1, type: 'creature', atk: 1, hp: 2, onPlay: 'draw', n: 1, text: 'Draw a card when played.' },
  caller:   { name: 'Tidecaller',     suit: 'tide',  cost: 2, type: 'creature', atk: 2, hp: 3, text: 'The sea answers her call.' },
  spring:   { name: 'Healing Spring', suit: 'tide',  cost: 2, type: 'spell', effect: 'heal', n: 5, text: 'Restore 5 life to your hero.' },
  oracle:   { name: 'Deep Oracle',    suit: 'tide',  cost: 3, type: 'creature', atk: 2, hp: 4, onPlay: 'draw', n: 1, text: 'Draw a card when played.' },
  riptide:  { name: 'Riptide',        suit: 'tide',  cost: 3, type: 'spell', effect: 'boardDmg', n: 2, text: 'Deal 2 damage to all enemy creatures.' },
  moonwell: { name: 'Moonwell',       suit: 'tide',  cost: 4, type: 'spell', effect: 'draw', n: 2, text: 'Draw 2 cards.' },
  bloom:    { name: 'Sporebloom',     suit: 'thorn', cost: 1, type: 'creature', atk: 1, hp: 3, kw: ['Guard'], text: 'Guard. Enemies must attack it first.' },
  guard:    { name: 'Bramble Guard',  suit: 'thorn', cost: 2, type: 'creature', atk: 2, hp: 4, kw: ['Guard'], text: 'Guard. Enemies must attack it first.' },
  whip:     { name: 'Thornwhip',      suit: 'thorn', cost: 2, type: 'spell', effect: 'dmg', n: 2, heal: 2, text: 'Deal 2 damage to a creature. Restore 2 life.' },
  warden:   { name: 'Rootwarden',     suit: 'thorn', cost: 3, type: 'creature', atk: 3, hp: 3, kw: ['Guard'], text: 'Guard. Enemies must attack it first.' },
  sentinel: { name: 'Oak Sentinel',   suit: 'thorn', cost: 4, type: 'creature', atk: 3, hp: 6, kw: ['Guard'], text: 'Guard. Enemies must attack it first.' },
  hawk:     { name: 'Zephyr Hawk',    suit: 'gale',  cost: 2, type: 'creature', atk: 3, hp: 1, kw: ['Swift'], text: 'Swift. Strikes the turn it arrives.' },
  gust:     { name: 'Gust',           suit: 'gale',  cost: 1, type: 'spell', effect: 'bounce', text: 'Return an enemy creature to its hand.' },
  tailwind: { name: 'Tailwind',       suit: 'gale',  cost: 2, type: 'spell', effect: 'ramp', n: 2, text: 'Gain 2 lanterns this turn.' },
  mistral:  { name: 'Mistral',        suit: 'gale',  cost: 3, type: 'spell', effect: 'draw', n: 2, text: 'Draw 2 cards.' },
  pirate:   { name: 'Sky Pirate',     suit: 'gale',  cost: 4, type: 'creature', atk: 4, hp: 4, text: 'He steals the wind itself.' },
  cyclone:  { name: 'Cyclone',        suit: 'gale',  cost: 5, type: 'spell', effect: 'boardDmg', n: 3, text: 'Deal 3 damage to all enemy creatures.' },
  serpent:  { name: 'Cloud Serpent',  suit: 'gale',  cost: 6, type: 'creature', atk: 7, hp: 5, kw: ['Swift'], text: 'Swift. Strikes the turn it arrives.' },
};
/* decklist: card id -> copies. 30 cards. */
const DECKLIST = {
  wisp: 1, imp: 2, sprite: 1, ignite: 1, fireball: 2, knight: 1, inferno: 1,
  drake: 1, phoenix: 1, diver: 1, caller: 1, spring: 1, oracle: 1, riptide: 1,
  moonwell: 1, bloom: 1, guard: 2, whip: 1, warden: 1, sentinel: 1,
  hawk: 1, gust: 1, tailwind: 1, mistral: 1, pirate: 1, cyclone: 1, serpent: 1,
};

/* ---------------- rng ---------------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rng = mulberry32((Math.random() * 1e9) | 0);
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function buildDeck() {
  const d = [];
  for (const [id, n] of Object.entries(DECKLIST))
    for (let i = 0; i < n; i++) d.push(id);
  return shuffle(d);
}

/* ---------------- sounds (WebAudio, no files) ---------------- */
const Sound = {
  ctx: null, muted: false,
  ensure() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ } }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(freq, dur, type, vol, when) {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime + (when || 0);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },
  play()   { this.ensure(); this.tone(520, 0.12, 'triangle', 0.12); this.tone(780, 0.14, 'triangle', 0.10, 0.07); },
  hit()    { this.ensure(); this.tone(180, 0.15, 'sawtooth', 0.10); this.tone(120, 0.18, 'square', 0.07, 0.03); },
  heal()   { this.ensure(); this.tone(660, 0.15, 'sine', 0.10); this.tone(880, 0.2, 'sine', 0.10, 0.09); },
  draw()   { this.ensure(); this.tone(440, 0.06, 'sine', 0.06); },
  surge()  { this.ensure(); this.tone(660, 0.1, 'triangle', 0.12); this.tone(880, 0.1, 'triangle', 0.12, 0.08); this.tone(1174, 0.16, 'triangle', 0.12, 0.16); },
  win()    { this.ensure(); [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.13, i * 0.13)); },
  lose()   { this.ensure(); [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.25, 'sine', 0.11, i * 0.15)); },
  turn()   { this.ensure(); this.tone(392, 0.08, 'sine', 0.07); },
};

/* ---------------- state ---------------- */
const MAX_HP = 30, MAX_MANA = 10, MAX_BOARD = 5, MAX_HAND = 10;
let uid = 1;
let S = null;          // game state
let fast = false;      // autopilot speed: no AI animation delays

function freshSide(name) {
  return { name, hp: MAX_HP, mana: 0, maxMana: 0, deck: buildDeck(),
           hand: [], board: [], fatigue: 0, suitsPlayed: {}, damageDealt: 0, cardsPlayed: 0 };
}
function newGame(seed) {
  if (seed !== undefined && seed !== null) rng = mulberry32(seed >>> 0);
  uid = 1;
  S = {
    turn: 1, phase: 'player', winner: null,
    you: freshSide('You'), opp: freshSide('Vex'),
    log: [], selCard: -1, selAttacker: -1, pendingSpell: null,
    stats: { turns: 0, damageDealt: 0, cardsPlayed: 0 },
  };
  for (let i = 0; i < 4; i++) { drawCard(S.you, true); drawCard(S.opp, true); }
  startTurn(S.you, true);
  logMsg('The duel begins. Your lanterns are lit.');
  render();
}
function drawCard(side, silent) {
  if (side.hand.length >= MAX_HAND) { if (!silent) logMsg(side.name + '’s hand is full — the card burns away.'); return null; }
  if (side.deck.length === 0) {
    side.fatigue++;
    side.hp -= side.fatigue;
    logMsg(side.name + ' draws from an empty deck and takes ' + side.fatigue + ' fatigue damage!');
    if (!silent) Sound.hit();
    checkEnd();
    return null;
  }
  const id = side.deck.pop();
  const card = { uid: uid++, id, ...CARDS[id], hpLeft: CARDS[id].hp || 0, summonedTurn: S.turn, attacked: false, canAttack: false };
  side.hand.push(card);
  if (!silent) Sound.draw();
  return card;
}
function startTurn(side, first) {
  side.maxMana = Math.min(MAX_MANA, first ? 1 : side.maxMana + 1);
  side.mana = side.maxMana;
  side.suitsPlayed = {};
  for (const c of side.board) { c.attacked = false; c.canAttack = c.summonedTurn < S.turn || (c.kw && c.kw.includes('Swift')); }
  if (!first) {
    drawCard(side);
    if (side === S.you) { S.stats.turns++; }
  }
}
function logMsg(m) {
  S.log.unshift(m);
  if (S.log.length > 40) S.log.pop();
  const el = document.getElementById('log');
  if (el) el.textContent = m;
}
function sleep(ms) { return new Promise(r => setTimeout(r, fast ? 0 : ms)); }
function other(side) { return side === S.you ? S.opp : S.you; }
function hasGuard(side) { return side.board.some(c => c.kw && c.kw.includes('Guard')); }

/* ---------------- playing cards ---------------- */
function canPlay(side, card) {
  if (card.type === 'creature' && side.board.length >= MAX_BOARD) return false;
  return side.mana >= card.cost;
}
function playCard(side, handIdx, target) {
  const card = side.hand[handIdx];
  if (!card || !canPlay(side, card)) return false;
  side.mana -= card.cost;
  side.hand.splice(handIdx, 1);
  side.cardsPlayed++;
  if (side === S.you) S.stats.cardsPlayed++;
  const suit = card.suit;
  const before = side.suitsPlayed[suit] || 0;
  side.suitsPlayed[suit] = before + 1;
  logMsg(side.name + ' play' + (side === S.you ? '' : 's') + ' ' + card.name + '.');
  Sound.play();
  if (card.type === 'creature') {
    side.board.push(card);
    if (card.onPlay === 'draw') { for (let i = 0; i < card.n; i++) drawCard(side); logMsg(card.name + ' draws a card.'); }
  } else {
    resolveSpell(side, card, target);
  }
  if (side.suitsPlayed[suit] === 2) {
    logMsg('SURGE! Two ' + SUITS[suit].name + ' cards in one turn — ' + side.name + ' draw' + (side === S.you ? '' : 's') + ' a card.');
    Sound.surge();
    if (side === S.you) flashSurge();
    drawCard(side);
  }
  checkEnd();
  render();
  return true;
}
function resolveSpell(side, card, target) {
  const foe = other(side);
  switch (card.effect) {
    case 'dmg': {
      if (!target) return;
      if (target === 'hero') damageHero(foe, card.n, side);
      else damageCreature(target, card.n, side);
      if (card.heal) healSide(side, card.heal);
      break;
    }
    case 'face': {
      damageHero(foe, card.n, side);
      break;
    }
    case 'heal': healSide(side, card.n); Sound.heal(); break;
    case 'draw': for (let i = 0; i < card.n; i++) drawCard(side); break;
    case 'ramp': side.mana += card.n; logMsg(side.name + ' gain' + (side === S.you ? '' : 's') + ' ' + card.n + ' lanterns.'); break;
    case 'boardDmg': {
      const victims = [...foe.board];
      for (const c of victims) damageCreature(c, card.n, side);
      break;
    }
    case 'bounce': {
      if (!target) return;
      const idx = foe.board.indexOf(target);
      if (idx >= 0) {
        foe.board.splice(idx, 1);
        if (foe.hand.length < MAX_HAND) { foe.hand.push(target); target.summonedTurn = S.turn; }
        logMsg(target.name + ' is blown back to its owner’s hand.');
      }
      break;
    }
  }
}
function damageCreature(card, n, bySide) {
  card.hpLeft -= n;
  if (bySide === S.you) S.stats.damageDealt += n;
  if (bySide) bySide.damageDealt += n;
  Sound.hit();
  const owner = S.you.board.includes(card) ? S.you : S.opp;
  logMsg(card.name + ' takes ' + n + ' damage.');
  if (card.hpLeft <= 0) {
    const i = owner.board.indexOf(card);
    if (i >= 0) owner.board.splice(i, 1);
    logMsg(card.name + ' is destroyed.');
  }
  checkEnd();
}
function damageHero(side, n, bySide) {
  side.hp -= n;
  if (bySide === S.you) S.stats.damageDealt += n;
  if (bySide) bySide.damageDealt += n;
  Sound.hit();
  logMsg(side.name + ' take' + (side === S.you ? '' : 's') + ' ' + n + ' damage.');
  checkEnd();
}
function healSide(side, n) {
  const real = Math.min(n, MAX_HP - side.hp);
  side.hp += real;
  logMsg(side.name + ' restore' + (side === S.you ? '' : 's') + ' ' + real + ' life.');
}

/* ---------------- combat ---------------- */
function canAttackWith(card) { return card.canAttack && !card.attacked; }
function attackWith(side, attacker, target) {
  if (!canAttackWith(attacker)) return false;
  const foe = other(side);
  if (target === 'hero') {
    if (hasGuard(foe)) return false;
    attacker.attacked = true;
    damageHero(foe, attacker.atk, side);
    logMsg(attacker.name + ' strikes ' + foe.name + ' for ' + attacker.atk + '.');
  } else {
    if (hasGuard(foe) && !(target.kw && target.kw.includes('Guard'))) return false;
    attacker.attacked = true;
    const back = target.atk;
    damageCreature(target, attacker.atk, side);
    if (target.hpLeft > 0 && back > 0) {
      damageCreature(attacker, back, foe);
      logMsg(target.name + ' fights back for ' + back + '.');
    } else {
      logMsg(attacker.name + ' strikes ' + target.name + ' for ' + attacker.atk + '.');
    }
  }
  Sound.hit();
  checkEnd();
  render();
  return true;
}

/* ---------------- turn flow ---------------- */
function endPlayerTurn() {
  if (!S || S.phase !== 'player' || S.winner) return;
  S.selCard = -1; S.selAttacker = -1; S.pendingSpell = null;
  S.phase = 'ai';
  logMsg('Vex takes the table…');
  render();
  aiTurn();
}
async function aiTurn() {
  await sleep(650);
  const me = S.opp, foe = S.you;
  startTurn(me);
  render();
  await sleep(500);
  // play cards: best value first, with a little chaos
  let guard = 0;
  while (guard++ < 12) {
    if (S.winner) return;
    const options = me.hand.map((c, i) => ({ c, i })).filter(o => canPlay(me, o.c));
    if (!options.length) break;
    options.sort((a, b) => valueOf(b.c, me, foe) - valueOf(a.c, me, foe));
    const pick = rng() < 0.15 ? options[Math.floor(rng() * options.length)] : options[0];
    const tgt = pickTargetFor(me, pick.c);
    if (pick.c.type === 'spell' && needsTarget(pick.c) && !tgt) continue;
    playCard(me, pick.i, tgt);
    await sleep(550);
    if (S.winner) return;
  }
  // attack with every ready creature
  for (const c of [...me.board]) {
    if (S.winner) return;
    if (!canAttackWith(c)) continue;
    const tgt = chooseAttackTarget(me, c);
    if (!tgt) continue;
    attackWith(me, c, tgt === 'hero' ? 'hero' : tgt);
    await sleep(550);
    if (S.winner) return;
  }
  await sleep(400);
  if (S.winner) return;
  S.turn++;
  S.phase = 'player';
  startTurn(S.you);
  logMsg('Your turn — ' + S.you.maxMana + ' lanterns.');
  Sound.turn();
  render();
}
function needsTarget(card) {
  return card.effect === 'dmg' || card.effect === 'bounce';
}
function pickTargetFor(side, card) {
  const foe = other(side);
  if (card.effect === 'dmg') {
    const killable = foe.board.filter(c => c.hpLeft <= card.n);
    if (killable.length) return killable.sort((a, b) => b.atk - a.atk)[0];
    if (foe.board.length && rng() < 0.55) return foe.board.sort((a, b) => b.atk - a.atk)[0];
    return 'hero';
  }
  if (card.effect === 'bounce') {
    if (!foe.board.length) return null;
    return foe.board.sort((a, b) => (b.atk + b.hpLeft) - (a.atk + a.hpLeft))[0];
  }
  return null;
}
function valueOf(card, me, foe) {
  let v = card.cost * 2 + (card.atk || 0) + (card.hpLeft || 0);
  if (card.effect === 'dmg') v += card.n * 2;
  if (card.effect === 'boardDmg') v += foe.board.length * card.n * 1.5;
  if (card.effect === 'draw') v += 3;
  if (card.effect === 'heal') v += me.hp < 15 ? 6 : 1;
  if (card.effect === 'bounce') v += foe.board.length ? 4 : -10;
  if (card.effect === 'ramp') v += 2;
  if (card.onPlay === 'draw') v += 2;
  if (card.kw && card.kw.includes('Guard')) v += 1.5;
  if (card.kw && card.kw.includes('Swift')) v += 1;
  if (card.cost > me.mana) v -= 100;
  return v + rng() * 1.5;
}
function chooseAttackTarget(me, attacker) {
  const foe = other(me);
  const guards = foe.board.filter(c => c.kw && c.kw.includes('Guard'));
  if (guards.length) {
    const killable = guards.filter(c => c.hpLeft <= attacker.atk);
    if (killable.length) return killable.sort((a, b) => b.atk - a.atk)[0];
    return guards.sort((a, b) => b.hpLeft - a.hpLeft)[0];
  }
  const lethal = foe.hp <= attacker.atk;
  if (lethal) return 'hero';
  // a good trade: kill something bigger and live
  const trades = foe.board.filter(c => c.hpLeft <= attacker.atk && c.atk < attacker.hpLeft);
  if (trades.length && rng() < 0.6) return trades.sort((a, b) => b.atk - a.atk)[0];
  return 'hero';
}
function checkEnd() {
  if (!S || S.winner) return;
  if (S.opp.hp <= 0 || S.you.hp <= 0) {
    S.winner = S.opp.hp <= 0 ? 'you' : 'opp';
    S.phase = 'over';
    if (S.winner === 'you') { Sound.win(); logMsg('Vex’s light goes out. You win the duel!'); }
    else { Sound.lose(); logMsg('Your lanterns gutter and die. Vex wins.'); }
    render();
    showEnd();
  }
}

/* ---------------- rendering ---------------- */
const $ = id => document.getElementById(id);
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

function cardEl(card, opts) {
  const suit = SUITS[card.suit];
  const el = document.createElement('div');
  el.className = 'card suit-' + card.suit + (card.type === 'spell' ? ' spell' : '') + (opts.onBoard ? ' on-board' : '');
  if (opts.playable) el.classList.add('playable');
  if (opts.selected) el.classList.add('selected');
  if (opts.canAttack) el.classList.add('can-attack');
  if (opts.attacking) el.classList.add('attacking');
  if (opts.targetable) el.classList.add('targetable');
  if (opts.exhausted) el.classList.add('exhausted');
  if (opts.unaffordable) el.classList.add('unaffordable');
  let inner = '<div class="cost">' + card.cost + '</div>';
  if (card.kw && card.kw.length) inner += '<div class="kw">' + card.kw[0].toUpperCase() + '</div>';
  inner += '<div class="suit-emblem">' + suit.svg + '</div>';
  inner += '<div class="card-name">' + esc(card.name) + '</div>';
  inner += '<div class="card-text">' + esc(card.text) + '</div>';
  inner += '<div class="suit-tag">' + suit.name + '</div>';
  if (card.type === 'creature') {
    inner += '<div class="atk">' + card.atk + '</div>';
    inner += '<div class="hp">' + card.hpLeft + '</div>';
  }
  el.innerHTML = inner;
  el.dataset.uid = card.uid;
  return el;
}
function manaPips(el, mana, maxMana) {
  el.innerHTML = '';
  for (let i = 0; i < maxMana; i++) {
    const p = document.createElement('span');
    p.className = 'mana-pip' + (i < mana ? ' full' : '');
    el.appendChild(p);
  }
  const t = document.createElement('span');
  t.style.cssText = 'font-size:11px;color:#f6c453;margin-left:4px';
  t.textContent = mana + ' / ' + maxMana + ' lanterns';
  el.appendChild(t);
}
function render() {
  if (!S) return;
  // hero panels
  $('you-hp-fill').style.width = Math.max(0, S.you.hp / MAX_HP * 100) + '%';
  $('you-hp-text').textContent = Math.max(0, S.you.hp) + ' / ' + MAX_HP;
  $('opp-hp-fill').style.width = Math.max(0, S.opp.hp / MAX_HP * 100) + '%';
  $('opp-hp-text').textContent = Math.max(0, S.opp.hp) + ' / ' + MAX_HP;
  manaPips($('you-mana'), S.you.mana, S.you.maxMana);
  manaPips($('opp-mana'), S.opp.mana, S.opp.maxMana);
  $('you-deck-count').textContent = S.you.deck.length;
  $('opp-deck-count').textContent = S.opp.deck.length;
  document.querySelector('.hero-card.you').classList.toggle('active-turn', S.phase === 'player');
  document.querySelector('.hero-card.opp').classList.toggle('active-turn', S.phase === 'ai');
  // turn badge + end turn
  const badge = $('turn-badge');
  badge.textContent = S.phase === 'player' ? 'Your turn' : S.phase === 'ai' ? 'Vex is playing…' : S.phase;
  badge.classList.toggle('enemy', S.phase === 'ai');
  $('btn-end-turn').disabled = S.phase !== 'player';
  // opponent hand (card backs)
  const oh = $('opp-hand'); oh.innerHTML = '';
  for (let i = 0; i < S.opp.hand.length; i++) {
    const b = document.createElement('div');
    b.className = 'mini-card';
    oh.appendChild(b);
  }
  // boards
  renderBoard($('opp-board'), S.opp, false);
  renderBoard($('player-board'), S.you, true);
  // player hand
  const ph = $('player-hand'); ph.innerHTML = '';
  S.you.hand.forEach((card, i) => {
    const el = cardEl(card, {
      playable: S.phase === 'player' && canPlay(S.you, card),
      selected: S.selCard === i,
      unaffordable: S.phase === 'player' && !canPlay(S.you, card),
    });
    el.addEventListener('click', () => onHandClick(i));
    ph.appendChild(el);
  });
  // targeting highlights on opponent side
  if (S.selAttacker >= 0 || S.pendingSpell) {
    const foe = S.opp;
    const guardOn = hasGuard(foe);
    [...$('opp-board').children].forEach(el => {
      const card = foe.board.find(c => String(c.uid) === el.dataset.uid);
      if (!card) return;
      const isGuard = card.kw && card.kw.includes('Guard');
      if (S.pendingSpell) {
        if (S.pendingSpell.effect === 'dmg' || S.pendingSpell.effect === 'bounce') el.classList.add('targetable');
      } else if (guardOn ? isGuard : true) {
        el.classList.add('targetable');
      }
    });
    if (S.pendingSpell && S.pendingSpell.effect === 'dmg') {
      document.querySelector('.hero-card.opp').classList.add('targetable');
    } else if (S.selAttacker >= 0 && !guardOn) {
      document.querySelector('.hero-card.opp').classList.add('targetable');
    }
  } else {
    document.querySelector('.hero-card.opp').classList.remove('targetable');
  }
}
function renderBoard(container, side, isYou) {
  container.innerHTML = '';
  if (!side.board.length) {
    const n = document.createElement('span');
    n.className = 'empty-note';
    n.textContent = isYou ? 'Your creatures gather here' : 'Vex’s creatures gather here';
    container.appendChild(n);
    return;
  }
  side.board.forEach((card, i) => {
    const el = cardEl(card, {
      onBoard: true,
      canAttack: isYou && S.phase === 'player' && canAttackWith(card),
      attacking: isYou && S.selAttacker === i,
      exhausted: isYou && !canAttackWith(card),
    });
    if (isYou) el.addEventListener('click', () => onBoardClick(i));
    else el.addEventListener('click', () => onEnemyBoardClick(card));
    container.appendChild(el);
  });
}
function flashSurge() {
  const b = $('surge-banner');
  b.classList.remove('hidden');
  setTimeout(() => b.classList.add('hidden'), 2200);
}

/* ---------------- interaction ---------------- */
function onHandClick(i) {
  if (!S || S.phase !== 'player' || S.winner) return;
  Sound.ensure();
  const card = S.you.hand[i];
  if (!card) return;
  if (S.selCard === i) { S.selCard = -1; S.pendingSpell = null; render(); return; }
  if (!canPlay(S.you, card)) { logMsg(card.name + ' costs ' + card.cost + ' lanterns — you have ' + S.you.mana + '.'); render(); return; }
  if (card.type === 'spell' && needsTarget(card)) {
    S.selCard = i; S.pendingSpell = card;
    logMsg('Choose a target for ' + card.name + '.');
    render();
    return;
  }
  playCard(S.you, i, card.effect === 'dmg' ? 'hero' : null);
}
function onBoardClick(i) {
  if (!S || S.phase !== 'player' || S.winner) return;
  Sound.ensure();
  const card = S.you.board[i];
  if (!card) return;
  if (S.selCard >= 0) { S.selCard = -1; S.pendingSpell = null; render(); return; }
  if (!canAttackWith(card)) { logMsg(card.name + ' cannot attack yet.'); render(); return; }
  S.selAttacker = S.selAttacker === i ? -1 : i;
  if (S.selAttacker >= 0) logMsg(card.name + ' is ready — choose a target.');
  render();
}
function onEnemyBoardClick(card) {
  if (!S || S.phase !== 'player' || S.winner) return;
  if (S.pendingSpell) {
    const idx = S.selCard;
    const spell = S.pendingSpell;
    S.selCard = -1; S.pendingSpell = null;
    playCard(S.you, idx, card);
    return;
  }
  if (S.selAttacker >= 0) {
    const attacker = S.you.board[S.selAttacker];
    S.selAttacker = -1;
    if (attacker) attackWith(S.you, attacker, card);
  }
}
function onEnemyHeroClick() {
  if (!S || S.phase !== 'player' || S.winner) return;
  if (S.pendingSpell && S.pendingSpell.effect === 'dmg') {
    const idx = S.selCard;
    S.selCard = -1; S.pendingSpell = null;
    playCard(S.you, idx, 'hero');
    return;
  }
  if (S.selAttacker >= 0) {
    const attacker = S.you.board[S.selAttacker];
    S.selAttacker = -1;
    if (attacker) attackWith(S.you, attacker, 'hero');
  }
}

/* ---------------- end screen ---------------- */
function showEnd() {
  const win = S.winner === 'you';
  $('end-title').textContent = win ? 'VICTORY' : 'DEFEAT';
  $('end-title').classList.toggle('lose', !win);
  $('end-sub').textContent = win
    ? 'The Ash Herald’s light goes out. The lanterns burn for you.'
    : 'Vex snuffs your last lantern. The table goes dark.';
  $('end-stats').innerHTML =
    '<div><b>' + S.stats.turns + '</b>turns</div>' +
    '<div><b>' + S.stats.cardsPlayed + '</b>cards played</div>' +
    '<div><b>' + S.stats.damageDealt + '</b>damage dealt</div>' +
    '<div><b>' + Math.max(0, S.you.hp) + '</b>life left</div>';
  $('end-screen').classList.remove('hidden');
}

/* ---------------- wiring ---------------- */
function wire() {
  $('btn-play').addEventListener('click', () => {
    Sound.ensure(); Sound.play();
    $('title-screen').classList.add('hidden');
    newGame();
  });
  $('btn-again').addEventListener('click', () => {
    Sound.ensure();
    $('end-screen').classList.add('hidden');
    $('title-screen').classList.remove('hidden');
  });
  $('btn-end-turn').addEventListener('click', endPlayerTurn);
  $('btn-restart').addEventListener('click', () => {
    if (!S) return;
    $('end-screen').classList.add('hidden');
    $('title-screen').classList.remove('hidden');
    S = null;
  });
  $('btn-help').addEventListener('click', () => $('help-screen').classList.remove('hidden'));
  $('btn-close-help').addEventListener('click', () => $('help-screen').classList.add('hidden'));
  $('btn-sound').addEventListener('click', () => {
    Sound.muted = !Sound.muted;
    $('btn-sound').textContent = Sound.muted ? '🔇' : '🔊';
  });
  document.querySelector('.hero-card.opp').addEventListener('click', onEnemyHeroClick);
  document.addEventListener('keydown', e => {
    if (e.key === ' ' && S && S.phase === 'player') { e.preventDefault(); endPlayerTurn(); }
    if (e.key === 'Escape') { S.selCard = -1; S.selAttacker = -1; S.pendingSpell = null; render(); }
  });
}

/* ---------------- autopilot (drives real games for playtests) ---------------- */
function autoPlayerTurn(skill) {
  // skill: 'good' plays value-first, 'random' plays at random, 'passive' plays nothing
  if (!S || S.phase !== 'player' || S.winner) return;
  const me = S.you, foe = S.opp;
  if (skill === 'passive') { endPlayerTurn(); return; }
  let guard = 0;
  while (guard++ < 12 && !S.winner) {
    const options = me.hand.map((c, i) => ({ c, i })).filter(o => canPlay(me, o.c));
    if (!options.length) break;
    let pick;
    if (skill === 'random') pick = options[Math.floor(rng() * options.length)];
    else {
      options.sort((a, b) => valueOf(b.c, me, foe) - valueOf(a.c, me, foe));
      pick = rng() < 0.1 ? options[Math.floor(rng() * options.length)] : options[0];
    }
    if (pick.c.type === 'spell' && needsTarget(pick.c)) {
      const tgt = pickTargetFor(me, pick.c);
      if (!tgt) break;
      playCard(me, pick.i, tgt);
    } else {
      playCard(me, pick.i, null);
    }
  }
  for (const c of [...me.board]) {
    if (S.winner) break;
    if (!canAttackWith(c)) continue;
    const tgt = skill === 'random'
      ? (hasGuard(foe) ? foe.board.find(x => x.kw && x.kw.includes('Guard')) : (rng() < 0.5 ? 'hero' : foe.board[0] || 'hero'))
      : chooseAttackTarget(me, c);
    if (!tgt) continue;
    attackWith(me, c, tgt === 'hero' ? 'hero' : tgt);
  }
  if (!S.winner && S.phase === 'player') endPlayerTurn();
}
async function autoGame(skill, maxTurns) {
  fast = true;
  const limit = maxTurns || 60;
  while (!S.winner && S.turn <= limit) {
    if (S.phase === 'player') autoPlayerTurn(skill);
    await sleep(120);
  }
  fast = false;
  return { winner: S.winner, turn: S.turn, youHp: S.you.hp, oppHp: S.opp.hp };
}

/* ---------------- boot ---------------- */
function boot() {
  const params = new URLSearchParams(location.search);
  const seed = params.get('seed');
  if (seed !== null) rng = mulberry32(parseInt(seed, 10) || 0);
  if (params.get('fast') === '1') fast = true;
  wire();
  // show a dressed table behind the title screen
  newGame();
  $('title-screen').classList.remove('hidden');
}
window.LD = {
  newGame, autoGame, autoPlayerTurn,
  status: () => S ? { phase: S.phase, winner: S.winner, turn: S.turn,
    youHp: S.you.hp, oppHp: S.opp.hp, youHand: S.you.hand.length, oppHand: S.opp.hand.length,
    youBoard: S.you.board.length, oppBoard: S.opp.board.length } : null,
  setFast: v => { fast = !!v; },
  state: () => S,
};
document.addEventListener('DOMContentLoaded', boot);
