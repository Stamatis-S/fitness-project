
import { AuthProvider } from "./components/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Toaster } from "sonner";

// Add the UpdatePrompt import
import { UpdatePrompt } from "@/components/UpdatePrompt";

function App() {
  const queryClient = new QueryClient();

  return (
    <ThemeProvider defaultTheme="brand">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster />
          <UpdatePrompt />
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
