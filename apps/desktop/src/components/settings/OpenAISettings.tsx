import { ProviderSettings } from "./ProviderSettings";

export function OpenAISettings() {
  return (
    <ProviderSettings
      provider="openai"
      title="OpenAI Settings"
      keyPlaceholder="sk-..."
    />
  );
}
