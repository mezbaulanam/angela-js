import type { Context } from "./context.js";
import type { Intent } from "./models.js";

export class HTTPContext {
  constructor(private ctx: Context) {}

  public get(url: string, headers?: Record<string, string>, callback = "on_http_response"): Intent {
    return this.request(url, { method: "GET", headers, callback });
  }

  public request(
    url: string,
    options?: {
      method?: string;
      headers?: Record<string, string>;
      body?: string | null;
      callback?: string;
    }
  ): Intent {
    const intent: Intent = {
      op: "HTTP_REQUEST",
      method: (options?.method ?? "GET").toUpperCase(),
      url: String(url),
      headers: { ...(options?.headers ?? {}) },
      body: options?.body ?? null,
      callback_event_id: options?.callback ?? "on_http_response",
    };
    this.ctx.addIntent(intent);
    return intent;
  }
}

export class DiscordContext {
  constructor(private ctx: Context) {}

  public lockChannel(durationSeconds = 20): Intent {
    const intent: Intent = {
      op: "CHANNEL_LOCK",
      duration_seconds: Math.floor(durationSeconds),
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public listenMessages(options?: {
    exactMatch?: string | null;
    exact_match?: string | null;
    regex?: string | null;
    callback?: string;
    enabled?: boolean;
  }): Intent {
    const intent: Intent = {
      op: "LISTEN_MESSAGES",
      enabled: options?.enabled ?? true,
      callback_event_id: options?.callback ?? "on_message",
    };
    const exact = options?.exactMatch ?? options?.exact_match;
    if (exact !== undefined && exact !== null) intent.exact_match = String(exact);
    if (options?.regex) intent.regex = String(options.regex);

    this.ctx.addIntent(intent);
    return intent;
  }

  // Snake_case aliases
  public lock_channel = this.lockChannel.bind(this);
  public listen_messages = this.listenMessages.bind(this);
}

export class StorageContext {
  constructor(private ctx: Context) {}

  public get<T = unknown>(key: string, defaultValue?: T): T | undefined {
    return (this.ctx.state[key] as T) ?? defaultValue;
  }

  public set(key: string, value: unknown): void {
    this.ctx.state[key] = value;
  }

  public setCooldown(userId: number | string, seconds: number): Intent {
    const intent: Intent = {
      op: "STORAGE_MUTATE",
      action: "SET_COOLDOWN",
      user_id: Number(userId),
      seconds: Math.floor(seconds),
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public set_cooldown = this.setCooldown.bind(this);
}

