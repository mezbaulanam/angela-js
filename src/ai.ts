import type { Context } from "./context.js";
import type { Intent } from "./models.js";

export class AIContext {
  constructor(private ctx: Context) {}

  public generateJson(
    systemPrompt: string,
    userPrompt: string,
    tier = "ai_low",
    temperature = 1.0,
    maxTokens = 400,
    callback = "on_ai_ready"
  ): Intent {
    const intent: Intent = {
      op: "AI_GENERATE",
      tier,
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      temperature: Number(temperature),
      max_tokens: Math.floor(maxTokens),
      callback_event_id: callback,
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public generate_json = this.generateJson.bind(this);
}

export class MediaContext {
  constructor(private ctx: Context) {}

  public searchGif(query: string, callback = "on_gif_ready"): Intent {
    const intent: Intent = {
      op: "MEDIA_SEARCH_GIF",
      query: String(query),
      callback_event_id: callback,
    };
    this.ctx.addIntent(intent);
    return intent;
  }

  public search_gif = this.searchGif.bind(this);
}

