import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [driverId, setDriverId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [drivers, setDrivers] = useState([]);

  const fetchDrivers = async () => {
    const res = await axios.get("http://localhost:5001/api/drivers");
    setDrivers(res.data);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const createDriver = async () => {
    if (!name) return;
    await axios.post("http://localhost:5001/api/drivers/create", { name });
    setName("");
    fetchDrivers();
  };

  const submitFeedback = async () => {
    if (!driverId) return;

    await axios.post("http://localhost:5001/api/drivers/feedback", {
      driverId,
      text: feedback,
      rating
    });

    setFeedback("");
    setRating(0);
    fetchDrivers();
  };

  return (
    <div className="container mt-4">

      <h1 className="text-center mb-4 text-primary">
        🚗 Driver Sentiment Dashboard
      </h1>

      {/* Create Driver */}
      <div className="card p-3 mb-4 shadow">
        <h4>Create Driver</h4>
        <div className="row">
          <div className="col-md-8">
            <input
              className="form-control"
              placeholder="Enter driver name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <button className="btn btn-success w-100" onClick={createDriver}>
              Add Driver
            </button>
          </div>
        </div>
      </div>

      {/* Submit Feedback */}
      <div className="card p-3 mb-4 shadow">
        <h4>Submit Feedback</h4>

        <input
          className="form-control mb-2"
          placeholder="Driver ID"
          value={driverId}
          onChange={e => setDriverId(e.target.value)}
        />

        <div className="mb-3">
          <label>Rate Driver:</label>
          <div style={{ fontSize: "30px" }}>
            {[1,2,3,4,5].map(star => (
              <span
                key={star}
                style={{
                  cursor: "pointer",
                  color: star <= rating ? "gold" : "gray"
                }}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <input
          className="form-control mb-3"
          placeholder="Optional text feedback"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
        />

        <button className="btn btn-primary w-100" onClick={submitFeedback}>
          Submit Feedback
        </button>
      </div>

      {/* Dashboard */}
      <div className="card p-3 shadow">
        <h4>Driver Performance</h4>
        <table className="table table-bordered table-hover mt-3">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Average Score</th>
              <th>Total Feedback</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>{d.averageScore.toFixed(2)}</td>
                <td>{d.feedbackCount}</td>
                <td>
                  {d.averageScore < 2.5 ? (
                    <span className="badge bg-danger">⚠ Underperforming</span>
                  ) : (
                    <span className="badge bg-success">Good</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default App;