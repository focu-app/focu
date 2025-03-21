"use client";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import ReflectionForm from "../../../components/reflection/reflection-form";

export default function ReflectionClient() {
  const yearPair = "2024-2025";

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-2xl font-bold text-center">Annual Reflection</h2>
        <p className="text-center text-lg">
          Reflecting on 2024, Looking forward to 2025
        </p>
      </div>
      <div className="my-8">
        <ReflectionForm />
      </div>

      <div className="flex justify-end gap-4 border-t pt-6">
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
                  Monthly
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Year:</Label>
            <Select value={yearPair}>
              <SelectTrigger className="w-[120px]">
                <SelectValue>{yearPair}</SelectValue>
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value={yearPair}>{yearPair}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
