import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

function ScreenSleepCorrelation({ records, t }) {
  const labels = records.map((_, i) => `${t("chart.day")} ${i + 1}`);

  const data = {
    labels,
    datasets: [
      {
        label: t("chart.screenTimeHours"),
        data: records.map((item) => item.screen_time_hours),
        backgroundColor: "rgba(196, 181, 253, 0.9)",
        borderRadius: 6,
        barPercentage: 0.55
      },
      {
        label: t("chart.sleepHours"),
        data: records.map((item) => item.sleep_hours),
        backgroundColor: "rgba(203, 229, 107, 0.9)",
        borderRadius: 6,
        barPercentage: 0.55
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: t("chart.stressLevels"),
        font: { size: 15, weight: "600" },
        color: "#111218"
      }
    },
    scales: {
      x: {
        title: { display: true, text: t("chart.day") }
      },
      y: {
        title: { display: true, text: t("chart.hours") },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="card chart-card">
      <Bar data={data} options={options} />
    </div>
  );
}

export default ScreenSleepCorrelation;
