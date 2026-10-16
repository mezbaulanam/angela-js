import type { Context } from "./context.js";
import type { Intent } from "./models.js";

export interface EconomyOptions {
  currency?: string | null;
}

export interface GiveOptions extends EconomyOptions {
  clampMin?: number | null;
  clampMax?: number | null;
}

export class EconomyContext {
  constructor(private ctx: Context) {}

  private applyCurrency(intent: Intent, currency?: string | null): void {
    if (currency !== undefined && currency !== null) {
      intent.currency = String(currency);
    }
  }

  public getBalance(userId: number | string, options?: EconomyOptions | string | null): Intent {
    const intent: Intent = {
      op: "ECONOMY_MUTATE",
      action: "GET_BALANCE",
      user_id: Number(userId),
    };
    const currency = typeof options === "string" ? options : options?.currency;
    this.applyCurrency(intent, currency);
    this.ctx.addIntent(intent);
    return intent;
  }

  public take(
    userId: number | string,
    amount: number,
    reason = "",
    options?: EconomyOptions | string | null
  ): Intent {
    const intent: Intent = {
      op: "ECONOMY_MUTATE",
      action: "TAKE",
      user_id: Number(userId),
      amount: Math.floor(amount),
      reason,
    };
    const currency = typeof options === "string" ? options : options?.currency;
    this.applyCurrency(intent, currency);
    this.ctx.addIntent(intent);
    return intent;
  }

  public give(
    userId: number | string,
    amount: number,
    reason = "",
    clampMinOrOptions?: number | GiveOptions | null,
    clampMax?: number | null,
    options?: EconomyOptions | string | null
  ): Intent {
    const intent: Intent = {
      op: "ECONOMY_MUTATE",
      action: "GIVE",
      user_id: Number(userId),
      amount: Math.floor(amount),
      reason,
    };

    let currency: string | null | undefined = undefined;

    if (typeof clampMinOrOptions === "object" && clampMinOrOptions !== null) {
      if (clampMinOrOptions.clampMin !== undefined && clampMinOrOptions.clampMin !== null) {
        intent.clamp_min = Math.floor(clampMinOrOptions.clampMin);
      }
      if (clampMinOrOptions.clampMax !== undefined && clampMinOrOptions.clampMax !== null) {
        intent.clamp_max = Math.floor(clampMinOrOptions.clampMax);
      }
      currency = clampMinOrOptions.currency;
    } else {
      if (clampMinOrOptions !== undefined && clampMinOrOptions !== null) {
        intent.clamp_min = Math.floor(clampMinOrOptions);
      }
      if (clampMax !== undefined && clampMax !== null) {
        intent.clamp_max = Math.floor(clampMax);
      }
      currency = typeof options === "string" ? options : options?.currency;
    }

    this.applyCurrency(intent, currency);
    this.ctx.addIntent(intent);
    return intent;
  }

  public escrowLock(
    userId: number | string,
    amount: number,
    reason = "",
    options?: EconomyOptions | string | null
  ): Intent {
    const intent: Intent = {
      op: "ECONOMY_MUTATE",
      action: "ESCROW_LOCK",
      user_id: Number(userId),
      amount: Math.floor(amount),
      reason,
    };
    const currency = typeof options === "string" ? options : options?.currency;
    this.applyCurrency(intent, currency);
    this.ctx.addIntent(intent);
    return intent;
  }

  public escrowRelease(
    userId: number | string,
    amount: number,
    reason = "",
    options?: EconomyOptions | string | null
  ): Intent {
    const intent: Intent = {
      op: "ECONOMY_MUTATE",
      action: "ESCROW_RELEASE",
      user_id: Number(userId),
      amount: Math.floor(amount),
      reason,
    };
    const currency = typeof options === "string" ? options : options?.currency;
    this.applyCurrency(intent, currency);
    this.ctx.addIntent(intent);
    return intent;
  }

  public escrowRefund(
    userId: number | string,
    amount: number,
    reason = "",
    options?: EconomyOptions | string | null
  ): Intent {
    const intent: Intent = {
      op: "ECONOMY_MUTATE",
      action: "ESCROW_REFUND",
      user_id: Number(userId),
      amount: Math.floor(amount),
      reason,
    };
    const currency = typeof options === "string" ? options : options?.currency;
    this.applyCurrency(intent, currency);
    this.ctx.addIntent(intent);
    return intent;
  }

  public autoBuy(userId: number | string, itemIds: string[], quantity = 10): Intent {
    const intent: Intent = {
      op: "ECONOMY_MUTATE",
      action: "AUTO_BUY",
      user_id: Number(userId),
      item_ids: [...itemIds],
      quantity: Math.floor(quantity),
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  // Snake_case aliases for cross-language consistency
  public get_balance = this.getBalance.bind(this);
  public escrow_lock = this.escrowLock.bind(this);
  public escrow_release = this.escrowRelease.bind(this);
  public escrow_refund = this.escrowRefund.bind(this);
  public auto_buy = this.autoBuy.bind(this);
}

