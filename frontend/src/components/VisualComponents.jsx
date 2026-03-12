import React, { useState } from "react";
import "../styles/visualComponents.css";

function Icon({ className, decorative = true }) {
  return <i className={className} aria-hidden={decorative ? "true" : undefined} />;
}

/**
 * VisualTooltip Component
 * Displays icon-based hints on hover - minimal text
 */
export function VisualTooltip({ icon, label, message, children }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="visual-tooltip-wrapper"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="visual-tooltip">
          <div className="tooltip-icon"><Icon className={icon} /></div>
          <div className="tooltip-content">
            <strong>{label}</strong>
            <p>{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * HealthBadge Component
 * Shows emoji-based status indicators
 */
export function HealthBadge({ status, icon, label, color }) {
  return (
    <div className="health-badge" style={{ backgroundColor: color }}>
      <span className="health-emoji"><Icon className={icon} /></span>
      <div className="health-info">
        <span className="health-label">{label}</span>
        <span className="health-status">{status}</span>
      </div>
    </div>
  );
}

/**
 * ProgressBar Component
 * Visual progress indicator with emoji
 */
export function ProgressBar({ percentage, icon, label, color }) {
  return (
    <div className="progress-container">
      <div className="progress-header">
        <span className="progress-emoji"><Icon className={icon} /></span>
        <span className="progress-label">{label}</span>
      </div>
      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="progress-text">{percentage}%</span>
    </div>
  );
}

/**
 * ValidationFeedback Component
 * Shows input validation with emoji + color
 */
export function ValidationFeedback({ isValid, message, icon, color }) {
  if (!message) return null;

  return (
    <div
      className="validation-feedback"
      style={{
        borderLeft: `4px solid ${color}`,
        backgroundColor: `${color}20`,
      }}
    >
      <span className="validation-icon"><Icon className={icon} /></span>
      <span className="validation-message">{message}</span>
    </div>
  );
}

/**
 * FormHint Component
 * Shows example values and hints for form inputs
 */
export function FormHint({ icon, hint, examples, recommended }) {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="form-hint">
      <div className="form-hint-header" onClick={() => setShowExamples(!showExamples)}>
        <span className="form-hint-icon"><Icon className={icon} /></span>
        <span className="form-hint-text">{hint}</span>
        <span className="form-hint-toggle"><Icon className="bi bi-chevron-down" /></span>
      </div>

      {showExamples && (
        <div className="form-hint-examples">
          <p className="form-hint-recommended">
            <Icon className="bi bi-bullseye" /> Target: <strong>{recommended}</strong>
          </p>
          <p className="form-hint-label">Examples:</p>
          <ul className="form-hint-list">
            {examples.map((example, idx) => (
              <li key={idx}><Icon className="bi bi-check2" /> {example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * StressIndicatorBadge Component
 * Large emoji-based stress display
 */
export function StressIndicatorBadge({ stressScore, icon, label, color }) {
  return (
    <div className="stress-badge" style={{ borderColor: color }}>
      <div className="stress-emoji-large"><Icon className={icon} /></div>
      <div className="stress-text">
        <span className="stress-score">{stressScore.toFixed(1)}</span>
        <span className="stress-label">{label}</span>
      </div>
    </div>
  );
}

/**
 * ProductivityBadge Component
 * Shows productivity level with emoji
 */
export function ProductivityBadge({ score, icon, label, color }) {
  return (
    <div className="productivity-badge" style={{ backgroundColor: color }}>
      <span className="productivity-emoji"><Icon className={icon} /></span>
      <div className="productivity-info">
        <span className="productivity-score">{score}</span>
        <span className="productivity-label">{label}</span>
      </div>
    </div>
  );
}

/**
 * InfoCard Component
 * Highlighted info block with icon
 */
export function InfoCard({ icon, title, content, color }) {
  return (
    <div
      className="info-card"
      style={{
        borderLeft: `5px solid ${color}`,
        backgroundColor: `${color}10`,
      }}
    >
      <div className="info-card-header">
        <span className="info-icon"><Icon className={icon} /></span>
        <span className="info-title">{title}</span>
      </div>
      <p className="info-content">{content}</p>
    </div>
  );
}

export function GuideTooltip({
  icon,
  title,
  content,
  tip,
  style,
  placement = "bottom",
  step,
  totalSteps,
  onBack,
  onNext,
  onClose,
  isLast
}) {
  return (
    <div className={`guide-tooltip guide-tooltip-${placement}`} style={style} role="dialog" aria-live="polite">
      <div className="guide-tooltip-header">
        <p className="guide-tooltip-step">Step {step}/{totalSteps}</p>
        <button type="button" className="guide-tooltip-close" onClick={onClose}>
          <Icon className="bi bi-x-lg" />
        </button>
      </div>
      <div className="guide-tooltip-title-row">
        <span className="guide-tooltip-icon"><Icon className={icon} /></span>
        <h3>{title}</h3>
      </div>
      <p className="guide-tooltip-copy">{content}</p>
      <span className="guide-tooltip-tip">{tip}</span>
      <div className="guide-tooltip-actions">
        <button type="button" className="secondary-action" onClick={onBack} disabled={step === 1}>
          Back
        </button>
        <button type="button" onClick={onNext}>
          {isLast ? "Done" : "Next"}
        </button>
      </div>
    </div>
  );
}
