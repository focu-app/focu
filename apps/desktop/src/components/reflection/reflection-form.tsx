"use client";

import { useChatStore } from "@/store/chatStore";
import { useOllamaStore } from "@/store/ollamaStore";
import type { Chat, Reflection } from "@/database/db";
import { db } from "@/database/db";
import {
  addReflection,
  getReflectionForYear,
  updateReflection,
} from "@/database/reflections";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type QuestionType = "text" | "single-word";

interface Question {
  id: string;
  prompt: string;
  type: QuestionType;
  maxLength?: number;
}

interface ReflectionSection {
  pastYear: Question[];
  yearAhead: Question[];
}

const yearReflection: ReflectionSection = {
  pastYear: [
    {
      id: "highlights",
      prompt: "What were your top 3 achievements this year?",
      type: "text",
      maxLength: 500,
    },
    {
      id: "biggest_lesson",
      prompt: "What was the most important lesson you learned?",
      type: "text",
      maxLength: 280,
    },
    {
      id: "gratitude",
      prompt: "What are you most grateful for?",
      type: "text",
      maxLength: 280,
    },
    {
      id: "challenges_overcome",
      prompt: "What challenges did you overcome?",
      type: "text",
      maxLength: 500,
    },
    {
      id: "yearWord",
      prompt: "Sum up your year in one word",
      type: "single-word",
    },
  ],
  yearAhead: [
    {
      id: "goals",
      prompt: "What are your top 3 goals for the year ahead?",
      type: "text",
      maxLength: 500,
    },
    {
      id: "growth_area",
      prompt: "Which area of your life needs most attention?",
      type: "text",
      maxLength: 280,
    },
    {
      id: "habits",
      prompt: "Which habits would you like to build?",
      type: "text",
      maxLength: 500,
    },
    {
      id: "commitment",
      prompt: "What's one promise you're making to yourself?",
      type: "text",
      maxLength: 280,
    },
    {
      id: "futureWord",
      prompt: "Write one word to guide your year ahead",
      type: "single-word",
    },
  ],
};

interface QuestionInputProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

const QuestionInput = ({
  question,
  value,
  onChange,
  onBlur,
}: QuestionInputProps) => {
  if (question.type === "text") {
    return (
      <Textarea
        className="mt-1"
        maxLength={question.maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    );
  }

  if (question.type === "single-word") {
    return (
      <Input
        className="mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    );
  }

  return null;
};

interface QuestionSectionProps {
  title: string;
  description: string;
  questions: Question[];
  values: Record<string, string>;
  onValueChange: (id: string, value: string) => void;
  onBlur: () => void;
  isReadOnly?: boolean;
}

const QuestionSection = ({
  title,
  description,
  questions,
  values,
  onValueChange,
  onBlur,
  isReadOnly = false,
}: QuestionSectionProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {questions.map((question) => {
            const value = values[question.id];
            if (isReadOnly && !value?.trim()) {
              return null;
            }
            return (
              <div key={question.id} className="space-y-2">
                <Label className="text-lg font-medium">{question.prompt}</Label>
                {isReadOnly ? (
                  <div className="mt-2 whitespace-pre-wrap rounded-md border bg-muted px-3 py-2">
                    {value}
                  </div>
                ) : (
                  <QuestionInput
                    question={question}
                    value={value || ""}
                    onChange={(value) => onValueChange(question.id, value)}
                    onBlur={onBlur}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

interface ChatActionsProps {
  existingChat: Chat | undefined;
  onStartChat: (e: React.FormEvent) => Promise<void>;
  onContinueChat: () => void;
}

const ChatActions = ({
  existingChat,
  onStartChat,
  onContinueChat,
}: ChatActionsProps) => {
  return (
    <div className="flex gap-2">
      {existingChat ? (
        <>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onStartChat}
          >
            Start New Chat
          </Button>
          <Button type="button" size="lg" onClick={onContinueChat}>
            Continue Chat
          </Button>
        </>
      ) : (
        <Button type="button" size="lg" onClick={onStartChat}>
          Start Chat
        </Button>
      )}
    </div>
  );
};

export default function ReflectionForm() {
  const router = useRouter();
  const { activeModel } = useOllamaStore();
  const addChat = useChatStore((state) => state.addChat);
  const sendChatMessage = useChatStore((state) => state.sendChatMessage);
  const selectedDate = useChatStore((state) => state.selectedDate);
  const setSelectedDate = useChatStore((state) => state.setSelectedDate);
  const [formData, setFormData] = useState<
    Record<string, Record<string, string>>
  >({
    pastYear: {},
    yearAhead: {},
  });
  const [reflectionId, setReflectionId] = useState<number | undefined>();
  const [status, setStatus] = useState<"draft" | "finished">("draft");
  const currentYear = 2024;
  const topRef = useRef<HTMLDivElement>(null);
  const [existingChat, setExistingChat] = useState<Chat | undefined>();

  useEffect(() => {
    const fetchExistingChat = async () => {
      const chats = await db.chats.where("type").equals("year-end").toArray();
      const latestChat = chats
        .filter(
          (c) =>
            c.createdAt && new Date(c.createdAt) > new Date(currentYear, 0, 1),
        )
        .sort((a, b) => b.createdAt! - a.createdAt!)[0];

      setExistingChat(latestChat);
    };

    fetchExistingChat();
  }, []);

  useEffect(() => {
    // Load existing reflection data when component mounts
    const loadReflection = async () => {
      const reflection = await getReflectionForYear(currentYear);
      if (reflection) {
        setFormData({
          pastYear: reflection.pastYear,
          yearAhead: reflection.yearAhead,
        });
        setReflectionId(reflection.id);
        setStatus(reflection.status || "draft");
      }
    };

    loadReflection();
  }, []);

  const handleValueChange =
    (section: "pastYear" | "yearAhead") => (id: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [id]: value,
        },
      }));
    };

  const saveReflection = async () => {
    const reflectionData: Reflection = {
      year: currentYear,
      type: "yearly",
      pastYear: formData.pastYear,
      yearAhead: formData.yearAhead,
      status: status,
    };

    if (reflectionId) {
      await updateReflection(reflectionId, reflectionData);
    } else {
      const id = await addReflection(reflectionData);
      setReflectionId(id);
    }
  };

  const handleFinishReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    const reflectionData: Reflection = {
      year: currentYear,
      type: "yearly",
      pastYear: formData.pastYear,
      yearAhead: formData.yearAhead,
      status: "finished",
    };

    if (reflectionId) {
      await updateReflection(reflectionId, reflectionData);
    } else {
      const id = await addReflection(reflectionData);
      setReflectionId(id);
    }
    setStatus("finished");
    setTimeout(() => {
      topRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 10);
  };

  const handleEditReflection = async () => {
    const reflectionData: Reflection = {
      year: currentYear,
      type: "yearly",
      pastYear: formData.pastYear,
      yearAhead: formData.yearAhead,
      status: "draft",
    };

    if (reflectionId) {
      await updateReflection(reflectionId, reflectionData);
    }
    setStatus("draft");
  };

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !activeModel) {
      return;
    }

    const dateString = format(new Date(), "yyyy-MM-dd");

    // Create a new chat
    const chatId = await addChat({
      title: "2024 Year-End Reflection",
      dateString,
      type: "year-end",
      model: activeModel,
    });

    // Format and send the reflection data
    const message = formatReflectionForAI();

    setSelectedDate(dateString);

    // Navigate to the chat
    router.push(`/chat?id=${chatId}`);

    await sendChatMessage(chatId, message);
  };

  const handleContinueChat = () => {
    if (existingChat) {
      setSelectedDate(existingChat.dateString);
      router.push(`/chat?id=${existingChat.id}`);
    }
  };

  const formatReflectionForAI = (): string => {
    const sections = [
      {
        title: "Past Year (2024)",
        questions: yearReflection.pastYear,
        answers: formData.pastYear,
      },
      {
        title: "Year Ahead (2025)",
        questions: yearReflection.yearAhead,
        answers: formData.yearAhead,
      },
    ];

    return sections
      .map((section) => {
        const answeredQuestions = section.questions.filter(
          (q) => section.answers[q.id] && section.answers[q.id].trim() !== "",
        );

        if (answeredQuestions.length === 0) return "";

        return `# ${section.title}

${answeredQuestions
  .map(
    (q) => `**${q.prompt}**\n
${section.answers[q.id].replace(/\n/g, "  \n")}`,
  )
  .join("\n\n")}`;
      })
      .filter(Boolean)
      .join("\n\n");
  };

  if (status === "finished") {
    return (
      <div className="flex flex-col gap-8">
        <div ref={topRef} />
        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Reflection Complete! 🎉</h2>
            <p className="text-muted-foreground">
              You've finished your reflection. Well done!
            </p>
            <p className="text-muted-foreground">
              You can now use Focu to reflect further. Reflection can help you
              process it, extract insights, create actionable steps and make it
              more meaningful.
            </p>
            <div className="flex flex-row justify-between gap-2">
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={handleEditReflection}
              >
                Edit
              </Button>
              <ChatActions
                existingChat={existingChat}
                onStartChat={handleStartChat}
                onContinueChat={handleContinueChat}
              />
            </div>
          </div>
        </div>

        <QuestionSection
          title="Past Year (2024)"
          description="Your reflections on the past year"
          questions={yearReflection.pastYear}
          values={formData.pastYear}
          onValueChange={() => {}}
          onBlur={() => {}}
          isReadOnly={true}
        />

        <QuestionSection
          title="Year Ahead (2025)"
          description="Your intentions for the coming year"
          questions={yearReflection.yearAhead}
          values={formData.yearAhead}
          onValueChange={() => {}}
          onBlur={() => {}}
          isReadOnly={true}
        />

        {/* <div className="flex justify-between gap-2">
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={handleEditReflection}
          >
            Edit
          </Button>
          <ChatActions
            existingChat={existingChat}
            onStartChat={handleStartChat}
            onContinueChat={handleContinueChat}
          />
        </div> */}
      </div>
    );
  }

  return (
    <form onSubmit={handleFinishReflection} className="flex flex-col gap-8">
      <QuestionSection
        title="Past Year (2024)"
        description="Reflect on your experiences and achievements of the year. Take your time and write as much as you want. You don't have to finish it all in one go. Your answers will be saved automatically."
        questions={yearReflection.pastYear}
        values={formData.pastYear}
        onValueChange={handleValueChange("pastYear")}
        onBlur={saveReflection}
      />

      <QuestionSection
        title="Year Ahead (2025)"
        description="Set your intentions and focus for the coming year"
        questions={yearReflection.yearAhead}
        values={formData.yearAhead}
        onValueChange={handleValueChange("yearAhead")}
        onBlur={saveReflection}
      />
      <div className="flex justify-end gap-2">
        <Button type="submit" size="lg">
          Finish Reflection
        </Button>
      </div>
    </form>
  );
}
