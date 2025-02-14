
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseEntryForm } from "@/components/ExerciseEntryForm";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight animate-fade-down">
            Gym Buddy
          </h1>
          <p className="text-gray-500 animate-fade-down">
            Track your fitness journey with precision
          </p>
        </div>

        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add">Add Exercise</TabsTrigger>
            <TabsTrigger value="view" onClick={() => navigate("/saved-exercises")}>
              View Saved Exercises
            </TabsTrigger>
            <TabsTrigger value="dashboard" onClick={() => navigate("/dashboard")}>
              My Dashboard
            </TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <ExerciseEntryForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Index;
