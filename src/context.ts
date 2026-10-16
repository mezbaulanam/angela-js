import { AIContext, MediaContext } from "./ai.js";
import { CanvasContext } from "./canvas.js";
import { DiscordContext, HTTPContext, StorageContext } from "./http.js";
import { EconomyContext } from "./economy.js";
import { InventoryContext } from "./inventory.js";
import { LobbyContext } from "./lobby.js";
import { Args, type ArgsData, type Intent, Session, type SessionData, User, type UserData } from "./models.js";
import { UIContext } from "./ui.js";

export interface EventPayload {
  event_type?: string;
  event_id?: string;
  guild_id?: number | string;
  channel_id?: number | string;
  user?: UserData;
  args?: ArgsData;
  session?: SessionData;
  config?: Record<string, unknown>;
  secrets?: Record<string, unknown>;
}

export class Context {
  public rawEvent: EventPayload;
  public eventType: string;
  public eventId: string;
  public guildId: number;
  public channelId: number;
  public user: User;
  public args: Args;
  public session: Session;

  public status: string;
  public round: number;
  public state: Record<string, unknown>;
  public config: Readonly<Record<string, unknown>>;
  public secrets: Readonly<Record<string, unknown>>;

  private intents: Intent[] = [];

  public economy: EconomyContext;
  public inventory: InventoryContext;
  public ui: UIContext;
  public canvas: CanvasContext;
  public lobby: LobbyContext;
  public ai: AIContext;
  public media: MediaContext;
  public http: HTTPContext;
  public discord: DiscordContext;
  public storage: StorageContext;

  constructor(rawEvent: EventPayload = {}) {
    this.rawEvent = rawEvent;
    this.eventType = String(rawEvent.event_type ?? "COMMAND");
    this.eventId = String(rawEvent.event_id ?? "");
    this.guildId = rawEvent.guild_id ? Number(rawEvent.guild_id) : 0;
    this.channelId = rawEvent.channel_id ? Number(rawEvent.channel_id) : 0;
    this.user = new User(rawEvent.user);
    this.args = new Args(rawEvent.args);
    this.session = new Session(rawEvent.session);

    this.status = this.session.status;
    this.round = this.session.round;
    this.state = this.session.state;

    this.config = Object.freeze({ ...(rawEvent.config ?? {}) });
    this.secrets = Object.freeze({ ...(rawEvent.secrets ?? {}) });

    this.economy = new EconomyContext(this);
    this.inventory = new InventoryContext(this);
    this.ui = new UIContext(this);
    this.canvas = new CanvasContext();
    this.lobby = new LobbyContext(this);
    this.ai = new AIContext(this);
    this.media = new MediaContext(this);
    this.http = new HTTPContext(this);
    this.discord = new DiscordContext(this);
    this.storage = new StorageContext(this);
  }

  public get hostId(): number {
    if (this.session.participants.length > 0) {
      return this.session.participants[0];
    }
    return this.user.id;
  }

  // Snake_case aliases
  public get event_type(): string {
    return this.eventType;
  }
  public get event_id(): string {
    return this.eventId;
  }
  public get guild_id(): number {
    return this.guildId;
  }
  public get channel_id(): number {
    return this.channelId;
  }
  public get host_id(): number {
    return this.hostId;
  }

  public addIntent(intent: Intent): void {
    this.intents.push(intent);
  }

  public finish(): void {
    this.status = "FINISHED";
  }

  public pause(): void {
    this.status = "PAUSED";
  }

  public nextRound(): number {
    this.round += 1;
    return this.round;
  }

  public schedule(delaySeconds: number, callback = "on_sleep_complete"): Intent {
    const intent: Intent = {
      op: "SCHEDULE_WAKE",
      delay_seconds: Math.floor(delaySeconds),
      callback_event_id: callback,
    };
    this.addIntent(intent);
    return intent;
  }

  public sleep(seconds: number, callback = "on_sleep_complete"): Intent {
    if (seconds > 3) {
      this.status = "SLEEPING";
    }
    return this.schedule(seconds, callback);
  }

  public toResponse(): Record<string, unknown> {
    return {
      status: this.status,
      round: this.round,
      updated_state: this.state,
      intents: this.intents,
    };
  }

  // Snake_case alias
  public next_round = this.nextRound.bind(this);
  public to_response = this.toResponse.bind(this);
}

export { Context as GameContext };

