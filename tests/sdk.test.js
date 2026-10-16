import test from "node:test";
import assert from "node:assert/strict";
import {
  Context,
  Game,
  Button,
  Select,
  SelectOption,
  TextInput,
  Container,
  Section,
  Embed,
  dispatch,
} from "../dist/esm/index.js";

const SAMPLE_EVENT = {
  event_type: "COMMAND",
  event_id: "start",
  guild_id: 905194979650052208,
  channel_id: 1321720365189300234,
  user: {
    id: 496644923601453076,
    name: "Ray_quaza",
    avatar_url: "https://cdn.discordapp.com/avatars/496644923601453076/abc.png",
  },
  args: {
    subcommand: null,
    raw_args: "all",
    target_user_id: 112233445566778899,
    modal_inputs: { secret_number: "42" },
    select_values: ["moon_talisman", "aqua_lens"],
    message_content: "42",
    callback_data: {},
  },
  session: {
    session_id: "sess_a1b2c3d4",
    round: 2,
    participants: [496644923601453076, 112233445566778899],
    status: "ACTIVE",
    state: {
      rod_col: 2,
      rod_row: 1,
      fish_spots: [{ col: 1, row: 0, fish_id: "sapphire_sardine" }],
    },
  },
  config: {
    ui_theme: "CV2",
    currency_name: "Shells",
    cooldown_seconds: 20,
  },
  secrets: {
    admin_key: "private_val",
  },
};

test("Context parses event correctly", () => {
  const ctx = new Context(SAMPLE_EVENT);
  assert.equal(ctx.eventType, "COMMAND");
  assert.equal(ctx.eventId, "start");
  assert.equal(ctx.guildId, 905194979650052208);
  assert.equal(ctx.channelId, 1321720365189300234);
  assert.equal(ctx.user.id, 496644923601453076);
  assert.equal(ctx.user.name, "Ray_quaza");
  assert.equal(ctx.hostId, 496644923601453076);
  assert.equal(ctx.args.targetUserId, 112233445566778899);
  assert.equal(ctx.args.modalInputs.secret_number, "42");
  assert.equal(ctx.session.sessionId, "sess_a1b2c3d4");
  assert.equal(ctx.round, 2);
  assert.equal(ctx.state.rod_col, 2);
  assert.equal(ctx.config.ui_theme, "CV2");
  assert.equal(ctx.secrets.admin_key, "private_val");
});

test("Economy context generates intents", () => {
  const ctx = new Context(SAMPLE_EVENT);
  ctx.economy.getBalance(ctx.user.id);
  ctx.economy.give(ctx.user.id, 50, "Won prize", { clampMin: 0, clampMax: 500, currency: "Gold" });
  ctx.economy.take(ctx.user.id, 20, "Fee");
  ctx.economy.escrowLock(ctx.user.id, 100, "Bet", "Diamonds");
  ctx.economy.escrowRelease(ctx.user.id, 100, "Paid out");
  ctx.economy.escrowRefund(ctx.user.id, 100, "Refunded");
  ctx.economy.autoBuy(ctx.user.id, ["rod", "bait"], 5);

  const res = ctx.toResponse();
  const intents = res.intents;
  assert.equal(intents.length, 7);
  assert.equal(intents[0].op, "ECONOMY_MUTATE");
  assert.equal(intents[0].action, "GET_BALANCE");
  assert.equal(intents[0].currency, undefined);
  assert.equal(intents[1].action, "GIVE");
  assert.equal(intents[1].amount, 50);
  assert.equal(intents[1].clamp_max, 500);
  assert.equal(intents[1].currency, "Gold");
  assert.equal(intents[2].action, "TAKE");
  assert.equal(intents[2].currency, undefined);
  assert.equal(intents[3].action, "ESCROW_LOCK");
  assert.equal(intents[3].currency, "Diamonds");
  assert.equal(intents[6].action, "AUTO_BUY");
});

test("Inventory context generates intents", () => {
  const ctx = new Context(SAMPLE_EVENT);
  ctx.inventory.getServerItems(ctx.user.id);
  ctx.inventory.consumeServerItem(ctx.user.id, "potion", 1);
  ctx.inventory.giveServerItem(ctx.user.id, "potion", 2);
  ctx.inventory.rollBreak(ctx.user.id, "fishing_rod", 0.075);
  ctx.inventory.addSubItem(ctx.user.id, "sapphire_sardine", 1);
  ctx.inventory.removeSubItem(ctx.user.id, "sapphire_sardine", 1);

  const res = ctx.toResponse();
  assert.equal(res.intents.length, 6);
  assert.equal(res.intents[0].op, "INVENTORY_MUTATE");
  assert.equal(res.intents[3].action, "ROLL_BREAK");
  assert.equal(res.intents[3].break_chance, 0.075);
});

test("UI context renders components and modals", () => {
  const ctx = new Context(SAMPLE_EVENT);
  const btn = new Button({ customId: "test_btn", label: "Click", emoji: "🚀" });
  const sel = new Select({
    customId: "test_sel",
    options: [{ label: "A", value: "a" }],
  });

  ctx.ui.render({
    title: "Title",
    subtitle: "Subtitle",
    bodyLines: ["Line 1", "Line 2"],
    buttons: [btn],
    selects: [sel],
    accentColor: "#5865F2",
  });

  ctx.ui.replyEphemeral("Secret info");
  ctx.ui.openModal("Input Modal", [new TextInput({ customId: "txt", label: "Answer" })], "on_submit");

  const res = ctx.toResponse();
  assert.equal(res.intents.length, 3);
  assert.equal(res.intents[0].op, "UI_RENDER");
  assert.equal(res.intents[0].layout.title, "Title");
  assert.equal(res.intents[0].layout.accent_color, 0x5865f2);
  assert.equal(res.intents[1].ephemeral, true);
  assert.equal(res.intents[2].op, "UI_MODAL");
});

test("Canvas fluent scene builder", () => {
  const ctx = new Context(SAMPLE_EVENT);
  const scene = ctx.canvas.create({ width: 640, height: 360 });
  const bg = scene.layer("background", "base_v1");
  bg.linearGradient([0, 0, 640, 300], [25, 45, 95], [240, 140, 90], 1.2);
  bg.celestialBody(320, 140, 20, 70, [255, 245, 210], [255, 190, 80, 90]);
  bg.sineWaves(170, 260, 12, [255, 255, 255, 60]);

  const fg = scene.layer("foreground");
  fg.sprite("fish_blue.png", 300, 185, { maxW: 62, maxH: 62 });
  fg.avatar(ctx.user.id, 200, 65, { size: 80, circular: true });
  fg.progressBar([50, 20, 250, 36], 75, 100, [20, 20, 30], [87, 242, 135]);
  fg.textBox([30, 250, 610, 415], "Hello Canvas", { size: 14 });

  ctx.ui.render({ title: "Canvas Test", image: scene });
  const res = ctx.toResponse();
  assert.ok(res.intents[0].canvas_scene);
  const canvasData = res.intents[0].canvas_scene;
  assert.equal(canvasData.width, 640);
  assert.equal(canvasData.layers.length, 2);
  assert.equal(canvasData.layers[0].id, "background");
  assert.equal(canvasData.layers[0].cache_key, "base_v1");
});

test("Sub-contexts generate correct intents", () => {
  const ctx = new Context(SAMPLE_EVENT);
  ctx.lobby.createJoinLobby(20, 60, "start_event");
  ctx.lobby.createDuoInvite(1122334455, 15, undefined, "invite_accepted");
  ctx.lobby.exclusiveClaimGrid(5, [1, 2, 3], 15);
  ctx.ai.generateJson("System prompt", "User prompt", "ai_high", 1.0, 400, "on_ai");
  ctx.media.searchGif("dancing cat", "on_gif");
  ctx.http.get("https://api.example.com/data", undefined, "on_http");
  ctx.discord.lockChannel(30);
  ctx.discord.listenMessages({ exactMatch: "42", callback: "on_msg" });
  ctx.storage.set("my_key", 12345);
  assert.equal(ctx.storage.get("my_key"), 12345);
  ctx.storage.setCooldown(ctx.user.id, 60);
  ctx.sleep(10, "wake_cb");

  const res = ctx.toResponse();
  assert.equal(res.status, "SLEEPING");
  assert.equal(res.updated_state.my_key, 12345);
  const ops = res.intents.map((it) => it.op);
  assert.ok(ops.includes("LOBBY_OP"));
  assert.ok(ops.includes("AI_GENERATE"));
  assert.ok(ops.includes("MEDIA_SEARCH_GIF"));
  assert.ok(ops.includes("HTTP_REQUEST"));
  assert.ok(ops.includes("CHANNEL_LOCK"));
  assert.ok(ops.includes("LISTEN_MESSAGES"));
  assert.ok(ops.includes("STORAGE_MUTATE"));
  assert.ok(ops.includes("SCHEDULE_WAKE"));
});

test("Game routing works for command and button", async () => {
  const game = new Game();

  game.onCommand((ctx) => {
    ctx.state.started = true;
    ctx.ui.render({ title: "Started!" });
  });

  game.onButton("click_me", (ctx) => {
    ctx.state.clicked = true;
  });

  const cmdRes = await game.handle(SAMPLE_EVENT);
  assert.equal(cmdRes.status, "ACTIVE");
  assert.equal(cmdRes.updated_state.started, true);
  assert.equal(cmdRes.intents.length, 1);

  const btnEvent = {
    ...SAMPLE_EVENT,
    event_type: "BUTTON",
    event_id: "click_me",
  };
  const btnRes = await game.handle(btnEvent);
  assert.equal(btnRes.updated_state.clicked, true);
});

test("CommonJS require works properly", async () => {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const cjsSdk = require("../dist/cjs/index.js");

  assert.ok(cjsSdk.Context);
  assert.ok(cjsSdk.Game);
  assert.ok(cjsSdk.Button);

  const ctx = new cjsSdk.Context(SAMPLE_EVENT);
  ctx.economy.give(ctx.user.id, 100, "CJS Test");
  const res = ctx.toResponse();
  assert.equal(res.intents[0].amount, 100);
});

