
import { ExerciseEntryForm } from "@/components/ExerciseEntryForm";

const Index = () => {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight animate-fade-down">
            Strength Stats Navigator
          </h1>
          <p className="text-gray-500 animate-fade-down">
            Track your fitness journey with precision
          </p>
        </div>
        <ExerciseEntryForm />
      </div>
    </div>
  );
};

export default Index;
