import type { CanvasScene } from "./canvas.js";
import type { Context } from "./context.js";
import type { Intent } from "./models.js";

export interface ButtonOptions {
  customId?: string;
  custom_id?: string;
  label?: string;
  style?: string;
  emoji?: string;
  disabled?: boolean;
  url?: string;
}

export class Button {
  public customId: string;
  public label: string;
  public style: string;
  public emoji?: string;
  public disabled: boolean;
  public url?: string;

  constructor(customIdOrOptions: string | ButtonOptions, label = "", style = "primary") {
    if (typeof customIdOrOptions === "object") {
      this.customId = customIdOrOptions.customId ?? customIdOrOptions.custom_id ?? "";
      this.label = customIdOrOptions.label ?? "";
      this.style = (customIdOrOptions.style ?? "primary").toLowerCase();
      this.emoji = customIdOrOptions.emoji;
      this.disabled = customIdOrOptions.disabled ?? false;
      this.url = customIdOrOptions.url;
    } else {
      this.customId = customIdOrOptions;
      this.label = label;
      this.style = style.toLowerCase();
      this.disabled = false;
    }
  }

  public toJSON(): Record<string, unknown> {
    const data: Record<string, unknown> = {
      type: 2,
      custom_id: this.customId,
      label: this.label,
      style: this.style,
      disabled: this.disabled,
    };
    if (this.emoji) data.emoji = this.emoji;
    if (this.url) data.url = this.url;
    return data;
  }
}

export interface SelectOptionData {
  label: string;
  value: string;
  description?: string;
  emoji?: string;
  default?: boolean;
}

export class SelectOption {
  public label: string;
  public value: string;
  public description?: string;
  public emoji?: string;
  public default: boolean;

  constructor(data: SelectOptionData) {
    this.label = data.label;
    this.value = data.value;
    this.description = data.description;
    this.emoji = data.emoji;
    this.default = data.default ?? false;
  }

  public toJSON(): Record<string, unknown> {
    const data: Record<string, unknown> = {
      label: this.label,
      value: this.value,
      default: this.default,
    };
    if (this.description) data.description = this.description;
    if (this.emoji) data.emoji = this.emoji;
    return data;
  }
}

export interface SelectOptions {
  customId?: string;
  custom_id?: string;
  options: (SelectOption | SelectOptionData)[];
  placeholder?: string;
  minValues?: number;
  min_values?: number;
  maxValues?: number;
  max_values?: number;
  disabled?: boolean;
}

export class Select {
  public customId: string;
  public options: (SelectOption | SelectOptionData)[];
  public placeholder?: string;
  public minValues: number;
  public maxValues: number;
  public disabled: boolean;

  constructor(options: SelectOptions) {
    this.customId = options.customId ?? options.custom_id ?? "";
    this.options = options.options;
    this.placeholder = options.placeholder;
    this.minValues = options.minValues ?? options.min_values ?? 1;
    this.maxValues = options.maxValues ?? options.max_values ?? 1;
    this.disabled = options.disabled ?? false;
  }

  public toJSON(): Record<string, unknown> {
    const opts = this.options.map((opt) =>
      opt instanceof SelectOption ? opt.toJSON() : new SelectOption(opt).toJSON()
    );
    const data: Record<string, unknown> = {
      type: 3,
      custom_id: this.customId,
      options: opts,
      min_values: this.minValues,
      max_values: this.maxValues,
      disabled: this.disabled,
    };
    if (this.placeholder) data.placeholder = this.placeholder;
    return data;
  }
}

export interface TextInputOptions {
  customId?: string;
  custom_id?: string;
  label: string;
  placeholder?: string;
  default?: string;
  value?: string;
  minLength?: number;
  min_length?: number;
  maxLength?: number;
  max_length?: number;
  required?: boolean;
  style?: string;
}

export class TextInput {
  public customId: string;
  public label: string;
  public placeholder?: string;
  public value?: string;
  public minLength?: number;
  public maxLength?: number;
  public required: boolean;
  public style: string;

  constructor(options: TextInputOptions) {
    this.customId = options.customId ?? options.custom_id ?? "";
    this.label = options.label;
    this.placeholder = options.placeholder;
    this.value = options.value ?? options.default;
    this.minLength = options.minLength ?? options.min_length;
    this.maxLength = options.maxLength ?? options.max_length;
    this.required = options.required ?? true;
    this.style = options.style ?? "short";
  }

  public toJSON(): Record<string, unknown> {
    const data: Record<string, unknown> = {
      type: 4,
      custom_id: this.customId,
      label: this.label,
      required: this.required,
      style: this.style,
    };
    if (this.placeholder) data.placeholder = this.placeholder;
    if (this.value) data.value = this.value;
    if (this.minLength !== undefined) data.min_length = this.minLength;
    if (this.maxLength !== undefined) data.max_length = this.maxLength;
    return data;
  }
}

export class TextDisplay {
  constructor(public content: string) {}

  public toJSON(): Record<string, unknown> {
    return { type: 10, content: this.content };
  }
}

export class Thumbnail {
  constructor(public url: string) {}

  public toJSON(): Record<string, unknown> {
    return { type: 11, url: this.url };
  }
}

export class MediaGallery {
  public items: string[];

  constructor(items: string | string[]) {
    this.items = Array.isArray(items) ? items : [items];
  }

  public toJSON(): Record<string, unknown> {
    return { type: 12, items: this.items.map((url) => ({ url })) };
  }
}

export class Separator {
  constructor(public divider = true, public spacing = 1) {}

  public toJSON(): Record<string, unknown> {
    return { type: 14, divider: this.divider, spacing: this.spacing };
  }
}

export class ActionRow {
  constructor(public components: unknown[] = []) {}

  public toJSON(): Record<string, unknown> {
    return {
      type: 1,
      components: this.components.map((c) =>
        typeof (c as { toJSON?: () => unknown })?.toJSON === "function"
          ? (c as { toJSON: () => unknown }).toJSON()
          : c
      ),
    };
  }
}

export class Section {
  constructor(
    public textDisplays: (TextDisplay | string)[] = [],
    public accessory?: Thumbnail | Button | Record<string, unknown>
  ) {}

  public toJSON(): Record<string, unknown> {
    const components = this.textDisplays.map((t) =>
      typeof t === "string" ? { type: 10, content: t } : t.toJSON()
    );
    const data: Record<string, unknown> = { type: 9, components };
    if (this.accessory) {
      data.accessory =
        typeof (this.accessory as { toJSON?: () => unknown })?.toJSON === "function"
          ? (this.accessory as { toJSON: () => unknown }).toJSON()
          : this.accessory;
    }
    return data;
  }
}

export class Container {
  public accentColor?: number;
  public components: unknown[];

  constructor(options?: { accentColor?: number | string; components?: unknown[] }) {
    if (options?.accentColor !== undefined) {
      if (typeof options.accentColor === "string" && options.accentColor.startsWith("#")) {
        this.accentColor = parseInt(options.accentColor.replace("#", ""), 16);
      } else {
        this.accentColor = Number(options.accentColor);
      }
    }
    this.components = options?.components ?? [];
  }

  public add(component: unknown): Container {
    this.components.push(component);
    return this;
  }

  public toJSON(): Record<string, unknown> {
    const serialized = this.components.map((c) =>
      typeof (c as { toJSON?: () => unknown })?.toJSON === "function"
        ? (c as { toJSON: () => unknown }).toJSON()
        : c
    );
    const data: Record<string, unknown> = { type: 17, components: serialized };
    if (this.accentColor !== undefined) data.accent_color = this.accentColor;
    return data;
  }
}

export interface EmbedOptions {
  title?: string;
  description?: string;
  color?: number | string;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string; icon_url?: string };
  thumbnail?: string;
  image?: string;
}

export class Embed {
  public title?: string;
  public description?: string;
  public color?: number;
  public fields: { name: string; value: string; inline?: boolean }[];
  public footer?: { text: string; icon_url?: string };
  public thumbnail?: string;
  public image?: string;

  constructor(options?: EmbedOptions) {
    this.title = options?.title;
    this.description = options?.description;
    if (options?.color !== undefined) {
      if (typeof options.color === "string" && options.color.startsWith("#")) {
        this.color = parseInt(options.color.replace("#", ""), 16);
      } else {
        this.color = Number(options.color);
      }
    }
    this.fields = options?.fields ?? [];
    this.footer = options?.footer;
    this.thumbnail = options?.thumbnail;
    this.image = options?.image;
  }

  public addField(name: string, value: string, inline = false): Embed {
    this.fields.push({ name, value, inline });
    return this;
  }

  public toJSON(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    if (this.title) data.title = this.title;
    if (this.description) data.description = this.description;
    if (this.color !== undefined) data.color = this.color;
    if (this.fields.length > 0) data.fields = this.fields;
    if (this.footer) data.footer = this.footer;
    if (this.thumbnail) data.thumbnail = { url: this.thumbnail };
    if (this.image) data.image = { url: this.image };
    return data;
  }
}

export interface RenderOptions {
  title?: string;
  subtitle?: string;
  bodyLines?: string[] | string;
  body_lines?: string[] | string;
  image?: string | CanvasScene;
  thumbnail?: string;
  buttons?: (Button | Record<string, unknown>)[];
  selects?: (Select | Record<string, unknown>)[];
  accentColor?: number | string;
  accent_color?: number | string;
  ephemeral?: boolean;
  target?: string;
  mode?: string;
}

export class UIContext {
  constructor(private ctx: Context) {}

  public render(options: RenderOptions): Intent {
    const layout: Record<string, unknown> = {};
    if (options.title) layout.title = options.title;
    if (options.subtitle) layout.subtitle = options.subtitle;

    const lines = options.bodyLines ?? options.body_lines;
    if (lines) {
      layout.body_lines = Array.isArray(lines) ? lines : [lines];
    }
    if (options.thumbnail) layout.thumbnail = options.thumbnail;

    const color = options.accentColor ?? options.accent_color;
    if (color !== undefined) {
      layout.accent_color =
        typeof color === "string" && color.startsWith("#")
          ? parseInt(color.replace("#", ""), 16)
          : Number(color);
    }

    if (options.buttons) {
      layout.buttons = options.buttons.map((b) =>
        b instanceof Button ? b.toJSON() : b
      );
    }
    if (options.selects) {
      layout.selects = options.selects.map((s) =>
        s instanceof Select ? s.toJSON() : s
      );
    }

    let canvasPayload: unknown = null;
    if (options.image) {
      if (typeof options.image === "object" && "toJSON" in options.image) {
        canvasPayload = options.image.toJSON();
        layout.image = `attachment://${(options.image as CanvasScene).filename}`;
      } else {
        layout.image = String(options.image);
      }
    }

    const intent: Intent = {
      op: "UI_RENDER",
      target: options.target ?? "EDIT_MAIN",
      ephemeral: options.ephemeral ?? false,
      mode: options.mode ?? "AUTO",
      layout,
    };
    if (canvasPayload) {
      intent.canvas_scene = canvasPayload;
    }

    this.ctx.addIntent(intent);
    return intent;
  }

  public renderCv2(
    container: Container | Record<string, unknown>,
    options?: { ephemeral?: boolean; target?: string; canvasScene?: CanvasScene | Record<string, unknown> }
  ): Intent {
    const layout = container instanceof Container ? container.toJSON() : container;
    const intent: Intent = {
      op: "UI_RENDER",
      target: options?.target ?? "EDIT_MAIN",
      ephemeral: options?.ephemeral ?? false,
      mode: "CV2",
      layout,
    };
    if (options?.canvasScene) {
      intent.canvas_scene =
        typeof (options.canvasScene as { toJSON?: () => unknown })?.toJSON === "function"
          ? (options.canvasScene as { toJSON: () => unknown }).toJSON()
          : options.canvasScene;
    }
    this.ctx.addIntent(intent);
    return intent;
  }

  public renderEmbed(
    embed: Embed | Record<string, unknown>,
    options?: { components?: unknown[]; ephemeral?: boolean; target?: string; canvasScene?: CanvasScene | Record<string, unknown> }
  ): Intent {
    const layout: Record<string, unknown> = {
      embed: embed instanceof Embed ? embed.toJSON() : embed,
    };
    if (options?.components) {
      layout.components = options.components.map((c) =>
        typeof (c as { toJSON?: () => unknown })?.toJSON === "function"
          ? (c as { toJSON: () => unknown }).toJSON()
          : c
      );
    }
    const intent: Intent = {
      op: "UI_RENDER",
      target: options?.target ?? "EDIT_MAIN",
      ephemeral: options?.ephemeral ?? false,
      mode: "CLASSIC_EMBED",
      layout,
    };
    if (options?.canvasScene) {
      intent.canvas_scene =
        typeof (options.canvasScene as { toJSON?: () => unknown })?.toJSON === "function"
          ? (options.canvasScene as { toJSON: () => unknown }).toJSON()
          : options.canvasScene;
    }
    this.ctx.addIntent(intent);
    return intent;
  }

  public replyEphemeral(textOrOptions: string | { text?: string; embed?: Embed; container?: Container }): Intent {
    if (typeof textOrOptions === "string") {
      return this.render({ bodyLines: [textOrOptions], ephemeral: true, target: "REPLY_EPHEMERAL" });
    }
    if (textOrOptions.container) {
      return this.renderCv2(textOrOptions.container, { ephemeral: true, target: "REPLY_EPHEMERAL" });
    }
    if (textOrOptions.embed) {
      return this.renderEmbed(textOrOptions.embed, { ephemeral: true, target: "REPLY_EPHEMERAL" });
    }
    return this.render({ bodyLines: [textOrOptions.text ?? ""], ephemeral: true, target: "REPLY_EPHEMERAL" });
  }

  public openModal(
    title: string,
    inputs: (TextInput | Record<string, unknown>)[],
    callbackId: string
  ): Intent {
    const serializedInputs = inputs.map((inp) =>
      inp instanceof TextInput ? inp.toJSON() : inp
    );
    const intent: Intent = {
      op: "UI_MODAL",
      title,
      callback_id: callbackId,
      inputs: serializedInputs,
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  // Snake_case aliases
  public render_cv2 = this.renderCv2.bind(this);
  public render_embed = this.renderEmbed.bind(this);
  public reply_ephemeral = this.replyEphemeral.bind(this);
  public open_modal = this.openModal.bind(this);
}

