export type AIProvider =
  | "ollama"
  | "openai"
  | "focu"
  | "openrouter"
  | "openai-compatible";

export interface BaseProviderConfig {
  enabled: boolean;
  name: AIProvider;
  displayName: string;
  description: string;
  websiteUrl?: string;
}

export interface OllamaConfig extends BaseProviderConfig {
  name: "ollama";
  contextLength: number;
}

export interface OpenAIConfig extends BaseProviderConfig {
  name: "openai";
  apiKey: string;
  baseUrl: string;
}

export interface OpenAICompatibleConfig extends BaseProviderConfig {
  name: "openai-compatible";
  apiKey?: string;
  baseUrl: string;
}

export interface FocuConfig extends BaseProviderConfig {
  name: "focu";
  licenseKey: string;
}

export interface OpenRouterConfig extends BaseProviderConfig {
  name: "openrouter";
  apiKey: string;
}

export type ProviderConfig =
  | OllamaConfig
  | OpenAIConfig
  | FocuConfig
  | OpenRouterConfig
  | OpenAICompatibleConfig;

// Model types
export interface BaseModelInfo {
  id: string;
  displayName: string;
  provider: AIProvider;
  description: string;
  tags?: string[];
  contextLength?: number;
  priceIn?: number | null; // Price per 1 million input tokens in USD
  priceOut?: number | null; // Price per 1 million output tokens in USD
}

export interface OllamaModelInfo extends BaseModelInfo {
  provider: "ollama";
  size: string;
  parameters: string;
}

export interface CloudModelInfo extends BaseModelInfo {
  provider: "openai" | "focu" | "openrouter" | "openai-compatible";
}

export type ModelInfo = OllamaModelInfo | CloudModelInfo;

export type ProviderStatus = {
  isAvailable: boolean;
  error?: string;
};

export const DEFAULT_MODELS: ModelInfo[] = [
  {
    id: "cognitivecomputations/dolphin3.0-mistral-24b:free",
    displayName: "Dolphin 3.0 Mistral 24B (Free)",
    provider: "openrouter",
    description:
      "Dolphin 3.0 is the next generation of the Dolphin series of instruct-tuned models. Dolphin aims to be a general purpose instruct model, similar to the models behind ChatGPT, Claude, Gemini.",
    tags: ["Featured", "Free"],
    contextLength: 32768,
    priceIn: 0,
    priceOut: 0,
  },

  {
    id: "google/gemini-2.0-flash-lite-001",
    displayName: "Gemini 2.0 Flash Lite",
    provider: "openrouter",
    description:
      "Gemini Flash 2.0 Lite is an even more cost-effective version of Gemini Flash 2.0.",
    tags: ["Featured"],
    contextLength: 1048576,
    priceIn: 0.075,
    priceOut: 0.3,
  },
  {
    id: "google/gemini-2.0-flash-001",
    displayName: "Gemini 2.0 Flash",
    provider: "openrouter",
    description:
      "Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to Gemini Flash 1.5, while maintaining quality on par with larger models like Gemini Pro 1.5.",
    tags: ["Featured"],
    contextLength: 1000000,
    priceIn: 0.1,
    priceOut: 0.4,
  },
  {
    id: "mistralai/mistral-nemo",
    displayName: "Mistral Nemo",
    provider: "openrouter",
    description:
      "A 12B parameter model with a 128k token context length built by Mistral in collaboration with NVIDIA",
    tags: ["Featured"],
    contextLength: 131072,
    priceIn: 0.035,
    priceOut: 0.08,
  },
  {
    id: "openai/gpt-4o",
    displayName: "GPT-4o",
    provider: "openrouter",
    description: "High-intelligence model by OpenAI for complex tasks",
    tags: ["Featured"],
    contextLength: 128000,
    priceIn: 2.5,
    priceOut: 10.0,
  },
  {
    id: "openai/gpt-4o-mini",
    displayName: "GPT-4o-mini",
    provider: "openrouter",
    description: "Affordable small model by OpenAIfor fast, everyday tasks",
    tags: ["Featured"],
    contextLength: 128000,
    priceIn: 0.15,
    priceOut: 0.6,
  },
  {
    id: "gpt-4o",
    displayName: "GPT-4o",
    provider: "openai",
    description: "High-intelligence model for complex tasks",
    tags: ["Featured"],
    contextLength: 128000,
    priceIn: 2.5,
    priceOut: 10.0,
  },
  {
    id: "gpt-4o-mini",
    displayName: "GPT-4o-mini",
    provider: "openai",
    description: "Affordable small model for fast, everyday tasks",
    tags: ["Featured"],
    contextLength: 128000,
    priceIn: 0.15,
    priceOut: 0.6,
  },
  {
    id: "gpt-o3-mini",
    displayName: "GPT-o3-mini",
    provider: "openai",
    description: "Affordable small model for fast, everyday tasks",
    tags: ["Featured"],
    contextLength: 128000,
    priceIn: 0.15,
    priceOut: 0.6,
  },
];

export const DEFAULT_PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  openai: {
    name: "openai",
    displayName: "OpenAI",
    description:
      "OpenAI provides access to powerful language models like GPT-4 and GPT-3.5. An API key is required to use OpenAI models. You can get one from the OpenAI platform.",
    enabled: false,
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    websiteUrl: "https://platform.openai.com",
  },
  openrouter: {
    name: "openrouter",
    displayName: "Open Router",
    description:
      "OpenRouter provides unified access to various AI models from different providers including Anthropic, Google, and Meta. An API key is required to use OpenRouter models. You can get one from the OpenRouter website.",
    enabled: false,
    apiKey: "",
    websiteUrl: "https://openrouter.ai",
  },
  "openai-compatible": {
    name: "openai-compatible",
    displayName: "OpenAI Compatible",
    description:
      "OpenAI Compatible allows you to connect to any API endpoint that implements the OpenAI API specification. An API key may be required depending on your endpoint configuration.",
    enabled: false,
    apiKey: "",
    baseUrl: "",
  },
  // focu: {
  //   name: "focu",
  //   displayName: "Focu Cloud",
  //   description: "Access Focu Cloud AI services",
  //   enabled: false,
  //   licenseKey: "",
  // },
};
