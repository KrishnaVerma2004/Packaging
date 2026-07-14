import { useState } from "react";
import "../../../styles/createJob.css";
import { checkJobIdExists, createJob } from "../services/jobs.api";
import { useNavigate } from "react-router";

const CreateJob = () => {
  const navigate = useNavigate();

  const isJobIdTaken = async (candidateJobId) => {
    try {
      const response = await checkJobIdExists(candidateJobId);
      return response?.exists === true;
    } catch (error) {
      console.error("Failed to check job ID:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedJobId = jobId.trim();

    if (!trimmedJobId) {
      window.alert("Please enter a Job ID.");
      return;
    }

    const alreadyExists = await isJobIdTaken(trimmedJobId);
    if (alreadyExists) {
      window.alert("Job already exists. Please choose a different Job ID.");
      return;
    }

    try {
      const stageStatusMap = Object.fromEntries(
        stages.map((stage) => [stage.id, stage.status]),
      );

      await createJob({
        jobNo: trimmedJobId,
        clientName,
        productName: jobName,
        quantity: Number(quantity),
        deliveryDate: targetDelivery,
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        design: stageStatusMap.design || "Pending",
        plate: stageStatusMap.plate || "Pending",
        printing: stageStatusMap.printing || "Pending",
        lamination: stageStatusMap.lamination || "Pending",
        scodix: stageStatusMap.scodix || "Pending",
        dieCutting: stageStatusMap["die-cutting"] || "Pending",
        boxMaking: stageStatusMap["box-making"] || "Pending",
      });

      navigate("/jobs");
    } catch (error) {
      if (error?.response?.status === 409) {
        window.alert("Job already exists. Please choose a different Job ID.");
        return;
      }
      console.error("Failed to create job:", error);
    }
  };

  const [jobId, setJobId] = useState("");
  const [jobName, setJobName] = useState("");
  const [clientName, setClientName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [targetDelivery, setTargetDelivery] = useState("");
  const [priority, setPriority] = useState("low");

  const [stages, setStages] = useState([
    { id: "design", name: "Design", status: "Running", icon: "✎" },
    { id: "plate", name: "Plate", status: "Pending", icon: "⬦" },
    { id: "printing", name: "Printing", status: "Pending", icon: "🖨" },
    { id: "lamination", name: "Lamination", status: "Pending", icon: "💧" },
    { id: "scodix", name: "Scodix/Spot", status: "Pending", icon: "☀️" },
    { id: "die-cutting", name: "Die Cutting", status: "Pending", icon: "✂️" },
    { id: "box-making", name: "Box Making", status: "Pending", icon: "📦" },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === id ? { ...stage, status: newStatus } : stage,
      ),
    );
  };

  const handleDashboard = () => {
    navigate("/jobs");
  };

  return (
    <div className="packflow-create-job">
      {/* Sidebar Navigation (Minimized for context) */}
      <aside className="sidebar">
        <div className="brand">
          <h1>PackFlow Pro</h1>
          <span>Production Hub</span>
        </div>
        <nav className="nav-links">
          <button className="nav-item" onClick={handleDashboard}>
            Dashboard
          </button>
          <button className="nav-item active">Workflows</button>
          <button className="nav-item">Inventory</button>
        </nav>
      </aside>

      {/* Main Form Content */}
      <form onSubmit={handleSubmit}>
        <main className="main-content">
          <header className="header">
            <h2>Create New Workflow</h2>
            <div className="breadcrumb">Live View / Schedule</div>
          </header>

          <div className="form-grid">
            {/* Job Information Section */}
            <section className="card job-info">
              <div className="card-header">
                <span className="icon">ⓘ</span>
                <h3>Job Information</h3>
              </div>
              <div className="input-group-row">
                <div className="input-field">
                  <label>JOB ID</label>
                  <input
                    type="text"
                    placeholder="Job ID"
                    className="readonly-input"
                    onChange={(e) => {
                      setJobId(e.target.value);
                    }}
                  />
                </div>
                <div className="input-field">
                  <label>JOB NAME</label>
                  <input
                    type="text"
                    name="jobName"
                    placeholder="e.g. Premium Sweet Box"
                    onChange={(e) => {
                      setJobName(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="input-group-row">
                <div className="input-field">
                  <label>CLIENT NAME</label>
                  <input
                    type="text"
                    name="clientName"
                    placeholder="Enter Client Name"
                    onChange={(e) => {
                      setClientName(e.target.value);
                    }}
                  />
                </div>
                <div className="input-field">
                  <label>QUANTITY</label>
                  <input
                    type="text"
                    name="quantity"
                    placeholder="e.g. 5000"
                    onChange={(e) => {
                      setQuantity(e.target.value);
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Schedule Section */}
            <div className="card schedule-info">
              <div className="card-header">
                <span className="icon">📅</span>
                <h3>Schedule</h3>
              </div>
              <div className="input-field">
                <label>TARGET DELIVERY</label>
                <input
                  type="date"
                  name="targetDelivery"
                  onChange={(e) => {
                    setTargetDelivery(e.target.value);
                  }}
                />
              </div>
              <div className="input-field">
                <label>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="readonly-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Production Stages Section */}
          <section className="card stages-info">
            <div className="card-header">
              <span className="icon">🏢</span>
              <h3>Production Stages</h3>
            </div>
            <div className="stages-grid">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className={`stage-card ${stage.status.toLowerCase()}`}
                >
                  <div className="stage-icon">{stage.icon}</div>
                  <h4>{stage.name}</h4>
                  <div className="status-dropdown">
                    <select
                      value={stage.status}
                      onChange={(e) =>
                        handleStatusChange(stage.id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Running">Running</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Form Footer Actions */}
          <footer className="form-footer">
            <button className="btn-launch">
              <span className="btn-icon">🚀</span> Launch Workflow
            </button>
          </footer>
        </main>
      </form>
    </div>
  );
};

export default CreateJob;
