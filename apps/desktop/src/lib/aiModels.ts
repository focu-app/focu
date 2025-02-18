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
  contextLength: number;
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
    id: "google/gemini-2.0-flash-lite-preview-02-05:free",
    displayName: "Gemini 2.0 Flash Lite (Free)",
    provider: "openrouter",
    description:
      "Google: Gemini Flash Lite 2.0 Experimental. Free until 24 February.",
    tags: ["Featured", "Free"],
    contextLength: 1000000,
    priceIn: 0,
    priceOut: 0,
  },
  {
    id: "google/gemini-2.0-flash-001",
    displayName: "Gemini 2.0 Flash",
    provider: "openrouter",
    description:
      "Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to Gemini Flash 1.5, while maintaining quality on par with larger models like Gemini Pro 1.5. It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling",
    tags: ["Featured"],
    contextLength: 1000000,
    priceIn: 0.1,
    priceOut: 0.4,
  },
  {
    id: "openai/gpt-4o",
    displayName: "GPT-4o",
    provider: "openrouter",
    description: "High-intelligence model for complex tasks",
    tags: ["Featured"],
    contextLength: 128000,
    priceIn: 2.5,
    priceOut: 10.0,
  },
  {
    id: "openai/gpt-4o-mini",
    displayName: "GPT-4o-mini",
    provider: "openrouter",
    description: "Affordable small model for fast, everyday tasks",
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
    description: "Access GPT-4 and other OpenAI models",
    enabled: false,
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
  },
  openrouter: {
    name: "openrouter",
    displayName: "Open Router",
    description: "Access various AI models through Open Router",
    enabled: false,
    apiKey: "",
  },
  "openai-compatible": {
    name: "openai-compatible",
    displayName: "OpenAI Compatible",
    description: "Access OpenAI-compatible API endpoints",
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
