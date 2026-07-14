import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { fetchJobById } from "../services/jobs.api";
import "../../../styles/jobs.css";

const stageLabels = {
  design: "Design",
  plate: "Plate",
  printing: "Printing",
  lamination: "Lamination",
  scodix: "Scodix",
  dieCutting: "Die Cutting",
  boxMaking: "Box Making",
};

const formatDate = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const JobDetails = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const response = await fetchJobById(jobId);
        setJob(response?.job ?? null);
        setError(response?.job ? "" : "Job not found");
      } catch (err) {
        console.error("Failed to load job details:", err);
        setError("Unable to load job details.");
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="job-details-page">
        <div className="job-details-card">
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-details-page">
        <div className="job-details-card">
          <h2>Job not found</h2>
          <p>{error || "The requested job could not be loaded."}</p>
          <Link to="/jobs" className="back-link">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <div className="job-details-card">
        <div className="job-details-header">
          <div>
            <p className="job-details-label">Job Number</p>
            <h1>{job.jobNo || job._id}</h1>
          </div>
          <Link to="/jobs" className="back-link">
            ← Back to jobs
          </Link>
        </div>

        <div className="job-details-grid">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <p>
              <strong>Product:</strong> {job.productName || "Unnamed job"}
            </p>
            <p>
              <strong>Client:</strong> {job.clientName || "Unknown client"}
            </p>
            <p>
              <strong>Quantity:</strong> {job.quantity || 0}
            </p>
            <p>
              <strong>Priority:</strong> {job.priority || "Medium"}
            </p>
            <p>
              <strong>Starting Date:</strong> {formatDate(job.createdAt)}
            </p>
            <p>
              <strong>Delivery Date:</strong> {formatDate(job.deliveryDate)}
            </p>
          </div>

          <div className="detail-section">
            <h3>Workflow Status</h3>
            {Object.entries(stageLabels).map(([key, label]) => (
              <p key={key}>
                <strong>{label}:</strong> {job[key] || "Pending"}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
