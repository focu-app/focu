export type AIProvider = "ollama" | "openai" | "focu" | "openrouter";

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
  | OpenRouterConfig;

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
  provider: "openai" | "focu" | "openrouter";
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
      "Free version of Google's Gemini 2.0 Flash Lite model - fast and efficient",
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
      "Google's Gemini 2.0 Flash model - premium version with enhanced capabilities",
    tags: ["Featured", "Premium"],
    contextLength: 1000000,
    priceIn: null,
    priceOut: null,
  },
  {
    id: "qwen/qwen2.5-vl-72b-instruct",
    displayName: "Qwen 2.5 VL 72B (Free)",
    provider: "openrouter",
    description:
      "Free version of Qwen's large visual language model with 72B parameters",
    tags: ["Featured", "Free"],
    contextLength: 32768,
    priceIn: 0,
    priceOut: 0,
  },
  {
    id: "openai/o3-mini",
    displayName: "OpenAI: o3 Mini",
    provider: "openrouter",
    description: "Most capable OpenAI model",
    tags: ["Featured"],
    contextLength: 200000,
    priceIn: null,
    priceOut: null,
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
  // focu: {
  //   name: "focu",
  //   displayName: "Focu Cloud",
  //   description: "Access Focu Cloud AI services",
  //   enabled: false,
  //   licenseKey: "",
  // },
};
