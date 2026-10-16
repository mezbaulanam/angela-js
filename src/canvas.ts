export class CanvasLayer {
  public id: string;
  public cacheKey?: string;
  public ops: Record<string, unknown>[] = [];

  constructor(id: string, cacheKey?: string) {
    this.id = id;
    this.cacheKey = cacheKey;
  }

  public linearGradient(
    rect: number[],
    startRgb: number[],
    endRgb: number[],
    gamma = 1.0
  ): CanvasLayer {
    this.ops.push({
      type: "linear_gradient",
      rect: [...rect],
      start_rgb: [...startRgb],
      end_rgb: [...endRgb],
      gamma: Number(gamma),
    });
    return this;
  }

  public celestialBody(
    x: number,
    y: number,
    radius: number,
    glowRadius: number,
    color: number[],
    glowColor: number[]
  ): CanvasLayer {
    this.ops.push({
      type: "celestial_body",
      x: Math.floor(x),
      y: Math.floor(y),
      radius: Math.floor(radius),
      glow_radius: Math.floor(glowRadius),
      color: [...color],
      glow_color: [...glowColor],
    });
    return this;
  }

  public sineWaves(yStart: number, yEnd: number, count: number, color: number[]): CanvasLayer {
    this.ops.push({
      type: "sine_waves",
      y_start: Math.floor(yStart),
      y_end: Math.floor(yEnd),
      count: Math.floor(count),
      color: [...color],
    });
    return this;
  }

  public proceduralPalm(x: number, yBottom: number, yTop: number, seed = 0): CanvasLayer {
    this.ops.push({
      type: "procedural_palm",
      x: Math.floor(x),
      y_bottom: Math.floor(yBottom),
      y_top: Math.floor(yTop),
      seed: Math.floor(seed),
    });
    return this;
  }

  public vignette(depth: number, intensity: number): CanvasLayer {
    this.ops.push({
      type: "vignette",
      depth: Math.floor(depth),
      intensity: Number(intensity),
    });
    return this;
  }

  public radialGlow(
    x: number,
    y: number,
    radius: number,
    color: number[],
    maxAlpha = 255
  ): CanvasLayer {
    this.ops.push({
      type: "radial_glow",
      x: Math.floor(x),
      y: Math.floor(y),
      radius: Math.floor(radius),
      color: [...color],
      max_alpha: Math.floor(maxAlpha),
    });
    return this;
  }

  public sprite(
    assetKey: string,
    x: number,
    y: number,
    options?: { maxW?: number; max_w?: number; maxH?: number; max_h?: number; anchor?: string; flipX?: boolean; flip_x?: boolean; rotation?: number }
  ): CanvasLayer {
    const op: Record<string, unknown> = {
      type: "sprite",
      asset_key: assetKey,
      x: Math.floor(x),
      y: Math.floor(y),
      anchor: options?.anchor ?? "center",
      flip_x: options?.flipX ?? options?.flip_x ?? false,
      rotation: options?.rotation ?? 0,
    };
    const maxW = options?.maxW ?? options?.max_w;
    if (maxW !== undefined) op.max_w = Math.floor(maxW);
    const maxH = options?.maxH ?? options?.max_h;
    if (maxH !== undefined) op.max_h = Math.floor(maxH);
    this.ops.push(op);
    return this;
  }

  public avatar(
    userId: number | string,
    x: number,
    y: number,
    options?: { size?: number; circular?: boolean; borderColor?: number[]; border_color?: number[]; borderWidth?: number; border_width?: number }
  ): CanvasLayer {
    const op: Record<string, unknown> = {
      type: "avatar",
      user_id: Number(userId),
      x: Math.floor(x),
      y: Math.floor(y),
      size: options?.size ?? 80,
      circular: options?.circular ?? true,
      border_width: options?.borderWidth ?? options?.border_width ?? 0,
    };
    const bColor = options?.borderColor ?? options?.border_color;
    if (bColor) op.border_color = [...bColor];
    this.ops.push(op);
    return this;
  }

  public polygon(
    points: number[][],
    options?: { fill?: number[]; outline?: number[] }
  ): CanvasLayer {
    const op: Record<string, unknown> = {
      type: "polygon",
      points: points.map((p) => [...p]),
    };
    if (options?.fill) op.fill = [...options.fill];
    if (options?.outline) op.outline = [...options.outline];
    this.ops.push(op);
    return this;
  }

  public line(points: number[][], color: number[], width = 1): CanvasLayer {
    this.ops.push({
      type: "line",
      points: points.map((p) => [...p]),
      color: [...color],
      width: Math.floor(width),
    });
    return this;
  }

  public arc(
    bbox: number[],
    startDeg: number,
    endDeg: number,
    color: number[],
    width = 1
  ): CanvasLayer {
    this.ops.push({
      type: "arc",
      bbox: [...bbox],
      start_deg: Math.floor(startDeg),
      end_deg: Math.floor(endDeg),
      color: [...color],
      width: Math.floor(width),
    });
    return this;
  }

  public roundedRect(
    rect: number[],
    radius: number,
    options?: { fill?: number[]; outline?: number[]; width?: number }
  ): CanvasLayer {
    const op: Record<string, unknown> = {
      type: "rounded_rect",
      rect: [...rect],
      radius: Math.floor(radius),
      width: options?.width ?? 1,
    };
    if (options?.fill) op.fill = [...options.fill];
    if (options?.outline) op.outline = [...options.outline];
    this.ops.push(op);
    return this;
  }

  public progressBar(
    rect: number[],
    value: number,
    maxValue: number,
    bgColor: number[],
    fillColor: number[],
    radius = 0
  ): CanvasLayer {
    this.ops.push({
      type: "progress_bar",
      rect: [...rect],
      value: Number(value),
      max_value: Number(maxValue),
      bg_color: [...bgColor],
      fill_color: [...fillColor],
      radius: Math.floor(radius),
    });
    return this;
  }

  public textBox(
    rect: number[],
    text: string,
    options?: { font?: string; size?: number; color?: number[]; maxLines?: number; max_lines?: number; lineHeight?: number; line_height?: number }
  ): CanvasLayer {
    const op: Record<string, unknown> = {
      type: "text_box",
      rect: [...rect],
      text: String(text),
      font: options?.font ?? "regular",
      size: options?.size ?? 13,
      color: [...(options?.color ?? [255, 255, 255])],
      max_lines: options?.maxLines ?? options?.max_lines ?? 1,
    };
    const lh = options?.lineHeight ?? options?.line_height;
    if (lh !== undefined) op.line_height = Math.floor(lh);
    this.ops.push(op);
    return this;
  }

  // Snake_case aliases
  public linear_gradient = this.linearGradient.bind(this);
  public celestial_body = this.celestialBody.bind(this);
  public sine_waves = this.sineWaves.bind(this);
  public procedural_palm = this.proceduralPalm.bind(this);
  public radial_glow = this.radialGlow.bind(this);
  public rounded_rect = this.roundedRect.bind(this);
  public progress_bar = this.progressBar.bind(this);
  public text_box = this.textBox.bind(this);

  public toJSON(): Record<string, unknown> {
    const data: Record<string, unknown> = {
      id: this.id,
      ops: this.ops,
    };
    if (this.cacheKey) data.cache_key = this.cacheKey;
    return data;
  }
}

export class CanvasScene {
  public width: number;
  public height: number;
  public animated: boolean;
  public frameDurationMs: number;
  public filename: string;
  public layers: CanvasLayer[] = [];

  constructor(options?: {
    width?: number;
    height?: number;
    animated?: boolean;
    frameDurationMs?: number;
    frame_duration_ms?: number;
    filename?: string;
  }) {
    this.width = Math.min(options?.width ?? 640, 1280);
    this.height = Math.min(options?.height ?? 360, 720);
    this.animated = options?.animated ?? false;
    this.frameDurationMs = options?.frameDurationMs ?? options?.frame_duration_ms ?? 80;
    this.filename = options?.filename ?? "scene.png";
  }

  public layer(id: string, cacheKey?: string): CanvasLayer {
    const lyr = new CanvasLayer(id, cacheKey);
    this.layers.push(lyr);
    return lyr;
  }

  public toJSON(): Record<string, unknown> {
    return {
      width: this.width,
      height: this.height,
      animated: this.animated,
      frame_duration_ms: this.frameDurationMs,
      filename: this.filename,
      layers: this.layers.map((lyr) => lyr.toJSON()),
    };
  }
}

export class CanvasContext {
  public create(
    widthOrOptions?: number | { width?: number; height?: number; animated?: boolean; frameDurationMs?: number; filename?: string },
    height = 360,
    animated = false,
    frameDurationMs = 80,
    filename = "scene.png"
  ): CanvasScene {
    if (typeof widthOrOptions === "object") {
      return new CanvasScene(widthOrOptions);
    }
    return new CanvasScene({
      width: widthOrOptions ?? 640,
      height,
      animated,
      frameDurationMs,
      filename,
    });
  }
}

