import React, { useState } from "react";

const initialState = {
  sleep_hours: 6.5,
  screen_time_hours: 5.2,
  study_time_hours: 4.5,
  steps: 7200,
  heart_rate: 78
};

function WellnessForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState(initialState);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: Number(value)
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(formData);
  }

  return (
    <form className="card wellness-form" onSubmit={handleSubmit}>
      <h3>Daily Wellness Input</h3>
      <div className="form-grid">
        <label>
          Sleep Hours
          <input
            type="number"
            name="sleep_hours"
            step="0.1"
            value={formData.sleep_hours}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Screen Time Hours
          <input
            type="number"
            name="screen_time_hours"
            step="0.1"
            value={formData.screen_time_hours}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Study Time Hours
          <input
            type="number"
            name="study_time_hours"
            step="0.1"
            value={formData.study_time_hours}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Steps
          <input
            type="number"
            name="steps"
            value={formData.steps}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Heart Rate
          <input
            type="number"
            name="heart_rate"
            value={formData.heart_rate}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Wellness Data"}
      </button>
    </form>
  );
}

export default WellnessForm;
