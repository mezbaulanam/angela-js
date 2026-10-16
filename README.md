# Angela TypeScript & JavaScript SDK (`angela-sdk`)

The official TypeScript and JavaScript SDK for building cartridges in the **Angela Games Ecosystem**.

Angela games run as deterministic WebAssembly cartridges in Discord servers. The SDK works natively with both **ECMAScript Modules** (`import`) and **CommonJS** (`require`), providing 100% full type definitions, auto-completion, and camelCase / snake_case method aliases.

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
   - [TypeScript (ESM)](#typescript-esm)
   - [JavaScript (CommonJS)](#javascript-commonjs)
3. [Architecture & How It Works](#architecture--how-it-works)
4. [Application Lifecycle & Event Routing](#application-lifecycle--event-routing)
5. [The Game Context (`ctx`)](#the-game-context-ctx)
6. [Economy & Multi-Currency System](#economy--multi-currency-system)
7. [Inventory & Items](#inventory--items)
8. [UI Engine](#ui-engine)
   - [Universal Render (`ctx.ui.render`)](#universal-render)
   - [Components V2](#components-v2)
   - [Classic Embeds](#classic-embeds)
   - [Modals & Ephemeral Feedback](#modals--ephemeral-feedback)
9. [2D Canvas Graphics Engine](#2d-canvas-graphics-engine)
   - [Layers & Static Layer Caching](#layers--static-layer-caching)
   - [Complete Drawing API Reference](#complete-drawing-api-reference)
10. [Multiplayer & Lobbies](#multiplayer--lobbies)
11. [AI & Media Gateways](#ai--media-gateways)
12. [HTTP & Discord Utilities](#http--discord-utilities)
13. [Cartridge Project Layout & CLI](#cartridge-project-layout--cli)

---

## Installation

```bash
npm install angela-sdk
```

Or with Yarn / pnpm:

```bash
yarn add angela-sdk
# or
pnpm add angela-sdk
```

Zero external production dependencies. Requires Node 18+ for local tooling.

---

## Quick Start

### TypeScript (ESM)

In `src/index.ts`:

```typescript
import { Game, Button, type Context } from "@angela/sdk";

const game = new Game("dice_game");

game.onCommand((ctx: Context) => {
  ctx.state.rolls = (ctx.state.rolls as number || 0);

  ctx.ui.render({
    title: "🎲 Angela Dice Challenge",
    subtitle: `Host: ${ctx.user.name}`,
    bodyLines: [
      "Roll the dice to win server currency!",
      `You have rolled ${ctx.state.rolls} times so far.`
    ],
    buttons: [
      new Button({ customId: "roll_btn", label: "Roll (5 Coins)", style: "primary", emoji: "🎲" }),
      new Button({ customId: "cash_out", label: "Cash Out", style: "danger", emoji: "💰" }),
    ]
  });
});

game.onButton("roll_btn", (ctx: Context) => {
  const score = Math.floor(Math.random() * 6) + 1;
  ctx.state.rolls = ((ctx.state.rolls as number) || 0) + 1;

  // Award server's configured game currency
  const reward = score * 10;
  ctx.economy.give(ctx.user.id, reward, `Rolled a ${score}!`);

  ctx.ui.render({
    title: "🎲 Nice Roll!",
    bodyLines: [
      `You rolled a **${score}**!`,
      `Earned: **+${reward} ${ctx.config.currency_name || "Coins"}**`
    ],
    buttons: [
      new Button({ customId: "roll_btn", label: "Roll Again", style: "primary", emoji: "🎲" }),
      new Button({ customId: "cash_out", label: "Finish", style: "secondary" }),
    ]
  });
});

game.onButton("cash_out", (ctx: Context) => {
  ctx.finish();
  ctx.ui.render({
    title: "🏆 Game Over",
    bodyLines: [
      `Thanks for playing, ${ctx.user.name}!`,
      `Total rolls: ${ctx.state.rolls || 0}`
    ]
  });
});

// Angela calls handle with the JSON event string
export function handle(eventStr: string): string {
  const res = game.handleSync(JSON.parse(eventStr));
  return JSON.stringify(res);
}
```

### JavaScript (CommonJS)

In `main.js`:

```javascript
const { Game, Button } = require("@angela/sdk");

const game = new Game("coin_toss");

game.onCommand((ctx) => {
  ctx.ui.render({
    title: "🪙 Coin Flip",
    bodyLines: ["Pick heads or tails:"],
    buttons: [
      new Button({ customId: "heads", label: "Heads", style: "primary" }),
      new Button({ customId: "tails", label: "Tails", style: "secondary" })
    ]
  });
});

game.onButton("heads", (ctx) => {
  const won = Math.random() > 0.5;
  if (won) {
    ctx.economy.give(ctx.user.id, 50, "Won coin toss!");
    ctx.ui.replyEphemeral("🎉 You won 50 coins!");
  } else {
    ctx.ui.replyEphemeral("😢 Landed on tails! Better luck next time.");
  }
});

function handle(eventStr) {
  return JSON.stringify(game.handleSync(JSON.parse(eventStr)));
}

module.exports = { handle };
```

---

## Architecture & How It Works

Angela games use a **declarative intent-based architecture**:

1. **Incoming Event**: When a player clicks a button, invokes a slash command, or submits a modal, Angela formats the interaction into an event and passes it to your cartridge's `handle(event)` function.
2. **Context Creation**: The SDK converts the raw payload into a type-safe `Context` (`ctx`) object containing player information, session state, user inputs, and server slot configuration.
3. **Intent Accumulation**: Your handlers mutate `ctx.state` and call sub-APIs (such as `ctx.economy.give()`, `ctx.ui.render()`, or `ctx.canvas.create()`). These calls do not make external HTTP requests; they record **intents** into an execution plan.
4. **Response Execution**: The SDK serializes the resulting state and accumulated intents back to Angela. The host validates balances, draws graphics, commits database updates atomically, and renders the Discord response.

This ensures game cartridges remain lightning-fast, sandboxed, and testable offline with `angela dev`.

---

## Application Lifecycle & Event Routing

### Event Listeners

Register event handlers on your `Game` instance:

```typescript
const game = new Game("my_cartridge");

// Primary slash command
game.onCommand((ctx) => { ... });

// Subcommands: /game duel
game.onCommand("duel", (ctx) => { ... });

// Button clicks by customId
game.onButton("attack_btn", (ctx) => { ... });

// Select menus by customId
game.onSelect("class_picker", (ctx) => { ... });

// Modal form submissions
game.onModal("character_creation", (ctx) => { ... });

// Chat message events
game.onMessage((ctx) => { ... });

// Resumed session wake after hibernation
game.onWake("boss_turn", (ctx) => { ... });

// Asynchronous host callbacks (AI, HTTP, GIF search)
game.onCallback("on_story_ready", (ctx) => { ... });

// Default fallback handler
game.default((ctx) => { ... });
```

### Session States & Lifecycle Control

- `ctx.status`: Current session status (`"ACTIVE"`, `"SLEEPING"`, `"PAUSED"`, `"FINISHED"`).
- `ctx.finish()`: Completes the session. Angela archives session memory.
- `ctx.pause()`: Pauses player interaction until resumed.
- `ctx.nextRound()` / `ctx.next_round()`: Increments `ctx.round` and returns the new round number.
- `ctx.sleep(seconds, callback)`: Pauses session execution. When `seconds > 3`, the session hibernates; Angela schedules a timer and re-awakens your game at `game.onWake(callback)`.

---

## The Game Context (`ctx`)

Passed as the primary argument to all registered handlers:

### Metadata & User Info

- `ctx.user.id`: Discord user ID (`number`).
- `ctx.user.name`: Discord username (`string`).
- `ctx.user.avatarUrl`: Discord avatar URL (`string`).
- `ctx.hostId`: User ID of the session creator (`number`).
- `ctx.guildId`: Server guild ID (`number`).
- `ctx.channelId`: Channel ID (`number`).
- `ctx.eventType`: Event category (`"COMMAND"`, `"BUTTON"`, `"SELECT"`, `"MODAL"`, etc.).
- `ctx.eventId`: Component customId or subcommand name (`string`).

### User Arguments (`ctx.args`)

- `ctx.args.subcommand`: Subcommand string (if any).
- `ctx.args.rawArgs`: Raw unparsed command arguments string.
- `ctx.args.targetUserId`: Mentioned user ID (`number | null`).
- `ctx.args.selectValues`: Array of selected menu values (`string[]`).
- `ctx.args.modalInputs`: Key-value map of submitted modal inputs (`Record<string, string>`).
- `ctx.args.messageContent`: Message text when listening to channel chat.
- `ctx.args.callbackData`: Payload returned by host callbacks.

### Session State (`ctx.state`)

`ctx.state` is a JavaScript object automatically saved and restored across turns:

```typescript
ctx.state.score = (ctx.state.score as number || 0) + 10;
ctx.state.inventory = ["iron_sword", "healing_herb"];
```

### Slot Configuration (`ctx.config`)

Read-only object containing server admin overrides merged with your cartridge's `manifest.json` schema:

```typescript
const currencyName = ctx.config.currency_name || "Coins";
const currencyEmoji = ctx.config.currency_emoji || "🪙";
const maxTries = Number(ctx.config.max_tries || 3);
```

### Slot Secrets (`ctx.secrets`)

Read-only object containing private slot credentials (such as API keys). Secrets are kept private to the host and never written to game state.

### Persistent Player Storage (`ctx.storage`)

Store game-scoped persistent player progress and manage cooldowns:

```typescript
// Read and write game-scoped player storage
const bestScore = ctx.storage.get("best_score", 0);
ctx.storage.set("best_score", Math.max(bestScore, currentScore));

// Enforce a 60-second cooldown on the player
ctx.storage.setCooldown(ctx.user.id, 60);
```

---

## Economy & Multi-Currency System

Angela provides a server-backed economy engine. Cartridges emit declarative intents; Angela safely executes balance deductions and credits.

### Server Currency Integration

Every Discord server chooses its preferred game currency on the game slot (e.g. `"Shells"`, `"Coins"`, `"Gems"`). By default, omitting `currency` automatically targets whichever currency the server administrator has chosen:

```typescript
// Query balance in the server's default currency
ctx.economy.getBalance(ctx.user.id);

// Deduct entry fee
ctx.economy.take(ctx.user.id, 25, "Tournament entry fee");

// Award rewards with optional safety bounds
ctx.economy.give(ctx.user.id, 100, "Victory prize", {
  clampMin: 0,
  clampMax: 500
});
```

### Explicit Multi-Currency

For trading games or multi-currency ecosystems, pass a specific currency name:

```typescript
// Target specific currency by string or options object
ctx.economy.getBalance(ctx.user.id, "Gems");
ctx.economy.give(ctx.user.id, 10, "Daily bonus", { currency: "Gems" });
ctx.economy.take(ctx.user.id, 50, "Market trade", "Gold");
```

### Escrow (Wagers & Duels)

Lock currency during matches. Angela holds the funds in escrow and refunds them automatically if an invitation expires or is declined:

```typescript
// Lock wager into escrow
ctx.economy.escrowLock(ctx.user.id, 50, "Match wager");

// Release funds to winner
ctx.economy.escrowRelease(winnerId, 100, "Won wager match");

// Refund participants on draw or cancellation
ctx.economy.escrowRefund(ctx.user.id, 50, "Match cancelled");
```

### Auto-Buy Items

Automatically deduct currency to purchase consumable items if a player is missing them:

```typescript
ctx.economy.autoBuy(ctx.user.id, ["fishing_bait", "health_potion"], 5);
```

---

## Inventory & Items

### Server Items

```typescript
// Query player inventory
ctx.inventory.getServerItems(ctx.user.id);

// Consume a usable server item
ctx.inventory.consumeServerItem(ctx.user.id, "potion_mana", 1);

// Award a server item
ctx.inventory.giveServerItem(ctx.user.id, "badge_champion", 1);

// Roll item break / wear chance (e.g. 5% break chance)
ctx.inventory.rollBreak(ctx.user.id, "fishing_rod", 0.05);
```

### Game-Scoped Sub-Inventory

Store game-specific loot (e.g. caught fish, crafted runes, collected cards) without cluttering the server's global item catalog:

```typescript
ctx.inventory.addSubItem(ctx.user.id, "sapphire_sardine", 1);
ctx.inventory.removeSubItem(ctx.user.id, "sapphire_sardine", 1);
```

---

## UI Engine

### Universal Render

`ctx.ui.render()` compiles your layout automatically into the mode configured by the server (`AUTO`, `CV2`, or `CLASSIC_EMBED`):

```typescript
import { Button } from "@angela/sdk";

ctx.ui.render({
  title: "⚔️ Boss Raid: Abyssal Hydra",
  subtitle: "Turn 3 — Party HP: 84%",
  bodyLines: [
    "The Hydra prepares a toxic tidal wave!",
    "Select your tactical stance:"
  ],
  thumbnail: "https://example.com/hydra.png",
  accentColor: 0x9B59B6,
  buttons: [
    new Button({ customId: "shield", label: "Raise Shield", style: "primary", emoji: "🛡️" }),
    new Button({ customId: "dodge", label: "Dodge", style: "secondary", emoji: "💨" }),
    new Button({ customId: "heal", label: "Cast Heal", style: "success", emoji: "✨" }),
  ]
});
```

### Components V2

Build modular layouts using modern Discord containers:

```typescript
import {
  Container,
  Section,
  TextDisplay,
  Thumbnail,
  Separator,
  ActionRow,
  Button
} from "@angela/sdk";

const container = new Container({ accentColor: "#5865F2" })
  .add(
    new Section({
      textDisplays: [
        new TextDisplay("## 🏆 Arena Leaderboard"),
        new TextDisplay("Top contenders of the current season:")
      ],
      accessory: new Thumbnail("https://example.com/trophy.png")
    })
  )
  .add(new Separator({ divider: true }))
  .add(
    new ActionRow([
      new Button({ customId: "prev", label: "Previous", style: "secondary" }),
      new Button({ customId: "next", label: "Next", style: "primary" })
    ])
  );

ctx.ui.renderCv2(container);
```

### Classic Embeds

```typescript
import { Embed, Button } from "@angela/sdk";

const embed = new Embed({
  title: "🎣 Catch of the Day",
  description: "Here is your haul from the reef:",
  color: 0x3498DB
})
  .addField("Species", "Golden Dorado", true)
  .addField("Weight", "7.8 kg", true)
  .addField("Bounty", "80 Shells", true);

ctx.ui.renderEmbed(embed, [
  new Button({ customId: "fish_again", label: "Cast Again", style: "primary", emoji: "🎣" })
]);
```

### Modals & Ephemeral Feedback

```typescript
import { TextInput } from "@angela/sdk";

// Open modal
game.onButton("open_wager", (ctx) => {
  ctx.ui.openModal("Place Wager", [
    new TextInput({
      customId: "wager_val",
      label: "Wager Amount",
      placeholder: "e.g. 100",
      required: true,
      maxLength: 6
    })
  ], "wager_submitted");
});

// Receive modal submission
game.onModal("wager_submitted", (ctx) => {
  const amount = Number(ctx.args.modalInputs.wager_val || 0);
  ctx.economy.take(ctx.user.id, amount, "Wager placed");
  ctx.ui.replyEphemeral(`Locked in your wager of **${amount} coins**!`);
});
```

---

## 2D Canvas Graphics Engine

Angela includes a declarative 2D graphics engine. You construct scenes with layers and primitives; Angela renders them into PNGs (or animated GIFs/WebPs) attached directly to your message.

### Creating a Scene

```typescript
const scene = ctx.canvas.create({
  width: 640,
  height: 360,
  animated: false,
  filename: "game_screen.png"
});
```

### Layers & Static Layer Caching

Setting a `cacheKey` on static background layers caches the rendered graphic on disk — future turns skip all background pixel rendering and composite dynamic elements directly on top:

```typescript
import { Button } from "@angela/sdk";

// Static background layer (cached on disk)
const bg = scene.layer("background", "ocean_base_v1");
bg.linearGradient([0, 0, 640, 360], [15, 25, 60], [230, 120, 60], 1.2);
bg.celestialBody(320, 120, 22, 75, [255, 240, 200], [255, 180, 70, 80]);
bg.sineWaves(180, 280, 8, [255, 255, 255, 50]);
bg.vignette(40, 1.1);

// Dynamic entities layer (drawn fresh each turn)
const entities = scene.layer("dynamic_entities");
entities.radialGlow(300, 180, 35, [255, 215, 0], 50);
entities.sprite("fish_gold.png", 300, 180, 64, 64);
entities.avatar(ctx.user.id, 40, 40, 64, true, [255, 215, 0], 2);
entities.roundedRect([20, 300, 620, 345], 8, [15, 20, 35, 200], [255, 255, 255, 60]);
entities.progressBar([35, 312, 250, 332], 75, 100, [30, 30, 45], [87, 242, 135], 5);
entities.textBox([300, 310, 600, 340], "Reeling in catch...", "bold", 14, [255, 255, 255]);

// Attach canvas scene to UI render
ctx.ui.render({
  title: "Ocean Explorer",
  image: scene,
  buttons: [new Button({ customId: "reel", label: "Reel!", style: "success" })]
});
```

### Complete Drawing API Reference

| Method | Parameters | Description |
|--------|------------|-------------|
| `linearGradient` | `rect, startRgb, endRgb, gamma?` | Vertical linear color blend |
| `celestialBody` | `x, y, radius, glowRadius, color, glowColor` | Sun, moon, or glowing orb with smooth radial glow |
| `sineWaves` | `yStart, yEnd, count, color` | Procedural ocean waves or stylized horizon curves |
| `proceduralPalm` | `x, yBottom, yTop, seed?` | Procedural beach palm tree silhouette |
| `vignette` | `depth, intensity` | Smooth dark edges around canvas border |
| `radialGlow` | `x, y, radius, color, maxAlpha?` | Soft radial light halo |
| `sprite` | `assetKey, x, y, maxW?, maxH?, anchor?, flipX?, rotation?` | Draws a PNG image from your cartridge `./assets/` |
| `avatar` | `userId, x, y, size?, circular?, borderColor?, borderWidth?` | Draws any player's Discord avatar with optional border |
| `polygon` | `points, fill?, outline?` | Multi-point closed polygon |
| `line` | `points, color, width?` | Multi-segment line stroke |
| `arc` | `bbox, startDeg, endDeg, color, width?` | Elliptical or circular arc |
| `roundedRect` | `rect, radius, fill?, outline?, width?` | Smooth rounded box with optional stroke |
| `progressBar` | `rect, value, maxValue, bgColor, fillColor, radius?` | Filled progress gauge for HP, XP, or timer |
| `textBox` | `rect, text, font?, size?, color?, maxLines?, lineHeight?` | Text box with word wrapping |

---

## Multiplayer & Lobbies

### Turnkey Join Lobby

```typescript
game.onCommand((ctx) => {
  ctx.lobby.createJoinLobby({
    maxPlayers: 16,
    duration: 60,
    onStart: "on_lobby_countdown_ended"
  });
});

game.onWake("on_lobby_countdown_ended", (ctx) => {
  const players = ctx.session.participants;
  ctx.ui.render({
    title: "⚔️ Match Begun!",
    bodyLines: [`Total players: ${players.length}`]
  });
});
```

### Duo Invites with Escrow

```typescript
game.onCommand("duel", (ctx) => {
  const targetId = ctx.args.targetUserId;
  if (!targetId) return;

  ctx.lobby.createDuoInvite({
    partnerId: targetId,
    entryFee: 25,
    onAccept: "on_duel_accepted"
  });
});
```

### Exclusive Atomic Claim Grid

Prevent race conditions in fast-reaction multiplayer games:

```typescript
ctx.lobby.exclusiveClaimGrid({
  count: 3,
  eligibleUsers: ctx.session.participants,
  timeout: 15,
  onResolve: "on_chests_opened"
});
```

---

## AI & Media Gateways

### Dynamic AI Generation

```typescript
game.onButton("consult_oracle", (ctx) => {
  ctx.ai.generateJson({
    systemPrompt: "You are an eccentric fantasy merchant. Return JSON with 'quote' and 'specialOffer'.",
    userPrompt: "A player approaches looking for rare artifacts.",
    tier: "ai_low",
    temperature: 0.8,
    callback: "on_oracle_response"
  });
});

game.onCallback("on_oracle_response", (ctx) => {
  const data = ctx.args.callbackData as Record<string, string>;
  ctx.ui.render({
    title: "🔮 The Merchant Speaks",
    bodyLines: [data.quote || "Welcome, traveler!"]
  });
});
```

### GIF Search

```typescript
ctx.media.searchGif("victory celebration", "on_gif_found");
```

---

## HTTP & Discord Utilities

### Safe Outbound HTTP

```typescript
game.onCommand("trivia", (ctx) => {
  ctx.http.get("https://opentdb.com/api.php?amount=1&type=multiple", {
    callback: "on_trivia_received"
  });
});
```

### Channel Management & Chat Listening

```typescript
// Lock channel during critical minigame phase
ctx.discord.lockChannel(30);

// Listen for chat message answers
ctx.discord.listenMessages({
  exactMatch: "42",
  callback: "on_correct_answer",
  enabled: true
});
```

---

## Cartridge Project Layout & CLI

Use `angela-cli` to scaffold, test, and publish your cartridge.

### Standard File Layout

```text
my_game/
├── manifest.json       # Game metadata, config schema, target slot
├── src/
│   └── index.ts        # TypeScript entry script exporting handle
├── package.json        # Dependencies (devDependencies: @angela/sdk, typescript)
└── assets/             # Game sprites referenced by ctx.canvas.sprite()
    ├── boss.png
    └── coin.png
```

### `manifest.json` Specification

Angela cartridges require a valid `manifest.json` at project root matching the CLI and API specifications:

```json
{
  "package_id": "dice-master-ts",
  "name": "Dice Master TS",
  "version": "0.1.0",
  "language": "typescript",
  "entrypoint": "src/index.ts",
  "license": "proprietary",
  "public": false,
  "target_guild_id": "905194979650052208",
  "target_slot_id": 1,
  "default_command": "dice-master-ts",
  "default_ui_theme": "AUTO",
  "max_flux_per_tick": 5,
  "config_schema": {
    "currency_name": "Coins",
    "currency_emoji": "🪙",
    "cooldown_seconds": 30
  }
}
```

#### Manifest Fields Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `package_id` | `string` | **Yes** | 2–63 lowercase alphanumeric characters (`a-z0-9._-`). Unique cartridge identifier. |
| `name` | `string` | **Yes** | Human-readable cartridge display name. |
| `version` | `string` | **Yes** | Semantic version string (e.g. `"0.1.0"`). |
| `language` | `string` | **Yes** | Cartridge language: `"typescript"`, `"javascript"`, `"python"`, or `"lua"`. |
| `entrypoint` | `string` | **Yes** | Relative path to entry file matching language extension (`.ts`, `.js`, `.py`, `.lua`). |
| `license` | `string` | **Yes** | `"open"` (open source; authorized users can inspect) or `"proprietary"` (author-only code visibility). |
| `public` | `boolean` | **Yes** | Whether to list the cartridge publicly on the Angela marketplace. |
| `target_guild_id` | `string` | **Yes** | Target Discord server guild ID where this cartridge slot lives. |
| `target_slot_id` | `integer` | **Yes** | Target slot ID number on the server (e.g. `1`, `2`). |
| `default_command` | `string` | No | Slash command trigger for this game (defaults to `package_id`). |
| `default_ui_theme` | `string` | No | Default rendering mode: `"AUTO"`, `"CV2"`, or `"CLASSIC_EMBED"`. |
| `max_flux_per_tick` | `integer` | No | Compute Flux ceiling per interaction tick (1 to 100, defaults to 5). |
| `config_schema` | `object` | No | Default server configuration options merged into `ctx.config`. |

### CLI Workflow

```bash
# Initialize a new TypeScript cartridge
angela init

# Validate syntax, types, and bundle imports
angela validate

# Run interactive simulation with simulated Discord events
angela dev

# Authenticate with Discord
angela login

# Upload and deploy cartridge to your server
angela push
```

---

## License

MIT License. Built for the Angela Games Ecosystem.
