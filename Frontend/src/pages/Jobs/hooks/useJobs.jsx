import { useContext } from "react";
import { fetchJobs } from "../services/jobs.api";
import { JobContext } from "../jobContext";

export const useJobs = () => {
  const context = useContext(JobContext);

  if (!context) {
    throw new Error("useJobs must be used within a JobProvider");
  }

  const { job, setJob, loading, setLoading } = context;

  const loadJobs = async () => {
    setLoading(true);
    let response = null;

    try {
      response = await fetchJobs();
      setJob(response?.jobs ?? []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }

    return response?.jobs ?? [];
  };

  return { job, loading, getJob: loadJobs };
};
