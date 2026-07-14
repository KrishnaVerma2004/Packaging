import React from "react";
import { createBrowserRouter } from "react-router";
import Jobs from "./pages/Jobs/components/Jobs";
import CreateJob from "./pages/Jobs/components/createJob";
import JobDetails from "./pages/Jobs/components/JobDetails";
import Login from "./pages/Login/Login";
import Protected from "./pages/Login/components/Protected";
import AllJobs from "./pages/Jobs/components/AllJobs";
import PlateAndDie from "./pages/Jobs/components/PlateAndDie";

export const router = createBrowserRouter([
  {
    path: "/jobs",
    element: (
      <Protected>
        <Jobs />,
      </Protected>
    ),
  },
  {
    path: "/jobs/create-job",
    element: <CreateJob />,
  },
  {
    path: "/jobs/:jobId",
    element: <JobDetails />,
  },
  {
    path: "/jobs/all-job",
    element: <AllJobs />,
  },
  {
    path: "/jobs/plates-and-dies",
    element: <PlateAndDie/>,
  },
  {
    path: "/",
    element: <Login />,
  },
]);
