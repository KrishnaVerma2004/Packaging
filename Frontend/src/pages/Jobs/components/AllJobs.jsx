import { useEffect, useState } from "react";
import { Link } from "react-router";
import "../../../styles/alljobs.css";
import { fetchJobs, searchJobs, deleteJob } from "../services/jobs.api";

const stageLabels = {
  design: "Design",
  plate: "Plate",
  printing: "Printing",
  lamination: "Lamination",
  scodix: "Scodix",
  dieCutting: "Die Cutting",
  boxMaking: "Box Making",
};

const steps = [
  "design",
  "plate",
  "printing",
  "lamination",
  "scodix",
  "dieCutting",
  "boxMaking",
];

const getCurrentStage = (job) => {
  const runningStage = steps.find(
    (key) => job[key] === "Running" || job[key] === "RUNNING",
  );
  if (runningStage) return stageLabels[runningStage];

  const completedCount = steps.filter(
    (key) => job[key] === "Completed" || job[key] === "COMPLETE",
  ).length;
  if (completedCount === steps.length) return "Completed";

  const nextPending = steps.find(
    (key) => !job[key] || job[key] === "Pending" || job[key] === "PENDING",
  );
  return nextPending ? stageLabels[nextPending] : "Unknown";
};

const getStageBadge = (job) => {
  const allCompleted = steps.every(
    (key) => job[key] === "Completed" || job[key] === "COMPLETE",
  );
  if (allCompleted) return "COMPLETED";

  const hasRunning = steps.some(
    (key) => job[key] === "Running" || job[key] === "RUNNING",
  );
  if (hasRunning) return "RUNNING";
  return "PENDING";
};

const getStatusClass = (status) => {
  switch (status) {
    case "Running":
    case "RUNNING":
      return "status-running";
    case "Completed":
    case "COMPLETE":
      return "status-complete";
    case "Pending":
    case "PENDING":
      return "status-pending";
    case "In Review":
    case "IN REVIEW":
      return "status-review";
    case "Halted":
    case "HALTED":
      return "status-halted";
    default:
      return "";
  }
};

const formatDelivery = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const AllJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [displayJobs, setDisplayJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetchJobs();
        const loadedJobs = response?.jobs ?? [];
        setJobs(loadedJobs);
        setDisplayJobs(loadedJobs);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setJobs([]);
        setDisplayJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    const searchDelayed = setTimeout(async () => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        setDisplayJobs(jobs);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const response = await searchJobs(trimmed);
        setDisplayJobs(response?.jobs ?? []);
      } catch (error) {
        console.error("Search failed:", error);
        setDisplayJobs([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(searchDelayed);
  }, [searchQuery, jobs]);

  const stats = [
    { label: "TOTAL JOBS", value: String(jobs.length), icon: "📋" },
    {
      label: "RUNNING JOBS",
      value: String(
        jobs.filter((job) =>
          steps.some((key) => job[key] === "Running" || job[key] === "RUNNING"),
        ).length,
      ),
      icon: "⚙️",
    },
    {
      label: "COMPLETED JOBS",
      value: String(
        jobs.filter((job) =>
          steps.every(
            (key) => job[key] === "Completed" || job[key] === "COMPLETE",
          ),
        ).length,
      ),
      icon: "✅",
    },
  ];

  return (
    <div className="all-jobs-container">
      <aside className="sidebar">
        <div className="brand">
          <h1>P SQUARE</h1>
        </div>

        <nav className="nav-menu">
          <Link to="/jobs" className="nav-item">
            <span className="nav-icon">📊</span> Dashboard
          </Link>
          <Link to="/jobs/all-job" className="nav-item active">
            <span className="nav-icon">📋</span> Jobs
          </Link>
          <Link to="/jobs/plates-and-dies" className="nav-item">
            <span className="nav-icon">📏</span> Plates & Dies
          </Link>
        </nav>

        <div className="sidebar-footer"></div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search jobs, clients, or IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <section className="page-header">
          <div className="title-group">
            <h2>Jobs Management</h2>
            <p>Track and manage production pipelines in real-time.</p>
          </div>
          <Link to="/jobs/create-job" className="btn-new-job">
            + New Job
          </Link>
        </section>

        <section className="stats-grid">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`stat-card ${stat.active ? "active" : ""}`}
            >
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">{stat.value}</span>
                </div>
                <span className="stat-icon-bg">{stat.icon}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="table-section">
          <div className="table-controls">
            <div className="filter-group">
              <button className="filter-btn active">All Stages</button>
              <button className="filter-btn">This Week</button>
            </div>
            <div className="view-controls">
              <span className="results-count">
                {loading
                  ? "Loading jobs..."
                  : `Showing ${displayJobs.length} of ${jobs.length} Jobs`}
              </span>
              <div className="toggle-group">
                <button className="toggle-btn">Grid</button>
                <button className="toggle-btn active">List</button>
              </div>
            </div>
          </div>

          <table className="jobs-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Client</th>
                <th>Job Name</th>
                <th>Current Stage</th>
                <th>Quantity</th>
                <th>Delivery Date</th>
                <th>Actions</th>
                <th></th>

              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    Loading jobs from the database...
                  </td>
                </tr>
              ) : displayJobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    {searching ? "Searching jobs..." : "No jobs found."}
                  </td>
                </tr>
              ) : (
                displayJobs.map((job) => (
                  <tr key={job._id || job.jobNo}>
                    <td className="job-id-cell">{job.jobNo || job._id}</td>
                    <td>{job.clientName || "N/A"}</td>
                    <td>{job.productName || "Unnamed Job"}</td>
                    <td>
                      <div className="stage-cell">
                        <span>{getCurrentStage(job)}</span>
                        <span
                          className={`status-badge ${getStatusClass(getStageBadge(job))}`}
                        >
                          {getStageBadge(job)}
                        </span>
                      </div>
                    </td>
                    <td>{job.quantity ?? "-"}</td>
                    <td>{formatDelivery(job.deliveryDate)}</td>
                    <td>
                      <div className="actions-inline">
                        <Link to={`/jobs/${job._id}`} className="more-btn">
                          View
                        </Link>
                      </div>
                    </td>
                    <td>
                        <button

                          className="more-btn danger-btn"
                          onClick={async () => {
                            const ok = window.confirm(
                              "Delete this job? This action cannot be undone.",
                            );
                            if (!ok) return;
                            try {
                              await deleteJob(job._id);
                              setJobs((prev) =>
                                prev.filter((j) => j._id !== job._id),
                              );
                              setDisplayJobs((prev) =>
                                prev.filter((j) => j._id !== job._id),
                              );
                            } catch (err) {
                              window.alert(
                                err?.response?.data?.message ||
                                  "Failed to delete job",
                              );
                            }
                          }}
                        >
                          Delete
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <footer className="table-footer">
            <button className="pagination-btn" disabled>
              Previous
            </button>
            <div className="page-numbers">
              <button className="page-num active">1</button>
            </div>
            <button className="pagination-btn" disabled>
              Next
            </button>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default AllJobs;
