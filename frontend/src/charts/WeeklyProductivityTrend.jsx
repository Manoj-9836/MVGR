import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title
);

function WeeklyProductivityTrend({ records, t, language }) {
  const lastSeven = records.slice(-7);

  const localeMap = {
    en: "en-US",
    hi: "hi-IN",
    te: "te-IN",
    ta: "ta-IN"
  };

  const data = {
    labels: lastSeven.map((item) =>
      new Date(item.createdAt).toLocaleDateString(localeMap[language] || "en-US", {
        month: "short",
        day: "numeric"
      })
    ),
    datasets: [
      {
        label: t("chart.productivityScore"),
        data: lastSeven.map((item) => item.productivity_score),
        borderColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return "rgba(124, 58, 237, 1)";
          }

          const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
          gradient.addColorStop(0, "rgba(203, 229, 107, 1)");
          gradient.addColorStop(0.5, "rgba(196, 181, 253, 1)");
          gradient.addColorStop(1, "rgba(124, 58, 237, 1)");
          return gradient;
        },
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return "rgba(196, 181, 253, 0.22)";
          }

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(203, 229, 107, 0.34)");
          gradient.addColorStop(0.45, "rgba(196, 181, 253, 0.24)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0.02)");
          return gradient;
        },
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "rgba(124, 58, 237, 1)",
        pointBorderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointHoverBorderWidth: 4,
        pointHitRadius: 18,
        borderWidth: 4,
        tension: 0.42,
        fill: true
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
        display: false
      },
      title: {
        display: true,
        text: t("chart.weeklyProductivityTrend"),
        color: "#111218",
        font: {
          size: 16,
          weight: "700"
        },
        padding: {
          bottom: 14
        }
      },
      tooltip: {
        backgroundColor: "rgba(17, 18, 24, 0.94)",
        titleColor: "#f8f8fb",
        bodyColor: "#f8f8fb",
        borderColor: "rgba(196, 181, 253, 0.55)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => ` ${t("chart.score")}: ${Number(context.parsed.y).toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: "#61697b",
          font: {
            size: 11,
            weight: "600"
          }
        }
      },
      y: {
        title: {
          display: true,
          text: t("chart.productivityScore"),
          color: "#596173",
          font: {
            size: 12,
            weight: "700"
          }
        },
        ticks: {
          color: "#61697b",
          font: {
            size: 11
          }
        },
        grid: {
          color: "rgba(104, 113, 131, 0.12)",
          drawBorder: false
        }
      }
    }
  };

  return (
    <div className="card chart-card full-width productivity-trend-card">
      <Line data={data} options={options} />
    </div>
  );
}

export default WeeklyProductivityTrend;
