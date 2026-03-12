import React from "react";

function StatCard({ label, value, subvalue, helper }) {
  return (
    <div className="card stat-card">
      <p className="card-label">{label}</p>
      <div className="card-value-container">
        <h3 className="card-value">{value}</h3>
        {subvalue && <span className="card-subvalue">{subvalue}</span>}
      </div>
      <p className="card-helper">{helper}</p>
    </div>
  );
}

export default StatCard;

