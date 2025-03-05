
import { createBrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SavedExercises from "./pages/SavedExercises";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ExerciseEntry from "./pages/ExerciseEntry";

// Create and export the router configuration
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />
  },
  {
    path: "/dashboard",
    element: <Dashboard />
  },
  {
    path: "/saved-exercises",
    element: <SavedExercises />
  },
  {
    path: "/leaderboard",
    element: <Leaderboard />
  },
  {
    path: "/profile",
    element: <Profile />
  },
  {
    path: "/auth",
    element: <Auth />
  },
  {
    path: "/exercise-entry",
    element: <ExerciseEntry />
  }
]);
