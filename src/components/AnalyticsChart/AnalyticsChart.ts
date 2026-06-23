import { computed } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import type { AnalyzedPost } from "../../types";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

export function useChart(props: { posts: AnalyzedPost[] }) {
  const chartData = computed(() => ({
    labels: props.posts.map((p) => p.title.substring(0, 8) + "..."),
    datasets: [
      {
        data: props.posts.map((p) => parseFloat(p.saveRate)),
        backgroundColor: props.posts.map((p) =>
          p.isViral ? "#10b981" : "#3b82f6",
        ),
        borderRadius: 6,
      },
    ],
  }));

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#334155" },
        ticks: { color: "#94a3b8" },
      },
      x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
    },
  };

  return { chartData, chartOptions };
}
