import { useEffect, useState } from "react";
import "../../../styles/plateanddie.css";
import {
  fetchPlates,
  fetchDies,
  deletePlate,
  deleteDie,
} from "../services/jobs.api";
import { useNavigate } from "react-router";

const PlateAndDie = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [plates, setPlates] = useState([]);
  const [dies, setDies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const [plateResponse, dieResponse] = await Promise.all([
          fetchPlates(),
          fetchDies(),
        ]);
        setPlates(plateResponse?.plates ?? []);
        setDies(dieResponse?.dies ?? []);
      } catch (error) {
        console.error("Failed to fetch assets:", error);
        setPlates([]);
        setDies([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  const totalAssets = plates.length + dies.length;
  const activeDies = dies.filter((item) => item.status === "In Use").length;
  const activePlates = plates.filter((item) => item.status === "In Use").length;

  const stats = [
    {
      label: "TOTAL ASSETS",
      value: String(totalAssets),
      icon: "📋",
    },
    {
      label: "ACTIVE DIES",
      value: String(activeDies),
      icon: "⚙️",
    },
    {
      label: "ACTIVE PLATES",
      value: String(activePlates),
      icon: "🖼️",
    },
  ];

  const allAssets = [
    ...plates.map((plate) => ({
      id: plate.plateNumber,
      description: `Plate for job ${plate.job?.productName || plate.job?.jobNo || plate.job || "Unknown"}`,
      createdAt: plate.createdAt,
      type: "Plate",
    })),
    ...dies.map((die) => ({
      id: die.dieNumber,
      description: `Die for job ${die.job?.productName || die.job?.jobNo || die.job || "Unknown"}`,
      createdAt: die.createdAt,
      type: "Die",
    })),
  ];

  const filteredAssets = allAssets.filter((item) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      item.id.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );
  });

  const formatCreatedAt = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleDashboard = () => {
    navigate("/jobs");
  };
  const handleJobs = () => {
    navigate("/jobs/all-job");
  };
  const handlePlateAndDie = () => {
    navigate("/jobs/plates-and-dies");
  };

  return (
    <div className="plate-die-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <h1>P SQUARE</h1>
          
        </div>

        <nav className="nav-menu">
          <button className="nav-item" onClick={handleDashboard}>
            <span className="nav-icon">📊</span> Dashboard
          </button>
          <button className="nav-item" onClick={handleJobs}>
            <span className="nav-icon">📋</span> Jobs
          </button>
          <button className="nav-item active" onClick={handlePlateAndDie}>
            <span className="nav-icon">📏</span> Plates & Dies
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Global search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <section className="page-header">
          <div className="title-group">
            <h2>Plates & Dies Inventory</h2>
            <p>
              Manage and monitor high-precision manufacturing tooling assets.
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-main">
                <div className="stat-info">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">{stat.value}</span>
                </div>
                <span className="stat-icon-bg">{stat.icon}</span>
              </div>
              <div className="stat-footer">
                <span className="trend-text">{stat.trend}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Inventory Registry Table */}
        <section className="table-section">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Description</th>
                <th>Type</th>
                <th>Created At</th>
                <th >Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="empty-row">
                    Loading assets from the database...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-row">
                    No assets found.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((item) => (
                  <tr key={item.id}>
                    <td className="id-cell">{item.id}</td>
                    <td>{item.description}</td>
                    <td>{item.type}</td>
                    <td>{formatCreatedAt(item.createdAt)}</td>
                    <td>
                      <div className="actions-inline">
                    
                        <button
                          className="more-btn danger-btn"
                          onClick={async () => {
                            const ok = window.confirm(
                              `Delete ${item.type} ${item.id}? This cannot be undone.`,
                            );
                            if (!ok) return;
                            try {
                              if (item.type === "Plate") {
                                // find plate by plateNumber
                                const plate = plates.find(
                                  (p) => p.plateNumber === item.id,
                                );
                                if (!plate) throw new Error("Plate not found");
                                await deletePlate(plate._id);
                                setPlates((prev) =>
                                  prev.filter((p) => p._id !== plate._id),
                                );
                              } else {
                                const die = dies.find(
                                  (d) => d.dieNumber === item.id,
                                );
                                if (!die) throw new Error("Die not found");
                                await deleteDie(die._id);
                                setDies((prev) =>
                                  prev.filter((d) => d._id !== die._id),
                                );
                              }
                            } catch (err) {
                              window.alert(
                                err?.response?.data?.message ||
                                  err.message ||
                                  "Failed to delete asset",
                              );
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <footer className="table-footer">
            <span className="results-count">
              Showing {filteredAssets.length} of {allAssets.length} assets
            </span>
            <div className="pagination">
              <button className="page-nav">⟨</button>
              <button className="page-num active">1</button>
              <button className="page-nav">⟩</button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default PlateAndDie;
