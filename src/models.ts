export interface UserData {
  id: number | string;
  name?: string;
  avatar_url?: string;
}

export class User {
  public id: number;
  public name: string;
  public avatarUrl: string;

  constructor(data?: UserData | null) {
    this.id = data?.id ? Number(data.id) : 0;
    this.name = data?.name ?? "";
    this.avatarUrl = data?.avatar_url ?? "";
  }
}

export interface ArgsData {
  subcommand?: string | null;
  raw_args?: string | null;
  target_user_id?: number | string | null;
  modal_inputs?: Record<string, string>;
  select_values?: string[];
  message_content?: string | null;
  callback_data?: Record<string, unknown>;
}

export class Args {
  public subcommand: string | null;
  public rawArgs: string | null;
  public targetUserId: number | null;
  public modalInputs: Record<string, string>;
  public selectValues: string[];
  public messageContent: string | null;
  public callbackData: Record<string, unknown>;

  constructor(data?: ArgsData | null) {
    this.subcommand = data?.subcommand ?? null;
    this.rawArgs = data?.raw_args ?? null;
    this.targetUserId = data?.target_user_id ? Number(data.target_user_id) : null;
    this.modalInputs = { ...(data?.modal_inputs ?? {}) };
    this.selectValues = [...(data?.select_values ?? [])];
    this.messageContent = data?.message_content ?? null;
    this.callbackData = { ...(data?.callback_data ?? {}) };
  }
}

export interface SessionData {
  session_id?: string;
  round?: number;
  participants?: (number | string)[];
  status?: string;
  state?: Record<string, unknown>;
}

export class Session {
  public sessionId: string;
  public round: number;
  public participants: number[];
  public status: string;
  public state: Record<string, unknown>;

  constructor(data?: SessionData | null) {
    this.sessionId = data?.session_id ?? "";
    this.round = data?.round ?? 1;
    this.participants = (data?.participants ?? []).map((p) => Number(p));
    this.status = data?.status ?? "ACTIVE";
    this.state = { ...(data?.state ?? {}) };
  }
}

export type Intent = Record<string, unknown>;

