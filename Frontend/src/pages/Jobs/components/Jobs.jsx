import { useEffect, useState } from "react";
import "../../../styles/jobs.css";
import {
  fetchJobs,
  searchJobs,
  updateJob,
  createPlate,
  createDie,
  fetchPlates,
  fetchDies,
  updatePlate,
  updateDie,
} from "../services/jobs.api";
import { Link, useNavigate } from "react-router";

const workflowStages = [
  { id: 1, key: "design", name: "DESIGN" },
  { id: 2, key: "plate", name: "PLATE" },
  { id: 3, key: "printing", name: "PRINTING" },
  { id: 4, key: "lamination", name: "LAMINATION" },
  { id: 5, key: "scodix", name: "SCODIX" },
  { id: 6, key: "dieCutting", name: "DIECUTTING" },
  { id: 7, key: "boxMaking", name: "BOX MAKING" },
];

const stageFieldMap = {
  1: "design",
  2: "plate",
  3: "printing",
  4: "lamination",
  5: "scodix",
  6: "dieCutting",
  7: "boxMaking",
};

const stageLabels = {
  design: "Design",
  plate: "Plate",
  printing: "Printing",
  lamination: "Lamination",
  scodix: "Scodix",
  dieCutting: "Die Cutting",
  boxMaking: "Box Making",
};

const getStageForJob = (job) => {
  const stageOrder = workflowStages.map((stage) => ({
    id: stage.id,
    state: String(
      job[stage.key] ?? (stage.key === "dieCutting" ? job.diecutting : ""),
    ).toLowerCase(),
  }));
  // Do not assign a stage for fully completed jobs so they don't appear
  // in workflow columns. Only return an active running stage.
  const allCompleted = stageOrder.every(
    (entry) => entry.state === "completed" || entry.state === "complete",
  );
  if (allCompleted) return null;

  const activeStage = stageOrder.find((entry) => entry.state === "running");
  return activeStage?.id ?? null;
};

const canCompleteJob = (job) => getStageForJob(job) === workflowStages.length;

const getProgressForJob = (job) => {
  const steps = [
    job.design,
    job.plate,
    job.printing,
    job.lamination,
    job.scodix,
    job.dieCutting ?? job.diecutting,
    job.boxMaking,
  ].map((s) => String(s || "").toLowerCase());
  const completedSteps = steps.filter(
    (step) => step === "completed" || step === "complete",
  ).length;
  return Math.round((completedSteps / steps.length) * 100);
};

const formatDeliveryDisplay = (dateValue) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  return {
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: date.getDate().toString().padStart(2, "0"),
    fullDate: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
};

const Jobs = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedJobId, setDraggedJobId] = useState(null);
  const [draggedFromStage, setDraggedFromStage] = useState(null);
  const [dropTargetStage, setDropTargetStage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [actionStatus, setActionStatus] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetchJobs();
        setJobs(response?.jobs ?? []);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      try {
        const response = await searchJobs(searchQuery);
        setSearchResults(response?.jobs ?? []);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Failed to search jobs:", error);
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleDragStart = (job) => {
    setDraggedJobId(job._id);
    setDraggedFromStage(getStageForJob(job));
  };

  const handleCompleteJob = async (jobId) => {
    const currentJob = jobs.find((job) => job._id === jobId);
    if (!currentJob || !canCompleteJob(currentJob)) return;

    const completedPayload = {
      ...currentJob,
      design: "Completed",
      plate: "Completed",
      printing: "Completed",
      lamination: "Completed",
      scodix: "Completed",
      dieCutting: "Completed",
      boxMaking: "Completed",
    };

    delete completedPayload._id;
    delete completedPayload.__v;
    delete completedPayload.createdAt;
    delete completedPayload.updatedAt;

    try {
      await updateJob(jobId, completedPayload);
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId ? { ...job, ...completedPayload } : job,
        ),
      );
    } catch (error) {
      console.error("Failed to mark job as completed:", error);
    }
  };

  const handleDrop = async (targetStageId) => {
    if (
      !draggedJobId ||
      draggedFromStage === null ||
      targetStageId !== draggedFromStage + 1
    ) {
      setDraggedJobId(null);
      setDraggedFromStage(null);
      setDropTargetStage(null);
      return;
    }

    const currentJob = jobs.find((job) => job._id === draggedJobId);
    if (!currentJob) {
      setDraggedJobId(null);
      setDraggedFromStage(null);
      setDropTargetStage(null);
      return;
    }

    const previousStageField = stageFieldMap[draggedFromStage];
    const nextStageField = stageFieldMap[targetStageId];

    const updatedPayload = {
      ...currentJob,
      [previousStageField]: "Completed",
      [nextStageField]: "Running",
    };

    delete updatedPayload._id;
    delete updatedPayload.__v;
    delete updatedPayload.createdAt;
    delete updatedPayload.updatedAt;

    try {
      await updateJob(currentJob._id, updatedPayload);
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === currentJob._id ? { ...job, ...updatedPayload } : job,
        ),
      );
      // If moving from plate -> printing, mark related plates as completed
      if (previousStageField === "plate" && nextStageField === "printing") {
        try {
          const platesRes = await fetchPlates();
          const plates = platesRes?.plates || platesRes?.data || [];
          const toComplete = plates.filter(
            (p) =>
              String(p.job).toLowerCase() ===
                String(currentJob._id).toLowerCase() &&
              String(p.status || "").toLowerCase() === "in use",
          );
          await Promise.all(
            toComplete.map((p) => updatePlate(p._id, { status: "Completed" })),
          );
        } catch (err) {
          console.error("Failed to update plates for job:", err);
        }
      }

      // If moving from dieCutting -> boxMaking, mark related dies as completed
      if (
        previousStageField === "dieCutting" &&
        nextStageField === "boxMaking"
      ) {
        try {
          const diesRes = await fetchDies();
          const dies = diesRes?.dies || diesRes?.data || [];
          const toCompleteDies = dies.filter(
            (d) =>
              String(d.job).toLowerCase() ===
                String(currentJob._id).toLowerCase() &&
              String(d.status || "").toLowerCase() === "in use",
          );
          await Promise.all(
            toCompleteDies.map((d) =>
              updateDie(d._id, { status: "Completed" }),
            ),
          );
        } catch (err) {
          console.error("Failed to update dies for job:", err);
        }
      }
    } catch (error) {
      console.error("Failed to update job stage:", error);
    } finally {
      setDraggedJobId(null);
      setDraggedFromStage(null);
      setDropTargetStage(null);
    }
  };

  const createPlateForJob = async (job) => {
    const plateNumber = job.jobNo ? `${job.jobNo}-PLATE` : `${job._id}-PLATE`;
    setActionLoading((prev) => ({ ...prev, [job._id]: true }));
    setActionStatus((prev) => ({ ...prev, [job._id]: "" }));

    try {
      await createPlate({ plateNumber, jobId: job._id, status: "In Use" });
      setActionStatus((prev) => ({ ...prev, [job._id]: "Plate created" }));
    } catch (error) {
      setActionStatus((prev) => ({
        ...prev,
        [job._id]: error?.response?.data?.message || "Plate creation failed",
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [job._id]: false }));
    }
  };

  const createDieForJob = async (job) => {
    const dieNumber = job.jobNo ? `${job.jobNo}-DIE` : `${job._id}-DIE`;
    setActionLoading((prev) => ({ ...prev, [job._id]: true }));
    setActionStatus((prev) => ({ ...prev, [job._id]: "" }));

    try {
      await createDie({ dieNumber, jobId: job._id, status: "In Use" });
      setActionStatus((prev) => ({ ...prev, [job._id]: "Die created" }));
    } catch (error) {
      setActionStatus((prev) => ({
        ...prev,
        [job._id]: error?.response?.data?.message || "Die creation failed",
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [job._id]: false }));
    }
  };

  const mappedJobs = jobs
    .map((job) => {
      const stageId = getStageForJob(job);
      const stageKey = workflowStages.find(
        (stage) => stage.id === stageId,
      )?.key;

      return {
        _id: job._id,
        id: job.jobNo || job._id,
        title: job.productName || "Unnamed Job",
        client: job.clientName || "Unknown Client",
        assigned: job.priority || "Pending",
        stage: stageId,
        stageKey,
        stageName: stageLabels[stageKey] || null,
        status: job.deliveryDate
          ? `Delivery ${new Date(job.deliveryDate).toLocaleDateString()}`
          : null,
        progress: getProgressForJob(job),
        tag: job.priority === "Urgent" ? "URGENT" : null,
        tagColor: job.priority === "Urgent" ? "#ef4444" : undefined,
        raw: job,
      };
    })
    .filter((job) => job.stage !== null);

  const stats = [
    { label: "Total Jobs", value: String(jobs.length), icon: "📋" },
    {
      label: "Running Jobs",
      value: String(
        jobs.filter((job) =>
          [
            job.design,
            job.plate,
            job.printing,
            job.lamination,
            job.scodix,
            job.dieCutting ?? job.diecutting,
            job.boxMaking,
          ].some((s) => String(s || "").toLowerCase() === "running"),
        ).length,
      ),
      icon: "⚙️",
    },
    {
      label: "Pending Jobs",
      value: String(
        jobs.filter(
          (job) => String(job.design || "").toLowerCase() === "pending",
        ).length,
      ),
      icon: "📏",
    },
    {
      label: "Urgent Jobs",
      value: String(jobs.filter((job) => job.priority === "Urgent").length),
      icon: "🖼️",
    },
  ];

  return (
    <div className="packflow-dashboard">
      <aside className="sidebar">
        <div className="brand">
          <h1>P SQUARE</h1>
          
        </div>

        <nav className="nav-links">
          {[
            { label: "Dashboard", path: "/jobs" },
            { label: "All Jobs", path: "/jobs/all-job" },
            { label: "Plates and Dies", path: "/jobs/plates-and-dies" },
          ].map((tab) => (
            <button
              key={tab.label}
              className={`nav-item ${activeTab === tab.label ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.label);
                navigate(tab.path);
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="create-job">
            <button className="btn-primary">+ New Workflow</button>
          </Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="page-title">
            <span className="icon">⚙️</span>
            <h2>Manufacturing Ops</h2>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search jobs, plates, or batches..."
              value={searchQuery}
              onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results-dropdown">
                {searchResults.map((job) => (
                  <button
                    key={job._id}
                    type="button"
                    className="search-result-item"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setSearchQuery(job.jobNo || job.productName || "");
                      setShowSearchResults(false);
                      navigate(`/jobs/${job._id}`);
                    }}
                  >
                    <span className="search-result-title">
                      {job.jobNo || job._id}
                    </span>
                    <span className="search-result-subtitle">
                      {job.productName || "Unnamed Job"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <section className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-info">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
              <div className="stat-icon">{stat.icon}</div>
            </div>
          ))}
        </section>

        <section className="workflow-section">
          <h3>Production Workflow Tracker</h3>
          <div className="workflow-grid">
            {workflowStages.map((stage) => {
              const stageJobs = mappedJobs.filter(
                (job) => job.stage === stage.id,
              );

              return (
                <div
                  key={stage.id}
                  className={`workflow-column ${dropTargetStage === stage.id ? "drop-target" : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDropTargetStage(stage.id);
                  }}
                  onDragLeave={() =>
                    setDropTargetStage((current) =>
                      current === stage.id ? null : current,
                    )
                  }
                  onDrop={() => handleDrop(stage.id)}
                >
                  <div className="column-header">
                    <span>
                      {stage.id}. {stage.name}
                    </span>
                    <span className="count">
                      {String(stageJobs.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="job-cards">
                    {loading ? (
                      <div className="empty-column">Loading jobs...</div>
                    ) : stageJobs.length === 0 ? (
                      <div className="empty-column">No active jobs</div>
                    ) : (
                      stageJobs.map((job) => (
                        <div
                          key={job.id}
                          className={`job-card ${draggedJobId === job._id ? "dragging" : ""}`}
                          draggable
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          onDragStart={() =>
                            handleDragStart(
                              jobs.find((entry) => entry._id === job._id),
                            )
                          }
                          onDragEnd={() => {
                            setDraggedJobId(null);
                            setDraggedFromStage(null);
                            setDropTargetStage(null);
                          }}
                        >
                          <div className="job-header">
                            <span className="job-id">{job.id}</span>
                            {job.tag && (
                              <span
                                className="job-tag"
                                style={{ backgroundColor: job.tagColor }}
                              >
                                {job.tag}
                              </span>
                            )}
                          </div>
                          {canCompleteJob(
                            jobs.find((entry) => entry._id === job._id),
                          ) && (
                            <div className="job-actions">
                              <button
                                type="button"
                                className="complete-btn"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleCompleteJob(job._id);
                                }}
                              >
                                Complete
                              </button>
                            </div>
                          )}
                          {job.stageKey === "plate" && (
                            <div className="job-actions">
                              <button
                                type="button"
                                className="action-btn"
                                disabled={actionLoading[job._id]}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  createPlateForJob(job.raw);
                                }}
                              >
                                {actionLoading[job._id]
                                  ? "Creating Plate..."
                                  : "Create Plate"}
                              </button>
                              {actionStatus[job._id] && (
                                <span className="action-status">
                                  {actionStatus[job._id]}
                                </span>
                              )}
                            </div>
                          )}
                          {job.stageKey === "dieCutting" && (
                            <div className="job-actions">
                              <button
                                type="button"
                                className="action-btn"
                                disabled={actionLoading[job._id]}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  createDieForJob(job.raw);
                                }}
                              >
                                {actionLoading[job._id]
                                  ? "Creating Die..."
                                  : "Create Die"}
                              </button>
                              {actionStatus[job._id] && (
                                <span className="action-status">
                                  {actionStatus[job._id]}
                                </span>
                              )}
                            </div>
                          )}
                          <h4>{job.title}</h4>
                          <p className="client">Client: {job.client}</p>
                          {job.assigned && (
                            <p className="meta">Assigned: {job.assigned}</p>
                          )}
                          {job.status && (
                            <p className="meta status-highlight">
                              ✓ {job.status}
                            </p>
                          )}
                          {job.progress !== undefined && (
                            <div className="progress-container">
                              <div
                                className="progress-bar"
                                style={{ width: `${job.progress}%` }}
                              ></div>
                              <span className="progress-text">
                                {job.progress}%
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="bottom-layout">
          {/* <section className="inventory-section">
            <div className="section-header">
              <h3>Die & Plate Inventory</h3>
              <div className="header-btns">
                <button className="btn-outline">Export CSV</button>
                <button className="btn-secondary">Register Asset</button>
              </div>
            </div>
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Last Used</th>
                  <th>Condition</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="id-cell">{item.id}</td>
                    <td>{item.desc}</td>
                    <td>{item.type}</td>
                    <td>{item.date}</td>
                    <td>
                      <span className="badge-success">{item.condition}</span>
                    </td>
                    <td>
                      <button className="action-link">⟳</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section> */}

          <div className="right-side-panels">
            <aside className="delivery-aside">
              <h3>Delivery Schedule</h3>
              <div className="delivery-list">
                {jobs.length === 0 ? (
                  <div className="empty-column">
                    No delivery dates available
                  </div>
                ) : (
                  [...jobs]
                    .filter(
                      (job) => job.deliveryDate && getProgressForJob(job) < 100,
                    )
                    .sort(
                      (a, b) =>
                        new Date(a.deliveryDate).getTime() -
                        new Date(b.deliveryDate).getTime(),
                    )
                    .slice(0, 4)
                    .map((job) => {
                      const delivery = formatDeliveryDisplay(job.deliveryDate);
                      const isOverdue =
                        delivery &&
                        new Date(job.deliveryDate).getTime() <
                          new Date().setHours(0, 0, 0, 0);

                      return (
                        <div
                          key={job._id}
                          className={`delivery-item ${isOverdue ? "overdue" : ""}`}
                        >
                          <div className="date-block">
                            <span className="month">{delivery?.month}</span>
                            <span className="day">{delivery?.day}</span>
                          </div>
                          <div className="delivery-info">
                            <span className="delivery-id">
                              {job.jobNo || "JOB-N/A"}
                            </span>
                            <span className="delivery-desc">
                              {job.productName || "Unnamed Job"}
                            </span>
                          </div>
                          <span className={isOverdue ? "eta-alert" : "eta"}>
                            {isOverdue ? "!" : delivery?.fullDate || "Due"}
                          </span>
                        </div>
                      );
                    })
                )}
              </div>
            </aside>

            {/* <aside className="delivery-aside completed-jobs-panel">
              <h3>Completed Jobs</h3>
              <div className="delivery-list">
                {completedJobs.length === 0 ? (
                  <div className="empty-column">No completed jobs yet</div>
                ) : (
                  completedJobs.map((job) => (
                    <div
                      key={job._id}
                      className="delivery-item completed-job-item"
                    >
                      <div className="date-block completed-date-block">
                        <span className="month">DONE</span>
                        <span className="day">✓</span>
                      </div>
                      <div className="delivery-info">
                        <span className="delivery-id">
                          {job.jobNo || "JOB-N/A"}
                        </span>
                        <span className="delivery-desc">
                          {job.productName || "Unnamed Job"}
                        </span>
                      </div>
                      <span className="eta completed-label">Completed</span>
                    </div>
                  ))
                )}
              </div>
            </aside> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
