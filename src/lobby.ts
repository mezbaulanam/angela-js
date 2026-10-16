import type { Context } from "./context.js";
import type { Intent } from "./models.js";

export class LobbyContext {
  constructor(private ctx: Context) {}

  public createJoinLobby(maxPlayers = 25, duration = 120, onStart = "on_lobby_start"): Intent {
    const intent: Intent = {
      op: "LOBBY_OP",
      action: "CREATE_JOIN_LOBBY",
      max_players: Math.floor(maxPlayers),
      duration: Math.floor(duration),
      callback_event_id: onStart,
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public createDuoInvite(
    partnerId: number | string,
    entryFee = 10,
    loadoutShop?: Record<string, unknown>[],
    onAccept = "on_invite_accept"
  ): Intent {
    const intent: Intent = {
      op: "LOBBY_OP",
      action: "CREATE_DUO_INVITE",
      partner_id: Number(partnerId),
      entry_fee: Math.floor(entryFee),
      callback_event_id: onAccept,
    };
    if (loadoutShop) intent.loadout_shop = loadoutShop;
    this.ctx.addIntent(intent);
    return intent;
  }

  public exclusiveClaimGrid(
    count: number,
    eligibleUsers: (number | string)[],
    timeout = 20,
    onResolve = "on_claim_resolve"
  ): Intent {
    const intent: Intent = {
      op: "LOBBY_OP",
      action: "EXCLUSIVE_CLAIM_GRID",
      count: Math.floor(count),
      eligible_users: eligibleUsers.map((u) => Number(u)),
      timeout: Math.floor(timeout),
      callback_event_id: onResolve,
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  // Snake_case aliases
  public create_join_lobby = this.createJoinLobby.bind(this);
  public create_duo_invite = this.createDuoInvite.bind(this);
  public exclusive_claim_grid = this.exclusiveClaimGrid.bind(this);
}

