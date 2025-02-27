import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function ApiKeyInput({
  value,
  onChange,
  placeholder = "sk-...",
  label = "API Key",
}: ApiKeyInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="apiKey">{label}</Label>
      <Input
        id="apiKey"
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
