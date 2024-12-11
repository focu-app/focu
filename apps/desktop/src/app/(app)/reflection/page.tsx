import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import ReflectionForm from "./_components/reflection-form";

export default function ReflectionPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Annual Reflection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReflectionForm />
        </CardContent>
      </Card>
    </div>
  );
}
