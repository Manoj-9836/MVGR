import React from "react";
import { InfoCard } from "./VisualComponents";

function ConfidenceBadge({ score }) {
  if (score == null) return null;
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626";
  return (
    <span className="confidence-badge" style={{ background: color }}>
      {score}%
    </span>
  );
}

function InsightsCard({ insights, advisorResponse, causalAnalysis, t }) {
  const plp = causalAnalysis?.primary_leverage_point;
  const recs = causalAnalysis?.recommendations ?? [];
  const hasCausal = plp != null || recs.length > 0;
  const starterAction = plp?.action || recs[0]?.action;

  return (
    <div className="card insights-card">
      <div className="insights-card-header">
        <p className="insights-eyebrow">{t("insights.engine")}</p>
        <h3>{t("insights.actionableTitle")}</h3>
        <p className="insights-intro">{t("insights.intro")}</p>
      </div>

      {starterAction && (
        <InfoCard
          icon="bi bi-sign-turn-right-fill"
          title={t("insights.startHere")}
          content={starterAction}
          color="#a9b0ff"
        />
      )}

      <div className="insights-body-grid">
        {plp && (
          <div className="causal-leverage-box">
            <p className="causal-section-label">{t("insights.primaryLeveragePoint")}</p>
            <div className="plp-header">
              <span className="plp-variable">{plp.variable.replace(/_/g, " ")}</span>
              <ConfidenceBadge score={plp.confidence_score} />
              {plp.corroborated_by_dynotears && (
                <span className="dyno-badge">DYNOTEARS ✓</span>
              )}
            </div>
            <p className="plp-action">{plp.action}</p>
            <p className="plp-impact">{t("insights.expectedImpact")}: {plp.expected_impact}</p>
            {plp.alternative && (
              <p className="plp-alternative">{t("insights.alternative")}: {plp.alternative}</p>
            )}
          </div>
        )}

        {recs.length > 0 && (
          <div className="causal-recs-section">
            <p className="causal-section-label">{t("insights.causalRecommendations")}</p>
            <ul className="recs-list">
              {recs.slice(0, 4).map((rec, i) => (
                <li key={i} className="rec-item">
                  <div className="rec-header">
                    <span className="rec-pattern">{rec.causal_pattern}</span>
                    <ConfidenceBadge score={rec.confidence_score} />
                    {rec.corroborated_by_dynotears && (
                      <span className="dyno-badge">DYNOTEARS ✓</span>
                    )}
                  </div>
                  <p className="rec-action">{rec.action}</p>
                  <p className="rec-impact">{t("insights.expectedImpact")}: {rec.expected_impact}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!hasCausal && (
          <ul className="fallback-insights-list">
            {insights.map((insight, index) => (
              <li key={`${insight}-${index}`}>{insight}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="advisor-box">
        <div className="advisor-head">
          <p className="advisor-title">{t("insights.advisorTitle")}</p>
          <span className="advisor-status">{t("insights.live")}</span>
        </div>
        <p>{advisorResponse}</p>
      </div>
    </div>
  );
}

export default InsightsCard;
