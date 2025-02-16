
import { useState } from "react";
import { ExerciseEntryForm } from "@/components/ExerciseEntryForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function ExerciseEntry() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex-1" />
          <h1 className="text-4xl font-bold text-center flex-1">
            Add Exercise
            <span className="block text-lg font-medium text-muted-foreground mt-1">
              Log your workout details
            </span>
          </h1>
          <div className="flex-1 flex justify-end">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>

        <ExerciseEntryForm />
      </div>
    </div>
  );
}
