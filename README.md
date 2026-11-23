[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/riskiozora12/makefun-card-game-01/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/riskiozora12/makefun-card-game-01/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

# Lantern Duel — a card duel of light and ash

A complete, original 1-v-1 card game that plays offline in a desktop browser.
You are the Lanternkeeper; Vex, the Ash Herald, wants your light out. Both
sides have 30 life and a deck of 30 cards across four suits — Ember, Tide,
Thorn and Gale. Each turn you gain another lantern (up to 10) and they refill;
every card costs lanterns.

## How it plays

- **Creatures** go on your board and fight. Click one of your creatures, then
  click an enemy creature or Vex himself to attack. Creatures fight back when
  attacked, and can attack from the turn after they are played — unless they
  have **Swift**.
- **Spells** strike at once: damage, healing, card draw, extra lanterns,
  board clears, and Gust, which blows an enemy creature back to its hand.
- **Guard** (Thorn) creatures must be attacked before anything else.
- **Surge:** play two cards of the same suit in one turn and you draw a card.
- **Fatigue:** when your deck runs out, every draw hurts — 1, then 2, then 3…
- Reduce Vex to 0 life to win. If your life hits 0, the table goes dark.

The AI opponent plays its own cards and attacks with a value-first heuristic
(trades, guard priority, lethal checks), with a little chaos so no two duels
play the same. A full duel lasts about 7–13 turns. Sound is synthesized in
code (WebAudio, no files) with a mute button; Space ends your turn.

## Run it

Serve `game/` with any static server and open `game/index.html` in desktop
Chrome — no build step, no network:

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080
```

Hand the entry in with the program at the root:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored make.fun library.

## Playtested

Sixteen full autopilot duels (seeded, scripted play through the real game):
9 wins, 7 losses, 0 unfinished, 0 script errors. A good line wins about
half its games against Vex; a random line loses most of them. Screenshots are
real renders of the game's own code: title screen, mid-duel table, victory,
and defeat.

## Entry

Built for the make.fun bounty
[best-card-game-20261122-1826](https://make.fun/bounty/best-card-game-20261122-1826) —
"Make the best card game". Pot $50, 10 paid places.

https://make.fun/?ref=wt28nn7m
