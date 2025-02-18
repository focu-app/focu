import { ProviderSettings } from "./ProviderSettings";

export function OpenAICompatibleSettings() {
  return (
    <ProviderSettings
      provider="openai-compatible"
      title="OpenAI Compatible Settings"
      keyPlaceholder="sk-... (optional)"
      showBaseUrl
    />
  );
}
