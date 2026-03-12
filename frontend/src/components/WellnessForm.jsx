import React, { useMemo, useState } from "react";
import { FormHint, ValidationFeedback } from "./VisualComponents";
import { inputHints, validationIndicators } from "../utils/visualHints";

const initialState = {
  sleep_hours: 6.5,
  screen_time_hours: 5.2,
  study_time_hours: 4.5,
  steps: 7200,
  heart_rate: 78
};

function getFieldFeedback(name, value) {
  if (Number.isNaN(value)) {
    return validationIndicators.invalid;
  }

  if (name === "sleep_hours") {
    if (value < 0 || value > 12) return validationIndicators.invalid;
    if (value >= 7 && value <= 9) return validationIndicators.valid;
    return validationIndicators.warning;
  }

  if (name === "screen_time_hours") {
    if (value < 0 || value > 16) return validationIndicators.invalid;
    if (value <= 5) return validationIndicators.valid;
    return validationIndicators.warning;
  }

  if (name === "study_time_hours") {
    if (value < 0 || value > 12) return validationIndicators.invalid;
    if (value >= 3 && value <= 7) return validationIndicators.valid;
    return validationIndicators.warning;
  }

  if (name === "steps") {
    if (value < 0 || value > 50000) return validationIndicators.invalid;
    if (value >= 8000) return validationIndicators.valid;
    return validationIndicators.warning;
  }

  if (name === "heart_rate") {
    if (value < 40 || value > 200) return validationIndicators.invalid;
    if (value >= 55 && value <= 100) return validationIndicators.valid;
    return validationIndicators.warning;
  }

  return validationIndicators.info;
}

function WellnessForm({ onSubmit, loading, t }) {
  const [formData, setFormData] = useState(initialState);

  const fieldConfig = useMemo(
    () => [
      { name: "sleep_hours", label: t("form.sleep") },
      { name: "screen_time_hours", label: t("form.screenTime") },
      { name: "study_time_hours", label: t("form.studyTime") },
      { name: "steps", label: t("form.steps") },
      { name: "heart_rate", label: t("form.heartRate") }
    ],
    [t]
  );

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

  function handleUseSample() {
    setFormData(initialState);
  }

  return (
    <form className="card wellness-form" onSubmit={handleSubmit}>
      <div className="wellness-form-header">
        <h3>{t("form.title")}</h3>
        <p>{t("form.description")}</p>
      </div>

      <div className="guided-steps-row" aria-label={t("form.guidedStepsAria")}>
        <span className="guided-step-pill">1. {t("form.stepFill")}</span>
        <span className="guided-step-pill">2. {t("form.stepSave")}</span>
        <span className="guided-step-pill">3. {t("form.stepCheck")}</span>
      </div>

      <div className="form-grid">
        {fieldConfig.map((field) => {
          const hint = inputHints[field.name];
          const feedback = getFieldFeedback(field.name, Number(formData[field.name]));

          return (
            <label key={field.name} className="wellness-field-card">
              <span className="wellness-field-label">{field.label}</span>
              <FormHint
                icon={hint.icon}
                hint={hint.hint}
                examples={hint.examples}
                recommended={hint.recommended}
              />
              <input
                type="number"
                name={field.name}
                step={field.name.includes("hours") ? "0.1" : "1"}
                min={hint.min}
                max={hint.max}
                value={formData[field.name]}
                onChange={handleChange}
                required
              />
              <ValidationFeedback
                isValid={feedback === validationIndicators.valid}
                message={feedback.message}
                icon={feedback.icon}
                color={feedback.color}
              />
            </label>
          );
        })}
      </div>

      <div className="wellness-form-actions">
        <button className="secondary-action" type="button" onClick={handleUseSample}>
          {t("form.useSample")}
        </button>
        <button type="submit" disabled={loading}>
          {loading ? t("form.saving") : t("form.save")}
        </button>
      </div>
    </form>
  );
}

export default WellnessForm;
