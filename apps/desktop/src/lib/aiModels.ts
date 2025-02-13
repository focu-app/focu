export type AIProvider = "ollama" | "openai" | "anthropic" | "focu";

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

export type ProviderConfig = OllamaConfig | OpenAIConfig | FocuConfig;

// Model types
export interface BaseModelInfo {
  id: string;
  displayName: string;
  provider: AIProvider;
  description: string;
  tags?: string[];
  contextLength: number;
}

export interface OllamaModelInfo extends BaseModelInfo {
  provider: "ollama";
  size: string;
  parameters: string;
}

export interface CloudModelInfo extends BaseModelInfo {
  provider: "openai" | "focu";
}

export type ModelInfo = OllamaModelInfo | CloudModelInfo;

export type ProviderStatus = {
  isAvailable: boolean;
  error?: string;
};

export const DEFAULT_MODELS: ModelInfo[] = [
  {
    id: "llama3.2:3b",
    displayName: "Llama 3.2 (3B)",
    provider: "ollama",
    description:
      "Created by Meta. Works well on most Mac computers with at least 8GB RAM.",
    tags: ["Featured"],
    contextLength: 4096,
    size: "~2GB",
    parameters: "3B",
  },
  {
    id: "gpt-4-turbo",
    displayName: "GPT-4 Turbo",
    provider: "openai",
    description: "Most capable OpenAI model, best for complex tasks.",
    tags: ["Featured"],
    contextLength: 128000,
  },
  {
    id: "claude-3-sonnet",
    displayName: "Claude 3 Sonnet",
    provider: "anthropic",
    description: "Fast and capable model from Anthropic.",
    tags: ["Featured"],
    contextLength: 200000,
  },
];

export const DEFAULT_PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  ollama: {
    name: "ollama",
    displayName: "Ollama",
    description: "Run AI models locally on your computer",
    enabled: true,
    contextLength: 4096,
  },
  openai: {
    name: "openai",
    displayName: "OpenAI",
    description: "Access GPT-4 and other OpenAI models",
    enabled: false,
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
  },
  focu: {
    name: "focu",
    displayName: "Focu Cloud",
    description: "Access Focu Cloud AI services",
    enabled: false,
    licenseKey: "",
  },
};
