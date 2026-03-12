import React, { useMemo } from "react";
import { VisualTooltip } from "./VisualComponents";
import { healthIndicators } from "../utils/visualHints";

function WellnessHabitsSnapshot({ records, t }) {
  const habitConfig = useMemo(
    () => [
      {
        key: "sleep_hours",
        icon: healthIndicators.sleep.icon,
        helperText: "7 to 9 hours is the healthy range.",
        label: t("metric.sleep"),
        unit: t("unit.hrs"),
        targetLabel: t("target.sleep"),
        ideal: 8,
        formatter: (value) => value.toFixed(1),
        getStatus: (value) => {
          if (value >= 7 && value <= 9) {
            return t("status.onTrack");
          }
          if (value >= 6) {
            return t("status.slightlyLow");
          }
          return t("status.needsAttention");
        }
      },
      {
        key: "screen_time_hours",
        icon: healthIndicators.screenTime.icon,
        helperText: "Less screen time usually helps focus and sleep.",
        label: t("metric.screenTime"),
        unit: t("unit.hrs"),
        targetLabel: t("target.screenTime"),
        ideal: 5,
        formatter: (value) => value.toFixed(1),
        getStatus: (value) => {
          if (value <= 5) {
            return t("status.healthyRange");
          }
          if (value <= 6) {
            return t("status.watchClosely");
          }
          return t("status.tooHigh");
        }
      },
      {
        key: "steps",
        icon: healthIndicators.steps.icon,
        helperText: "More daily movement usually means a stronger routine.",
        label: t("metric.dailySteps"),
        unit: t("unit.steps"),
        targetLabel: t("target.steps"),
        ideal: 9000,
        formatter: (value) => Math.round(value).toLocaleString(),
        getStatus: (value) => {
          if (value >= 8000) {
            return t("status.strongRoutine");
          }
          if (value >= 6500) {
            return t("status.almostThere");
          }
          return t("status.increaseMovement");
        }
      }
    ],
    [t]
  );

  const metrics = useMemo(() => {
    if (!records.length) {
      return [];
    }

    return habitConfig.map((item) => {
      const average = records.reduce((sum, entry) => sum + Number(entry[item.key] || 0), 0) / records.length;
      const progress = Math.min((average / item.ideal) * 100, 100);

      return {
        ...item,
        average,
        progress,
        status: item.getStatus(average)
      };
    });
  }, [habitConfig, records]);

  const metricsByKey = useMemo(() => {
    return metrics.reduce((acc, metric) => {
      acc[metric.key] = metric;
      return acc;
    }, {});
  }, [metrics]);

  const circleOrder = ["sleep_hours", "screen_time_hours", "steps"];

  return (
    <section className="card chart-card habits-snapshot-card snapshot-container">
      <div className="snapshot-header">
        <h3>{t("snapshot.title")}</h3>
        <p>{t("snapshot.description")}</p>
      </div>

      <div className="snapshot-bubble-stage">
        {circleOrder.map((key) => {
          const metric = metricsByKey[key];
          if (!metric) {
            return null;
          }

          return (
            <div key={key} className={`snapshot-bubble snapshot-bubble-${key}`}>
              <p className="snapshot-bubble-icon" aria-hidden="true"><i className={metric.icon} /></p>
              <p className="snapshot-bubble-value">{metric.formatter(metric.average)}</p>
              <p className="snapshot-bubble-unit">{metric.unit}</p>
              <p className="snapshot-bubble-label">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="snapshot-status-strip">
        {circleOrder.map((key) => {
          const metric = metricsByKey[key];
          if (!metric) {
            return null;
          }

          return (
            <VisualTooltip
              key={`${key}-status`}
              icon={metric.icon}
              label={metric.label}
              message={metric.helperText}
            >
              <div className={`snapshot-status-item snapshot-status-item-${key}`}>
                <p className="snapshot-label">
                  <span className="snapshot-label-icon" aria-hidden="true"><i className={metric.icon} /></span>
                  {metric.label}
                </p>
                <p className="snapshot-target">{metric.targetLabel}</p>
                <span className="snapshot-status">{metric.status}</span>
              </div>
            </VisualTooltip>
          );
        })}
      </div>
    </section>
  );
}

export default WellnessHabitsSnapshot;