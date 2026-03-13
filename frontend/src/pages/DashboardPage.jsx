import React, { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import InsightsCard from "../components/InsightsCard";
import WellnessForm from "../components/WellnessForm";
import WellnessHabitsSnapshot from "../components/WellnessHabitsSnapshot";
import ScreenSleepCorrelation from "../charts/ScreenSleepCorrelation";
import WeeklyProductivityTrend from "../charts/WeeklyProductivityTrend";
import { GuideTooltip, InfoCard } from "../components/VisualComponents";
import { getAnalysis, getInsights, getWellness, postWellness } from "../services/api";
import { guidedSteps, hasTourBeenCompleted, markTourCompleted, resetTour } from "../utils/guidedTour";
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
  const [guideOpen, setGuideOpen] = useState(() => !hasTourBeenCompleted());
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [guideTooltipStyle, setGuideTooltipStyle] = useState(null);
  const [guideTooltipPlacement, setGuideTooltipPlacement] = useState("bottom");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formNotice, setFormNotice] = useState(null);
  const t = useMemo(() => createTranslator(language), [language]);
  const activeGuideStep = guideOpen ? guidedSteps[guideStepIndex] : null;

  useEffect(() => {
    localStorage.setItem("habitlens-language", language);
  }, [language]);

  useEffect(() => {
    if (!guideOpen) {
      setGuideTooltipStyle(null);
      setGuideTooltipPlacement("bottom");
      return;
    }

    if (activeGuideStep?.nav) {
      setActiveNav(activeGuideStep.nav);
    }
  }, [activeGuideStep, guideOpen]);

  useEffect(() => {
    if (!guideOpen || !activeGuideStep?.target) {
      return undefined;
    }

    const timeoutIds = [];

    const queuePositionUpdate = (delay) => {
      const timeoutId = window.setTimeout(updateTooltipPosition, delay);
      timeoutIds.push(timeoutId);
    };

    const updateTooltipPosition = () => {
      const target = document.querySelector(activeGuideStep.target);
      if (!target) {
        setGuideTooltipPlacement("center");
        setGuideTooltipStyle({ top: "50%", left: "50%", transform: "translate(-50%, -50%)" });
        return;
      }

      const rect = target.getBoundingClientRect();
      const tooltipWidth = Math.min(360, window.innerWidth - 32);
      const tooltipHeight = window.innerWidth < 640 ? 230 : 250;
      const left = Math.min(
        Math.max(16, rect.left + rect.width / 2 - tooltipWidth / 2),
        window.innerWidth - tooltipWidth - 16
      );

      const spaceAbove = rect.top - 20;
      const spaceBelow = window.innerHeight - rect.bottom - 20;

      let placement = "bottom";
      if (spaceBelow >= tooltipHeight) {
        placement = "bottom";
      } else if (spaceAbove >= tooltipHeight) {
        placement = "top";
      } else {
        placement = spaceAbove > spaceBelow ? "top" : "bottom";
      }

      const topRaw = placement === "top" ? rect.top - tooltipHeight - 20 : rect.bottom + 20;
      const top = Math.min(
        Math.max(16, topRaw),
        Math.max(16, window.innerHeight - tooltipHeight - 16)
      );

      setGuideTooltipPlacement(placement);

      setGuideTooltipStyle({
        width: `${tooltipWidth}px`,
        left: `${left}px`,
        top: `${Math.max(16, top)}px`
      });
    };

    const focusTarget = () => {
      const target = document.querySelector(activeGuideStep.target);
      if (!target) {
        updateTooltipPosition();
        return;
      }

      const rect = target.getBoundingClientRect();
      const targetTop = window.scrollY + rect.top;
      const viewportHeight = window.innerHeight;
      const targetHeight = rect.height;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

      let desiredTop;

      // Tall sections (step 3 and 4) should scroll to an internal anchor, not section start.
      if (targetHeight > viewportHeight * 0.78) {
        const anchorRatio = activeGuideStep.id === "testing" ? 0.42 : 0.36;
        desiredTop = targetTop + targetHeight * anchorRatio - viewportHeight * 0.42;
      } else if (window.innerWidth < 640) {
        desiredTop = targetTop - 88;
      } else {
        desiredTop = targetTop - Math.max(96, Math.round((viewportHeight - targetHeight) / 2));
      }

      window.scrollTo({
        top: Math.max(0, desiredTop),
        behavior: reduceMotion ? "auto" : "smooth"
      });

      queuePositionUpdate(120);
      queuePositionUpdate(320);
      queuePositionUpdate(560);
    };

    const frame = window.requestAnimationFrame(() => {
      focusTarget();
      updateTooltipPosition();
    });
    window.addEventListener("resize", updateTooltipPosition);
    window.addEventListener("scroll", updateTooltipPosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      window.removeEventListener("resize", updateTooltipPosition);
      window.removeEventListener("scroll", updateTooltipPosition, true);
    };
  }, [activeGuideStep, guideOpen, activeNav]);

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

  async function handleWellnessSubmit(payload) {
    setIsSubmitting(true);
    setFormNotice(null);

    try {
      await postWellness(payload);
      await refreshDashboard();
      setFormNotice({ type: "success", message: t("form.saved") });
      setActiveNav("dashboard");
    } catch (_error) {
      setFormNotice({ type: "error", message: t("form.saveFailed") });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGuideNext() {
    if (guideStepIndex >= guidedSteps.length - 1) {
      setGuideOpen(false);
      markTourCompleted();
      setActiveNav("dashboard");
      return;
    }

    setGuideStepIndex((current) => current + 1);
  }

  function handleGuideBack() {
    setGuideStepIndex((current) => Math.max(current - 1, 0));
  }

  function handleGuideClose() {
    setGuideOpen(false);
    markTourCompleted();
    setActiveNav("dashboard");
  }

  function handleGuideRestart() {
    resetTour();
    setGuideStepIndex(0);
    setGuideOpen(true);
    setActiveNav("dashboard");
  }

  function getGuideClass(target) {
    return activeGuideStep?.target === target ? "guide-spotlight" : "";
  }

  const latest = useMemo(() => {
    if (analysis?.latest) {
      return analysis.latest;
    }
    if (records.length > 0) {
      return records[records.length - 1];
    }
    return null;
  }, [analysis, records]);

  const modelSummary = useMemo(() => {
    const ml = analysis?.ml_prediction;
    const causal = analysis?.causal_analysis;

    const humanizeAlgorithm = (name) => {
      if (name === "conditional_granger_var") {
        return "Granger Causality";
      }
      if (name === "dynotears_linear") {
        return "Score-Based Structure Learning (DYNOTEARS)";
      }
      return typeof name === "string" ? name : "";
    };

    const grangerName = humanizeAlgorithm(causal?.granger?.method);
    const scoreBasedName = humanizeAlgorithm(causal?.score_based_structure_learning?.algorithm);

    let algorithmText = "";
    if (grangerName && scoreBasedName) {
      algorithmText = `${grangerName} + ${scoreBasedName}`;
    } else {
      algorithmText = grangerName || scoreBasedName || (ml?.algorithm || "");
    }

    if (!ml || typeof ml !== "object") {
      return { accuracyText: "-", algorithmText };
    }

    const parsedAccuracy = Number(ml.accuracy);
    const normalizedAccuracy = Number.isFinite(parsedAccuracy)
      ? parsedAccuracy > 1 && parsedAccuracy <= 100
        ? parsedAccuracy / 100
        : parsedAccuracy
      : null;

    const accuracyText =
      normalizedAccuracy != null && normalizedAccuracy >= 0 && normalizedAccuracy <= 1
        ? `${(normalizedAccuracy * 100).toFixed(1)}%`
        : "-";

    return { accuracyText, algorithmText };
  }, [analysis]);

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

          <section className={`section quick-help ${getGuideClass("hero")}`}>
            <div className="quick-help-header">
              <div>
                <h2 className="section-title">{t("quick.title")}</h2>
                <p className="section-description">{t("quick.description")}</p>
              </div>
              <button type="button" onClick={handleGuideRestart}>
                {hasTourBeenCompleted() ? t("guide.restart") : t("guide.start")}
              </button>
            </div>
            <div className="quick-help-grid">
              <InfoCard icon="bi bi-eye-fill" title={t("quick.lookTitle")} content={t("quick.lookBody")} color="#a9b0ff" />
              <InfoCard icon="bi bi-cursor-fill" title={t("quick.tapTitle")} content={t("quick.tapBody")} color="#c4b5fd" />
              <InfoCard icon="bi bi-palette-fill" title={t("quick.colorTitle")} content={t("quick.colorBody")} color="#cbe56b" />
            </div>
          </section>

          {activeNav === "settings" && (
            <section className={`section settings-panel ${getGuideClass("settings")}`}>
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
                <button className="secondary-action" type="button" onClick={handleGuideRestart}>
                  {t("guide.restart")}
                </button>
              </div>
            </section>
          )}

          <section className={`section current-status ${getGuideClass("status")}`}>
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
              <StatCard
                label={t("stat.algorithmAccuracy")}
                value={modelSummary.accuracyText}
                subvalue={modelSummary.algorithmText ? `(${modelSummary.algorithmText})` : ""}
                helper={t("stat.algorithmAccuracyHelper")}
              />
            </div>
          </section>

          <section className={`section patterns ${getGuideClass("patterns")}`}>
            <h2 className="section-title">{t("section.patterns")}</h2>
            <p className="section-description">{t("section.patternsDescription")}</p>
            <div className="chart-grid">
              <WellnessHabitsSnapshot records={records} t={t} />
              <ScreenSleepCorrelation records={records} t={t} />
              <WeeklyProductivityTrend records={records} t={t} language={language} />
            </div>
          </section>

          <section className={`section guided-testing ${getGuideClass("testing")}`}>
            <div className="guided-testing-header">
              <div>
                <h2 className="section-title">{t("section.tryIt")}</h2>
                <p className="section-description">{t("section.tryItDescription")}</p>
              </div>
              <div className="guided-testing-mini-steps">
                <span>{t("form.stepFill")}</span>
                <span>{t("form.stepSave")}</span>
                <span>{t("form.stepCheck")}</span>
              </div>
            </div>
            <div className="guided-testing-grid">
              <div className="guided-testing-copy">
                <InfoCard icon="bi bi-bezier2" title={t("form.testTitle")} content={t("form.testBody")} color="#a9b0ff" />
                <InfoCard icon="bi bi-graph-up-arrow" title={t("form.resultTitle")} content={t("form.resultBody")} color="#cbe56b" />
              </div>
              <WellnessForm onSubmit={handleWellnessSubmit} loading={isSubmitting} t={t} />
            </div>
            {formNotice && (
              <p className={`form-notice ${formNotice.type}`}>{formNotice.message}</p>
            )}
          </section>

          <section className={`section insights ${getGuideClass("insights")}`}>
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

      {guideOpen && activeGuideStep && (
        <>
          <div className="guide-backdrop" onClick={handleGuideClose} />
          <GuideTooltip
            icon={activeGuideStep.icon}
            title={activeGuideStep.title}
            content={activeGuideStep.content}
            tip={activeGuideStep.tip}
            style={guideTooltipStyle}
            placement={guideTooltipPlacement}
            step={guideStepIndex + 1}
            totalSteps={guidedSteps.length}
            onBack={handleGuideBack}
            onNext={handleGuideNext}
            onClose={handleGuideClose}
            isLast={guideStepIndex === guidedSteps.length - 1}
          />
        </>
      )}
    </div>
  );
}

export default DashboardPage;
