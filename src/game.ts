import { Context, type EventPayload } from "./context.js";

export type HandlerFunc = (ctx: Context) => Promise<unknown> | unknown;

export class Game {
  public name: string;
  private commandHandlers = new Map<string | null, HandlerFunc>();
  private buttonHandlers = new Map<string, HandlerFunc>();
  private selectHandlers = new Map<string, HandlerFunc>();
  private modalHandlers = new Map<string, HandlerFunc>();
  private messageHandlers: HandlerFunc[] = [];
  private wakeHandlers = new Map<string, HandlerFunc>();
  private callbackHandlers = new Map<string, HandlerFunc>();
  private defaultHandler: HandlerFunc | null = null;

  constructor(name = "angela_game") {
    this.name = name;
  }

  public onCommand(subcommandOrHandler?: string | HandlerFunc, handler?: HandlerFunc): Game {
    if (typeof subcommandOrHandler === "function") {
      this.commandHandlers.set(null, subcommandOrHandler);
    } else {
      const sub = subcommandOrHandler ?? null;
      if (handler) this.commandHandlers.set(sub, handler);
    }
    return this;
  }

  public onButton(customId: string, handler: HandlerFunc): Game {
    this.buttonHandlers.set(customId, handler);
    return this;
  }

  public onSelect(customId: string, handler: HandlerFunc): Game {
    this.selectHandlers.set(customId, handler);
    return this;
  }

  public onModal(callbackId: string, handler: HandlerFunc): Game {
    this.modalHandlers.set(callbackId, handler);
    return this;
  }

  public onMessage(handler: HandlerFunc): Game {
    this.messageHandlers.push(handler);
    return this;
  }

  public onWake(callbackEventIdOrHandler?: string | HandlerFunc, handler?: HandlerFunc): Game {
    if (typeof callbackEventIdOrHandler === "function") {
      this.wakeHandlers.set("on_sleep_complete", callbackEventIdOrHandler);
    } else {
      const cb = callbackEventIdOrHandler ?? "on_sleep_complete";
      if (handler) this.wakeHandlers.set(cb, handler);
    }
    return this;
  }

  public onCallback(callbackEventId: string, handler: HandlerFunc): Game {
    this.callbackHandlers.set(callbackEventId, handler);
    return this;
  }

  public default(handler: HandlerFunc): Game {
    this.defaultHandler = handler;
    return this;
  }

  public async handle(event: string | EventPayload | Context): Promise<Record<string, unknown>> {
    let ctx: Context;
    if (typeof event === "string") {
      ctx = new Context(JSON.parse(event));
    } else if (event instanceof Context) {
      ctx = event;
    } else {
      ctx = new Context(event);
    }

    let handler: HandlerFunc | undefined | null = null;
    const eventType = ctx.eventType.toUpperCase();
    const eventId = ctx.eventId;

    if (eventType === "COMMAND") {
      const sub = ctx.args.subcommand;
      handler = this.commandHandlers.get(sub) ?? this.commandHandlers.get(null);
    } else if (eventType === "BUTTON") {
      handler = this.buttonHandlers.get(eventId);
    } else if (eventType === "SELECT") {
      handler = this.selectHandlers.get(eventId);
    } else if (eventType === "MODAL") {
      handler = this.modalHandlers.get(eventId);
    } else if (eventType === "MESSAGE") {
      handler = this.messageHandlers[0];
    } else if (eventType === "TIMER_WAKE") {
      handler = this.wakeHandlers.get(eventId) ?? this.wakeHandlers.get("on_sleep_complete");
    } else if (eventType === "CALLBACK") {
      handler = this.callbackHandlers.get(eventId);
    }

    if (!handler) {
      handler = this.defaultHandler;
    }

    if (handler) {
      await handler(ctx);
    }

    return ctx.toResponse();
  }

  // Synchronous handle variant for Wasm environments that require sync returns
  public handleSync(event: string | EventPayload | Context): Record<string, unknown> {
    let ctx: Context;
    if (typeof event === "string") {
      ctx = new Context(JSON.parse(event));
    } else if (event instanceof Context) {
      ctx = event;
    } else {
      ctx = new Context(event);
    }

    let handler: HandlerFunc | undefined | null = null;
    const eventType = ctx.eventType.toUpperCase();
    const eventId = ctx.eventId;

    if (eventType === "COMMAND") {
      const sub = ctx.args.subcommand;
      handler = this.commandHandlers.get(sub) ?? this.commandHandlers.get(null);
    } else if (eventType === "BUTTON") {
      handler = this.buttonHandlers.get(eventId);
    } else if (eventType === "SELECT") {
      handler = this.selectHandlers.get(eventId);
    } else if (eventType === "MODAL") {
      handler = this.modalHandlers.get(eventId);
    } else if (eventType === "MESSAGE") {
      handler = this.messageHandlers[0];
    } else if (eventType === "TIMER_WAKE") {
      handler = this.wakeHandlers.get(eventId) ?? this.wakeHandlers.get("on_sleep_complete");
    } else if (eventType === "CALLBACK") {
      handler = this.callbackHandlers.get(eventId);
    }

    if (!handler) {
      handler = this.defaultHandler;
    }

    if (handler) {
      handler(ctx);
    }

    return ctx.toResponse();
  }
}

export function dispatch(
  handler: HandlerFunc,
  event: string | EventPayload | Context
): Record<string, unknown> {
  let ctx: Context;
  if (typeof event === "string") {
    ctx = new Context(JSON.parse(event));
  } else if (event instanceof Context) {
    ctx = event;
  } else {
    ctx = new Context(event);
  }

  const res = handler(ctx);
  if (res && typeof res === "object" && "status" in res && "intents" in res) {
    return res as Record<string, unknown>;
  }

  return ctx.toResponse();
}

