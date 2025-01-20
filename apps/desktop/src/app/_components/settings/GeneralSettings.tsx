import { useChatStore, type ThrottleSpeed } from "@/app/store/chatStore";
import { useOllamaStore } from "@/app/store";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Switch } from "@repo/ui/components/ui/switch";
import { ModeToggle } from "@repo/ui/components/ui/theme-toggle";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";
import { SettingItem } from "./SettingItem";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@repo/ui/components/ui/select";

export function GeneralSettings() {
  const { toast } = useToast();

  const {
    throttleResponse,
    setThrottleResponse,
    throttleSpeed,
    setThrottleSpeed,
    useCmdEnterToSend,
    setUseCmdEnterToSend,
  } = useChatStore();

  const {
    automaticUpdatesEnabled,
    setAutomaticUpdatesEnabled,
    automaticDownloadEnabled,
    setAutomaticDownloadEnabled,
    selectedLanguage,
    setSelectedLanguage,
  } = useOllamaStore();

  const [localThrottleSpeed, setLocalThrottleSpeed] =
    useState<ThrottleSpeed>(throttleSpeed);
  const [localSelectedLanguage, setLocalSelectedLanguage] =
    useState(selectedLanguage);

  const handleSave = () => {
    setThrottleSpeed(localThrottleSpeed);
    setSelectedLanguage(localSelectedLanguage);
    showSettingsSavedToast(toast);
  };

  return (
    <SettingsCard title="General Settings" onSave={handleSave}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Appearance</h2>
          <SettingItem label="Theme">
            <div className="relative">
              <ModeToggle />
            </div>
          </SettingItem>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Chat Experience</h2>
          <SettingItem
            label="Use ⌘+Enter to send"
            tooltip="When enabled, requires ⌘+Enter to send messages. When disabled, just press Enter to send"
          >
            <Switch
              id="use-cmd-enter"
              checked={useCmdEnterToSend}
              onCheckedChange={setUseCmdEnterToSend}
            />
          </SettingItem>

          <SettingItem
            label="Throttle AI Response"
            tooltip="Controls whether AI responses appear instantly or are typed out gradually"
          >
            <Switch
              id="throttle-response"
              checked={throttleResponse}
              onCheckedChange={setThrottleResponse}
            />
          </SettingItem>

          {throttleResponse && (
            <SettingItem
              label="Throttle Speed"
              tooltip="Adjust how quickly the AI response text appears on screen"
            >
              <RadioGroup
                value={localThrottleSpeed}
                onValueChange={(value) =>
                  setLocalThrottleSpeed(value as ThrottleSpeed)
                }
              >
                {["slow", "medium", "fast"].map((speed) => (
                  <div key={speed} className="flex items-center space-x-2">
                    <RadioGroupItem value={speed} id={speed} />
                    <Label htmlFor={speed} className="capitalize">
                      {speed}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </SettingItem>
          )}
          <SettingItem
            label="AI Language"
            tooltip="Select the language for AI responses. The AI will communicate with you in the selected language. Please note that only English is fully tested at the moment."
          >
            <Select
              value={localSelectedLanguage}
              onValueChange={setLocalSelectedLanguage}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="German">Deutsch</SelectItem>
                  <SelectItem value="French">Français</SelectItem>
                  <SelectItem value="Italian">Italiano</SelectItem>
                  <SelectItem value="Portuguese">Português</SelectItem>
                  <SelectItem value="Hindi">हिन्दी</SelectItem>
                  <SelectItem value="Spanish">Español</SelectItem>
                  <SelectItem value="Thai">ไทย</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </SettingItem>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Updates</h2>
          <SettingItem label="Automatically check for updates">
            <Switch
              id="automatic-updates"
              checked={automaticUpdatesEnabled}
              onCheckedChange={setAutomaticUpdatesEnabled}
            />
          </SettingItem>
          {automaticUpdatesEnabled && (
            <SettingItem label="Automatically install updates">
              <Switch
                id="automatic-download"
                checked={automaticDownloadEnabled}
                onCheckedChange={setAutomaticDownloadEnabled}
              />
            </SettingItem>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}
