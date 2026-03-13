import React, { useMemo } from "react";

function WeeklyProductivityTrend({ records, t, language }) {
  const lastFourteen = useMemo(() => {
    const latestByDay = new Map();

    for (const item of records) {
      const createdAt = new Date(item.createdAt);
      if (Number.isNaN(createdAt.getTime())) {
        continue;
      }

      const dayStart = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate()).getTime();
      const existing = latestByDay.get(dayStart);

      // Keep only the latest record for each day.
      if (!existing || new Date(existing.createdAt).getTime() < createdAt.getTime()) {
        latestByDay.set(dayStart, item);
      }
    }

    return Array.from(latestByDay.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value)
      .slice(-14);
  }, [records]);

  const sleepValues = lastFourteen.map((item) => Number(item.sleep_hours || 0));
  const heartValues = lastFourteen.map((item) => Number(item.heart_rate || 0));
  const stepValues = lastFourteen.map((item) => Number(item.steps || 0));
  const maxSleep = Math.max(...sleepValues, 1);

  const avgSleep =
    sleepValues.length > 0
      ? (sleepValues.reduce((sum, value) => sum + value, 0) / sleepValues.length).toFixed(1)
      : "-";

  const sleepScore =
    sleepValues.length > 0
      ? Math.round(
          (sleepValues.filter((value) => value >= 7 && value <= 9).length / sleepValues.length) * 100
        )
      : 0;

  const avgHeartRate =
    heartValues.length > 0
      ? Math.round(heartValues.reduce((sum, value) => sum + value, 0) / heartValues.length)
      : "-";

  const strongestDayIndex = useMemo(() => {
    if (!stepValues.length) {
      return -1;
    }
    return stepValues.indexOf(Math.max(...stepValues));
  }, [stepValues]);

  const localeMap = {
    en: "en-US",
    hi: "hi-IN",
    te: "te-IN",
    ta: "ta-IN"
  };

  const dayLabels = lastFourteen.map((item) =>
    new Date(item.createdAt).toLocaleDateString(localeMap[language] || "en-US", {
      weekday: "short"
    })
  );

  return (
    <div className="card chart-card full-width productivity-trend-card sleep-analysis-card">
      <div className="sleep-analysis-header">
        <h3>{t("chart.sleepAnalysis")}</h3>
        <span className="sleep-analysis-tag">14 {t("chart.day")} window</span>
      </div>

      <div className="sleep-analysis-metrics">
        <div>
          <p>{t("chart.sleepScore")}</p>
          <strong>{sleepScore}<span>%</span></strong>
        </div>
        <div>
          <p>{t("chart.avgSleep")}</p>
          <strong>{avgSleep}<span>{t("unit.hrs")}</span></strong>
        </div>
        <div>
          <p>{t("chart.avgHeartRate")}</p>
          <strong>{avgHeartRate}<span>bpm</span></strong>
        </div>
      </div>

      <div className="sleep-analysis-bars" role="img" aria-label={t("chart.sleepBarsLabel")}>
        {sleepValues.map((value, index) => {
          const height = Math.max(10, Math.round((value / maxSleep) * 74));
          const isHighlight = index === strongestDayIndex;

          return (
            <div className="sleep-analysis-col" key={`${dayLabels[index]}-${index}`}>
              <div
                className={`sleep-analysis-bar ${isHighlight ? "highlight" : ""}`}
                style={{ height: `${height}px` }}
                title={`${dayLabels[index]}: ${value.toFixed(1)} ${t("unit.hrs")}`}
              />
              <span>{dayLabels[index]}</span>
            </div>
          );
        })}
      </div>

      <p className="sleep-analysis-footnote">
        {t("chart.sleepFootnote")}
      </p>
    </div>
  );
}

export default WeeklyProductivityTrend;
