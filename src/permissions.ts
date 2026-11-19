import type { Context } from "./context.js";
import type { Intent } from "./models.js";

export class PermissionsContext {
  constructor(private ctx: Context) {}

  public set(options: {
    target: number | string;
    allow?: string[];
    deny?: string[];
    channelId?: number | string;
    durationSeconds?: number;
    reason?: string;
  }): Intent {
    const targetStr = String(options.target).trim();
    const isEveryone = targetStr === "@everyone" || targetStr === "0" || targetStr.toLowerCase() === "everyone";
    const targetType = isEveryone || (!/^\d+$/.test(targetStr)) ? "ROLE" : "USER";
    const targetId = isEveryone ? 0 : Number(options.target);

    const intent: Intent = {
      op: "PERMISSION_OVERWRITE",
      channel_id: options.channelId ? Number(options.channelId) : this.ctx.channelId,
      target_type: targetType,
      target_id: targetId,
      allow: options.allow ?? [],
      deny: options.deny ?? [],
      duration_seconds: options.durationSeconds,
      reason: options.reason ?? "Game Permission Overwrite",
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public lockChannel(durationSeconds = 20, channelId?: number | string): Intent {
    return this.set({
      target: 0,
      deny: ["SEND_MESSAGES"],
      channelId,
      durationSeconds,
      reason: "Channel Lock",
    });
  }

  public lock_channel = this.lockChannel.bind(this);
}
