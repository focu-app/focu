"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { useChatStore } from "@/app/store/chatStore";
import { useOllamaStore } from "@/app/store";
import {
  getReflectionForYear,
  addReflection,
  updateReflection,
} from "@/database/reflections";
import type { Reflection } from "@/database/db";
import { db } from "@/database/db";
import { useLiveQuery } from "dexie-react-hooks";

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
}

const QuestionSection = ({
  title,
  description,
  questions,
  values,
  onValueChange,
  onBlur,
}: QuestionSectionProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label className="text-lg font-medium">{question.prompt}</Label>
              <QuestionInput
                question={question}
                value={values[question.id] || ""}
                onChange={(value) => onValueChange(question.id, value)}
                onBlur={onBlur}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ReflectionForm() {
  const router = useRouter();
  const { activeModel } = useOllamaStore();
  const addChat = useChatStore((state) => state.addChat);
  const sendChatMessage = useChatStore((state) => state.sendChatMessage);
  const selectedDate = useChatStore((state) => state.selectedDate);
  const [formData, setFormData] = useState<
    Record<string, Record<string, string>>
  >({
    pastYear: {},
    yearAhead: {},
  });
  const [reflectionId, setReflectionId] = useState<number | undefined>();
  const currentYear = 2024;

  const existingChat = useLiveQuery(async () => {
    const chats = await db.chats.where("type").equals("year-end").toArray();
    return chats
      .filter(
        (c) =>
          c.createdAt && new Date(c.createdAt) > new Date(currentYear, 0, 1),
      )
      .sort((a, b) => b.createdAt! - a.createdAt!)[0];
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
    };

    if (reflectionId) {
      await updateReflection(reflectionId, reflectionData);
    } else {
      const id = await addReflection(reflectionData);
      setReflectionId(id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !activeModel) {
      return;
    }

    // Create a new chat
    const chatId = await addChat({
      title: "2024 Year-End Reflection",
      date: new Date(selectedDate).setHours(0, 0, 0, 0),
      type: "year-end",
      model: activeModel,
    });

    // Format and send the reflection data
    const message = formatReflectionForAI();

    // Navigate to the chat
    router.push(`/chat?id=${chatId}`);

    await sendChatMessage(chatId, message);
  };

  const handleSaveAndExit = async (e: React.MouseEvent) => {
    e.preventDefault();
    await saveReflection();
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <QuestionSection
        title="Past Year (2024)"
        description="Reflect on your experiences and achievements of the year. Take your time and write as much as you want. You don't have to finish it all in one go."
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
      <div className="flex justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleSaveAndExit}
        >
          Save & Exit
        </Button>
        <div className="flex gap-2">
          {existingChat ? (
            <>
              <Button type="submit" variant="secondary" size="lg">
                Start New Reflection Chat
              </Button>
              <Link href={`/chat?id=${existingChat.id}`}>
                <Button type="button" size="lg">
                  Continue Chat
                </Button>
              </Link>
            </>
          ) : (
            <Button type="submit" size="lg">
              Start Reflection Chat
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
