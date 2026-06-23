<template>
  <div class="bg-slate-800 p-5 rounded-2xl border border-slate-700">
    <h2 class="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
      <Bookmark class="w-4 h-4 text-pink-400" />
      投稿ごとの保存率（3%以上でバズ）
    </h2>
    <div class="h-48 relative">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from "vue-chartjs";
import { Bookmark } from "lucide-vue-next";
import type { AnalyzedPost } from "../../types";
import { useChart } from "./AnalyticsChart";

const props = defineProps<{ posts: AnalyzedPost[] }>();
const { chartData, chartOptions } = useChart(props);
</script>
