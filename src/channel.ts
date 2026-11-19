import type { Context } from "./context.js";
import type { Intent } from "./models.js";

export class ChannelContext {
  constructor(private ctx: Context) {}

  public create(options: {
    name: string;
    categoryId?: number | string | null;
    ttlMinutes?: number;
    callback?: string;
  }): Intent {
    const intent: Intent = {
      op: "CHANNEL_OP",
      action: "CREATE",
      name: String(options.name).slice(0, 32),
      category_id: options.categoryId ? Number(options.categoryId) : undefined,
      max_ttl_minutes: options.ttlMinutes ?? 60,
      callback_event_id: options.callback,
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public delete(channelId?: number | string): Intent {
    const intent: Intent = {
      op: "CHANNEL_OP",
      action: "DELETE",
      channel_id: channelId ? Number(channelId) : this.ctx.channelId,
    };
    this.ctx.addIntent(intent);
    return intent;
  }
}
