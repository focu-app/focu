"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@repo/ui/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Label } from "@repo/ui/components/ui/label";
import ReflectionForm from "./_components/reflection-form";

export default function ReflectionPage() {
  const yearPair = "2024-2025";

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Annual Reflection
          </CardTitle>
          <CardDescription className="text-center text-lg">
            Reflecting on 2024, Looking forward to 2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReflectionForm />
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Period:</Label>
              <Select defaultValue="yearly">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="monthly" disabled>
                    Monthly (Soon)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Year:</Label>
              <Select value={yearPair} disabled>
                <SelectTrigger className="w-[120px]">
                  <SelectValue>{yearPair}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={yearPair}>{yearPair}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
