import type { Context } from "./context.js";
import type { Intent } from "./models.js";

export class TimerContext {
  constructor(private ctx: Context) {}

  public schedule(delaySeconds: number, callback = "on_wake"): Intent {
    const intent: Intent = {
      op: "SCHEDULE_WAKE",
      delay_seconds: Number(delaySeconds),
      callback_event_id: String(callback),
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public cancel(): Intent {
    const intent: Intent = {
      op: "TIMER_CANCEL",
    };
    this.ctx.addIntent(intent);
    return intent;
  }
}
