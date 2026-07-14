import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import { JobProvider } from "./pages/Jobs/jobs.context.jsx";
import { AuthProvider } from "./pages/Login/context/auth.context.jsx";

const App = () => {
  return (
    <AuthProvider>
      <JobProvider>
        <RouterProvider router={router} />
      </JobProvider>
    </AuthProvider>
  );
};

export default App;
