import { useState } from "react";
import { JobContext } from "./jobContext";

export const JobProvider = ({ children }) => {
  const [job, setJob] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <JobContext.Provider value={{ job, setJob, loading, setLoading }}>
      {children}
    </JobContext.Provider>
  );
};
