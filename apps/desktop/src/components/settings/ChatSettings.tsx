import { type ThrottleSpeed, useChatStore } from "@/store/chatStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Slider } from "@repo/ui/components/ui/slider";
import { Switch } from "@repo/ui/components/ui/switch";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useState } from "react";
import { SettingItem } from "./SettingItem";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";

export function ChatSettings() {
  const { toast } = useToast();

  const {
    throttleResponse,
    setThrottleResponse,
    throttleSpeed,
    setThrottleSpeed,
    useCmdEnterToSend,
    setUseCmdEnterToSend,
    useAIMemory,
    setUseAIMemory,
    contextWindowSize,
    setContextWindowSize,
    userBio,
    setUserBio,
  } = useChatStore();

  const { selectedLanguage, setSelectedLanguage } = useSettingsStore();

  const [localThrottleSpeed, setLocalThrottleSpeed] =
    useState<ThrottleSpeed>(throttleSpeed);
  const [localSelectedLanguage, setLocalSelectedLanguage] =
    useState(selectedLanguage);
  const [localUserBio, setLocalUserBio] = useState(userBio);

  const handleSave = () => {
    setThrottleSpeed(localThrottleSpeed);
    setSelectedLanguage(localSelectedLanguage);
    setUserBio(localUserBio);
    showSettingsSavedToast(toast);
  };

  return (
    <SettingsCard title="Chat Settings" onSave={handleSave}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">User Profile</h2>
          <SettingItem
            label="Your Bio"
            tooltip="Add information about yourself that will help the AI understand you better, you can also add specific instructions for the AI to follow. This will be included in every chat."
          >
            <Textarea
              placeholder="Add information about yourself, your goals, work style, you can also add specific instructions for the AI to follow."
              value={localUserBio}
              onChange={(e) => setLocalUserBio(e.target.value)}
              className="min-h-[100px]"
            />
          </SettingItem>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">AI Memory & Context</h2>
          <SettingItem
            label="AI Memory (beta)"
            tooltip="When enabled, the AI will remember context from previous chats and tasks. This requires more system resources and may impact performance."
          >
            <Switch
              id="use-ai-memory"
              checked={useAIMemory}
              onCheckedChange={setUseAIMemory}
            />
          </SettingItem>

          <SettingItem
            label="Context Window Size"
            tooltip="Controls how much context the AI can see at once. Larger values require more system resources. Default is 4096."
          >
            <div className="flex items-center gap-4">
              <Slider
                value={[contextWindowSize]}
                onValueChange={(value) => setContextWindowSize(value[0])}
                min={1024}
                max={32768}
                step={1024}
                className="w-[200px]"
              />
              <Input
                type="number"
                min={1024}
                max={32768}
                step={1024}
                value={contextWindowSize}
                onChange={(e) => setContextWindowSize(Number(e.target.value))}
                className="w-24"
              />
            </div>
          </SettingItem>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Response Settings</h2>
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
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Language</h2>
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
                  <SelectItem value="Arabic">العربية</SelectItem>
                  <SelectItem value="Chinese">中文 (简体)</SelectItem>
                  <SelectItem value="Dutch">Nederlands</SelectItem>
                  <SelectItem value="Finnish">Suomi</SelectItem>
                  <SelectItem value="French">Français</SelectItem>
                  <SelectItem value="German">Deutsch</SelectItem>
                  <SelectItem value="Hindi">हिन्दी</SelectItem>
                  <SelectItem value="Italian">Italiano</SelectItem>
                  <SelectItem value="Japanese">日本語</SelectItem>
                  <SelectItem value="Polish">Polski</SelectItem>
                  <SelectItem value="Portuguese">Português</SelectItem>
                  <SelectItem value="Romanian">Română</SelectItem>
                  <SelectItem value="Russian">Русский</SelectItem>
                  <SelectItem value="Spanish">Español</SelectItem>
                  <SelectItem value="Thai">ไทย</SelectItem>
                  <SelectItem value="Turkish">Türkçe</SelectItem>
                  <SelectItem value="Vietnamese">Tiếng Việt</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </SettingItem>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Input & Controls</h2>
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
        </div>
      </div>
    </SettingsCard>
  );
}
