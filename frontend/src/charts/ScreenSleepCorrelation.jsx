import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Title, Filler);

const lagZonePlugin = {
  id: "lagZonePlugin",
  beforeDatasetsDraw(chart) {
    const {
      ctx,
      chartArea,
      scales: { x }
    } = chart;

    if (!chartArea || !x || chart.data.labels.length < 3) {
      return;
    }

    const xStart = x.getPixelForValue(1);
    const xEnd = x.getPixelForValue(2);
    const zoneWidth = Math.max(30, xEnd - xStart);

    ctx.save();
    ctx.fillStyle = "rgba(200, 241, 53, 0.09)";
    ctx.strokeStyle = "rgba(122, 153, 36, 0.5)";
    ctx.setLineDash([4, 3]);

    const left = xStart - zoneWidth * 0.5;
    ctx.fillRect(left, chartArea.top, zoneWidth, chartArea.bottom - chartArea.top);
    ctx.strokeRect(left, chartArea.top, zoneWidth, chartArea.bottom - chartArea.top);

    ctx.setLineDash([]);
    ctx.fillStyle = "#5a7310";
    ctx.font = "600 10px 'Plus Jakarta Sans'";
    ctx.fillText("lag = 1 day", left + 8, chartArea.top + 14);
    ctx.restore();
  }
};

ChartJS.register(lagZonePlugin);

function ScreenSleepCorrelation({ records, t }) {
  const maxPoints = 13;
  const source = records.slice(-maxPoints - 1);
  const usable = source.length > 2 ? source : records;

  const labels = usable
    .slice(0, -1)
    .map((item) =>
      new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })
    );

  const stressToday = usable.slice(0, -1).map((item) => Number(item.stress_score || 0));
  const sleepNextDay = usable.slice(1).map((item) => Number(item.sleep_hours || 0));

  const avgStress =
    stressToday.length > 0
      ? (stressToday.reduce((sum, value) => sum + value, 0) / stressToday.length).toFixed(2)
      : "-";
  const avgSleep =
    sleepNextDay.length > 0
      ? (sleepNextDay.reduce((sum, value) => sum + value, 0) / sleepNextDay.length).toFixed(2)
      : "-";

  const data = {
    labels,
    datasets: [
      {
        label: t("chart.stressToday"),
        data: stressToday,
        borderColor: "#ff5c57",
        pointBackgroundColor: "#ff5c57",
        pointRadius: 2.6,
        pointHoverRadius: 4,
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        yAxisID: "yStress"
      },
      {
        label: t("chart.sleepNextDay"),
        data: sleepNextDay,
        borderColor: "#3b82f6",
        pointBackgroundColor: "#3b82f6",
        pointRadius: 2.6,
        pointHoverRadius: 4,
        borderWidth: 2,
        borderDash: [6, 4],
        tension: 0.35,
        fill: false,
        yAxisID: "ySleep"
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      legend: {
        position: "top",
        align: "start",
        labels: {
          boxWidth: 18,
          boxHeight: 2,
          color: "#566074"
        }
      },
      title: {
        display: true,
        text: t("chart.temporalCausationTitle"),
        font: { size: 15, weight: "600" },
        color: "#111218"
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#121520",
        bodyColor: "#4e586e",
        borderColor: "rgba(29, 38, 60, 0.2)",
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            if (context.dataset.yAxisID === "yStress") {
              return ` ${t("chart.stressToday")}: ${Number(context.parsed.y).toFixed(2)}`;
            }
            return ` ${t("chart.sleepNextDay")}: ${Number(context.parsed.y).toFixed(2)} ${t("unit.hrs")}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: "rgba(15, 21, 36, 0.05)"
        },
        ticks: {
          color: "#7a859e",
          maxRotation: 0,
          font: {
            size: 10
          }
        }
      },
      yStress: {
        position: "left",
        min: 0,
        max: 5,
        title: { display: true, text: t("chart.stressScoreAxis") },
        ticks: {
          color: "#ff5c57",
          stepSize: 1
        },
        grid: {
          color: "rgba(15, 21, 36, 0.06)"
        }
      },
      ySleep: {
        position: "right",
        min: 3,
        max: 9.5,
        title: { display: true, text: t("chart.sleepNextDayAxis") },
        ticks: {
          color: "#3b82f6",
          callback: (value) => `${value}${t("unit.hrs")}`
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <div className="card chart-card temporal-causation-card">
      <div className="temporal-summary">
        <div className="temporal-pill">
          <span>{t("chart.avgStress")}</span>
          <strong>{avgStress}</strong>
        </div>
        <div className="temporal-pill">
          <span>{t("chart.nextDaySleep")}</span>
          <strong>{avgSleep} {t("unit.hrs")}</strong>
        </div>
        <div className="temporal-pill">
          <span>{t("chart.lagDetected")}</span>
          <strong>1 {t("chart.day")}</strong>
        </div>
      </div>
      <div className="temporal-canvas-wrap">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default ScreenSleepCorrelation;
