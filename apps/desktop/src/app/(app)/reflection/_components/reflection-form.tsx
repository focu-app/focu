"use client";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
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

type QuestionType = "list" | "text" | "single-word";

interface Question {
  id: string;
  prompt: string;
  type: QuestionType;
  maxItems?: number;
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
      type: "text", // changed from "list" to "text"
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
      type: "text", // changed from "list" to "text"
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
      type: "text", // changed from "list" to "text"
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
      type: "text", // changed from "list" to "text"
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
      prompt: "Choose one word to guide your year ahead",
      type: "single-word",
    },
  ],
};

const QuestionInput = ({ question }: { question: Question }) => {
  const [listItems, setListItems] = useState<string[]>(
    Array(question.maxItems || 1).fill(""),
  );

  if (question.type === "list") {
    return (
      <div className="space-y-2">
        {listItems.map((_, index) => (
          <div key={`${question.id}-${index}`}>
            <Input className="mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (question.type === "text") {
    return <Textarea className="mt-1" maxLength={question.maxLength} />;
  }

  if (question.type === "single-word") {
    return <Input className="mt-1" />;
  }

  return null;
};

const QuestionSection = ({ questions }: { questions: Question[] }) => {
  return (
    <div className="space-y-8">
      {questions.map((question) => (
        <div key={question.id} className="space-y-2">
          <Label className="text-lg font-medium">{question.prompt}</Label>
          <QuestionInput question={question} />
        </div>
      ))}
    </div>
  );
};

export default function ReflectionForm() {
  return (
    <Tabs defaultValue="pastYear" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pastYear">Past Year</TabsTrigger>
        <TabsTrigger value="yearAhead">Year Ahead</TabsTrigger>
      </TabsList>
      <TabsContent value="pastYear">
        <Card>
          <CardHeader>
            <CardTitle>Reflect on Your Past Year</CardTitle>
            <CardDescription>
              Take a moment to reflect on your experiences and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionSection questions={yearReflection.pastYear} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="yearAhead">
        <Card>
          <CardHeader>
            <CardTitle>Plan Your Year Ahead</CardTitle>
            <CardDescription>
              Set your intentions and focus for the coming year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionSection questions={yearReflection.yearAhead} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
