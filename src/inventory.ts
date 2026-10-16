import type { Context } from "./context.js";
import type { Intent } from "./models.js";

export class InventoryContext {
  constructor(private ctx: Context) {}

  public getServerItems(userId: number | string): Intent {
    const intent: Intent = {
      op: "INVENTORY_MUTATE",
      action: "GET_SERVER_ITEMS",
      user_id: Number(userId),
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public consumeServerItem(userId: number | string, itemId: string, qty = 1): Intent {
    const intent: Intent = {
      op: "INVENTORY_MUTATE",
      action: "CONSUME_SERVER_ITEM",
      user_id: Number(userId),
      item_id: String(itemId),
      quantity: Math.floor(qty),
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public giveServerItem(userId: number | string, itemId: string, qty = 1): Intent {
    const intent: Intent = {
      op: "INVENTORY_MUTATE",
      action: "GIVE_SERVER_ITEM",
      user_id: Number(userId),
      item_id: String(itemId),
      quantity: Math.floor(qty),
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public rollBreak(userId: number | string, itemId: string, probability: number): Intent {
    const intent: Intent = {
      op: "INVENTORY_MUTATE",
      action: "ROLL_BREAK",
      user_id: Number(userId),
      item_id: String(itemId),
      break_chance: Number(probability),
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public addSubItem(userId: number | string, itemId: string, qty = 1): Intent {
    const intent: Intent = {
      op: "INVENTORY_MUTATE",
      action: "ADD_SUB_ITEM",
      user_id: Number(userId),
      item_id: String(itemId),
      quantity: Math.floor(qty),
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public removeSubItem(userId: number | string, itemId: string, qty = 1): Intent {
    const intent: Intent = {
      op: "INVENTORY_MUTATE",
      action: "REMOVE_SUB_ITEM",
      user_id: Number(userId),
      item_id: String(itemId),
      quantity: Math.floor(qty),
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  // Snake_case aliases
  public get_server_items = this.getServerItems.bind(this);
  public consume_server_item = this.consumeServerItem.bind(this);
  public give_server_item = this.giveServerItem.bind(this);
  public roll_break = this.rollBreak.bind(this);
  public add_sub_item = this.addSubItem.bind(this);
  public remove_sub_item = this.removeSubItem.bind(this);
}

