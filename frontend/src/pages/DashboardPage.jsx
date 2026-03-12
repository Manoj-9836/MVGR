import React, { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import InsightsCard from "../components/InsightsCard";
import WellnessHabitsSnapshot from "../components/WellnessHabitsSnapshot";
import ScreenSleepCorrelation from "../charts/ScreenSleepCorrelation";
import WeeklyProductivityTrend from "../charts/WeeklyProductivityTrend";
import { getAnalysis, getInsights, getWellness } from "../services/api";
import { createTranslator, supportedLanguages } from "../utils/i18n";

function DashboardPage() {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("habitlens-language");
    return supportedLanguages.includes(saved) ? saved : "en";
  });
  const [activeNav, setActiveNav] = useState("dashboard");
  const [records, setRecords] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [insights, setInsights] = useState([]);
  const [advisorResponse, setAdvisorResponse] = useState("");
  const t = useMemo(() => createTranslator(language), [language]);

  useEffect(() => {
    localStorage.setItem("habitlens-language", language);
  }, [language]);

  async function refreshDashboard() {
    const [wellnessData, analysisData, insightsData] = await Promise.all([
      getWellness(),
      getAnalysis(),
      getInsights("Why am I stressed?")
    ]);

    setRecords([...wellnessData].reverse());
    setAnalysis(analysisData);
    setInsights(insightsData.insights || []);
    setAdvisorResponse(insightsData.advisor_response || t("advisor.noResponse"));
  }

  useEffect(() => {
    setAdvisorResponse(t("advisor.loading"));
    refreshDashboard().catch(() => {
      setAdvisorResponse(t("advisor.unableLoad"));
    });
  }, [language]);

  const latest = useMemo(() => {
    if (analysis?.latest) {
      return analysis.latest;
    }
    if (records.length > 0) {
      return records[records.length - 1];
    }
    return null;
  }, [analysis, records]);

  return (
    <div className="app-frame">
      <aside className="side-nav">
        <div className="brand-block">
          <span className="brand-mark">✦</span>
          <span className="brand-name">habitlens</span>
        </div>

        <nav className="side-links">
          <button
            className={`side-link ${activeNav === "dashboard" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveNav("dashboard")}
          >
            <span>{t("nav.dashboard")}</span>
            <span className="link-badge">3</span>
          </button>
          <button
            className={`side-link ${activeNav === "settings" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveNav("settings")}
          >
            <span>{t("nav.settings")}</span>
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="page-shell">
          <header className="hero">
            <div className="hero-content">
              <h1>{t("hero.title")}</h1>
              <p className="hero-subtitle">{t("hero.subtitle")}</p>
            </div>
          </header>

          {activeNav === "settings" && (
            <section className="section settings-panel">
              <div>
                <h2 className="section-title">{t("settings.title")}</h2>
                <p className="section-description">{t("settings.description")}</p>
              </div>

              <div className="language-control">
                <label htmlFor="language-select">{t("settings.languageLabel")}</label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                >
                  {supportedLanguages.map((code) => (
                    <option key={code} value={code}>
                      {t(`language.${code}`)}
                    </option>
                  ))}
                </select>
                <p>{t("settings.languageHint")}</p>
              </div>
            </section>
          )}

          <section className="section current-status">
            <h2 className="section-title">{t("section.currentStatus")}</h2>
            <div className="top-cards">
              <StatCard
                label={t("stat.stressLevel")}
                value={latest ? `${latest.stress_level}` : "-"}
                subvalue={latest ? `(${latest.stress_score.toFixed(2)})` : ""}
                helper={t("stat.stressHelper")}
              />
              <StatCard
                label={t("stat.productivityScore")}
                value={latest ? latest.productivity_score.toFixed(2) : "-"}
                helper={t("stat.productivityHelper")}
              />
            </div>
          </section>

          <section className="section patterns">
            <h2 className="section-title">{t("section.patterns")}</h2>
            <p className="section-description">{t("section.patternsDescription")}</p>
            <div className="chart-grid">
              <WellnessHabitsSnapshot records={records} t={t} />
              <ScreenSleepCorrelation records={records} t={t} />
              <WeeklyProductivityTrend records={records} t={t} language={language} />
            </div>
          </section>

          <section className="section insights">
            <h2 className="section-title">{t("section.recommendations")}</h2>
            <p className="section-description">{t("section.recommendationsDescription")}</p>
            <InsightsCard
              insights={insights}
              advisorResponse={advisorResponse}
              causalAnalysis={analysis?.causal_analysis}
              t={t}
            />
          </section>

          <footer className="footer">
            <p>{t("footer.powered")}</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
