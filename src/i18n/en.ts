const en = {
  translation: {
    // Common
    common: {
      loading: "Loading...",
      refreshed: "Refreshed!",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      update: "Update",
      retry: "Retry",
      close: "Close",
      new: "New",
      back: "Back",
      search: "Search...",
      noResults: "No results found",
      page: "Page",
      of: "of",
      days: "days",
    },

    // Auth
    auth: {
      welcomeBack: "Welcome Back",
      createAccount: "Create Account",
      signInToContinue: "Sign in to continue",
      signUpToStart: "Sign up to start tracking",
      email: "Email",
      emailPlaceholder: "your@email.com",
      password: "Password",
      rememberMe: "Remember me",
      signIn: "Sign In",
      signUp: "Create Account",
      alreadyHaveAccount: "Already have an account? Sign in",
      dontHaveAccount: "Don't have an account? Sign up",
      checkEmail: "Check your email to confirm your account!",
      loggedIn: "Successfully logged in!",
      loggedOut: "Logged out successfully",
      logoutFailed: "Failed to log out",
      errors: {
        invalidCredentials: "Wrong email or password. Try again.",
        emailNotConfirmed: "Please confirm your email first.",
        userAlreadyRegistered: "This email is already in use.",
        passwordTooShort: "Password must be at least 6 characters.",
        invalidPassword: "Please enter a valid password.",
        generic: "Something went wrong. Try again.",
      },
    },

    // Navigation
    nav: {
      home: "Home",
      stats: "Stats",
      saved: "Saved",
      ranks: "Ranks",
      profile: "Profile",
    },

    // Categories (display labels - DB values stay Greek)
    categories: {
      "ΣΤΗΘΟΣ": "Chest",
      "ΠΛΑΤΗ": "Back",
      "ΔΙΚΕΦΑΛΑ": "Biceps",
      "ΤΡΙΚΕΦΑΛΑ": "Triceps",
      "ΩΜΟΙ": "Shoulders",
      "ΠΟΔΙΑ": "Legs",
      "ΚΟΡΜΟΣ": "Core",
      "CARDIO": "Cardio",
      "POWER SETS": "Power Sets",
    },

    // Exercise Entry (Home page)
    exercise: {
      date: "Date",
      pickDate: "Pick a date",
      todaysWorkoutPlan: "Today's Workout Plan",
      selectCategory: "Select Category",
      selectExercise: "Select Exercise",
      sets: "Sets",
      set: "Set",
      weight: "Weight",
      reps: "Reps",
      addSet: "Add Set",
      removeSet: "Remove Set",
      saveExercise: "Save Exercise",
      saving: "Saving...",
      exercise: "exercise",
      exercises: "exercises",
      searchExercises: "Search exercises...",
      addCustom: "Add Custom Exercise",
      customExerciseName: "Exercise name",
      exerciseSaved: "Exercise saved successfully!",
      exerciseSaveFailed: "Failed to save exercise",
      templateLoaded: "Template: {{name}}",
      templateExercise: "Exercise {{current}}/{{total}}: {{name}}",
      allTemplateExercisesDone: "All template exercises have been recorded!",
      exerciseLoaded: "{{name}} loaded!",
    },

    // Dashboard
    dashboard: {
      title: "Dashboard",
      overview: "Overview",
      progress: "Progress",
      statistics: "Statistics",
      // Workout Cycle
      workoutCycle: "Workout Cycle",
      started: "Started: {{date}}",
      daysLeft: "{{count}} days left",
      setFirstDay: "Set First Day",
      set: "Set",
      cycleStarted: "Workout cycle started!",
      cycleComplete: "Congratulations! You've completed your 12-day workout cycle! 🎉",
      cannotSelectFuture: "Cannot select a future date",
      cannotStartNewCycle: "Cannot start new cycle before completion",
      cycleFailed: "Failed to start workout cycle",
      // Activity / Heatmap
      activity: "Activity",
      thisWeek: "This Week",
      streak: "streak",
      daysRemaining: "{{count}} days remaining",
      oneDayRemaining: "1 day remaining!",
      pastWeeks: "Past Weeks",
      rest: "Rest",
      light: "Light",
      medium: "Medium",
      hard: "Hard",
      beast: "Beast",
      // Insights
      totalWorkouts: "Total Workouts",
      mostTrained: "Most Trained",
      totalVolume: "Total Volume",
      weeklyVolume: "This Week",
      mostUsed: "Most Used",
      maxWeight: "Max Weight",
      avgSetsPerDay: "Avg Sets/Day",
      bestStreak: "Best Streak",
      // Statistics
      categoryDistribution: "Category Distribution",
      maxWeightPerExercise: "Max Weight per Exercise",
      timeRange: "Time Range",
    },

    // Saved Exercises
    saved: {
      title: "Saved Exercises",
      searchExercises: "Search exercises...",
      filterByCategory: "Filter by Category",
      filterByTimeRange: "Filter by Time Range",
      all: "All",
      allTime: "All Time",
      last7Days: "Last 7 Days",
      last15Days: "Last 15 Days",
      last30Days: "Last 30 Days",
      last45Days: "Last 45 Days",
      last90Days: "Last 90 Days",
      deleteExercise: "Delete exercise",
      deleteConfirmTitle: "Delete exercise",
      deleteConfirmDescription: "Are you sure? This action cannot be undone.",
      exerciseDeleted: "Exercise deleted successfully",
      deleteFailed: "Failed to delete exercise",
      cycle: "Cycle",
    },

    // Profile
    profile: {
      title: "Profile",
      accountInfo: "Account Information",
      username: "Username",
      usernameNotSet: "Not set",
      enterNewUsername: "Enter new username",
      usernameUpdated: "Username updated successfully!",
      usernameUpdateError: "Error updating username",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      passwordUpdated: "Password updated successfully!",
      passwordUpdateError: "Error updating password",
      passwordsDontMatch: "New passwords don't match",
      passwordTooShort: "New password must be at least 6 characters",
      currentPasswordWrong: "Current password is incorrect",
      mustBeLoggedIn: "You must be logged in",
      quickLinks: "Quick Links",
      savedExercises: "Saved Exercises",
      workoutPlanGenerator: "Workout Plan Generator",
      settings: "Settings",
      soundEffects: "Sound Effects",
      soundDescription: "Play sounds for actions and feedback",
      fitnessLevel: "Fitness Level",
      recalculate: "Recalculate",
      fitnessRecalculated: "Fitness score recalculated!",
      fitnessRecalculateError: "Error recalculating fitness score",
      score: "Score: {{score}}",
      lastUpdated: "Last updated: {{date}}",
      neverUpdated: "Never updated",
      levelRequirements: "Level Requirements",
      failedToLoad: "Failed to load profile. Please try again.",
      language: "Language",
      languageDescription: "Choose your preferred language",
    },

    // Leaderboard
    leaderboard: {
      title: "Leaderboard",
      rankings: "Rankings",
      compare: "Compare",
      you: "(You)",
    },

    // Workout Plan
    workoutPlan: {
      title: "Workout Plan",
      generating: "Generating your workout plans...",
      findingExercises: "Finding unique exercises for you",
      findAnother: "Find Another",
      useThisPlan: "Use This Plan",
      saveAsTemplate: "Save as Template",
      emptyMessage: "Unable to generate a workout plan. Please log more exercises to get personalized recommendations.",
      backToEntry: "Back to Exercise Entry",
    },

    // Templates
    templates: {
      title: "Workout Templates",
      myTemplates: "My Templates",
      templateLoaded: 'Template "{{name}}" loaded',
      noTemplates: "No templates yet",
      createFirst: "Create your first template to get started",
      exercises: "{{count}} exercises",
      load: "Load",
      edit: "Edit",
      editTemplate: "Edit Template",
      createTemplate: "Create Template",
      templateName: "Template name",
      description: "Description (optional)",
    },

    // Quick Add
    quickAdd: {
      title: "Quick Add",
      recent: "Recent",
      noExercises: "No exercises found",
      lastUsed: "Last used",
      tapToAdd: "Tap to add",
      tapToLoadSets: "Tap to load all sets",
      sets: "{{count}} sets",
    },

    // Rest Timer
    timer: {
      restTimer: "Rest Timer",
      reset: "Reset",
    },

    // User Records
    records: {
      loadingRecords: "Loading records...",
      noRecords: "No user records found",
      ofTotal: "{{current}} of {{total}}",
    },

    // Progress Tracking
    progressTracking: {
      title: "Progress Tracking",
      selectExercises: "Select exercises to track progress",
      allCategories: "All",
      noData: "Select exercises above to see their weight progression over time",
      avgWeightPerRep: "Avg Weight/Rep (kg)",
    },

    // Fitness Levels (keep English as they're universal terms)
    levels: {
      Beginner: "Beginner",
      Novice: "Novice",
      Intermediate: "Intermediate",
      Advanced: "Advanced",
      Elite: "Elite",
      Legend: "Legend",
    },
  },
};

export default en;
