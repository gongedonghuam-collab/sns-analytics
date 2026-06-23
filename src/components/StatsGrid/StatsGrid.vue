<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div class="flex items-center gap-2 text-slate-400 mb-2">
          <Users class="w-4 h-4 text-blue-400" />
          <span class="text-xs font-bold">総リーチ数</span>
        </div>
        <p class="text-2xl font-black">{{ totalReach.toLocaleString() }}</p>
      </div>
      <div class="bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div class="flex items-center gap-2 text-slate-400 mb-2">
          <TrendingUp class="w-4 h-4 text-emerald-400" />
          <span class="text-xs font-bold">平均保存率</span>
        </div>
        <p class="text-2xl font-black">{{ avgSaveRate }}%</p>
      </div>
    </div>

    <div
      class="bg-slate-800 p-5 rounded-2xl border border-slate-700 relative overflow-hidden"
    >
      <div class="flex justify-between items-end mb-3 relative z-10">
        <div class="flex items-center gap-2 text-slate-400">
          <Target class="w-4 h-4 text-pink-400" />
          <span class="text-xs font-bold">今月のリーチ目標</span>
        </div>
        <button
          @click="changeGoalPrompt"
          class="text-xs font-bold text-slate-300 hover:text-pink-400 transition-colors flex items-center gap-1 bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-700"
          title="目標を変更する"
        >
          <span class="text-pink-400 text-sm font-black">{{
            currentMonthReach.toLocaleString()
          }}</span>
          / {{ goalReach.toLocaleString() }} ⚙️
        </button>
      </div>
      <div
        class="w-full bg-slate-900 h-3 rounded-full overflow-hidden relative z-10 border border-slate-700"
      >
        <div
          class="h-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-1000 ease-out relative"
          :style="{ width: reachProgress + '%' }"
        >
          <div
            class="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30"
          ></div>
        </div>
      </div>
      <p
        v-if="reachProgress >= 100"
        class="text-[10px] text-emerald-400 font-bold mt-2 text-right relative z-10 animate-bounce"
      >
        🎉 目標達成！おめでとうございます！
      </p>
    </div>

    <div class="bg-slate-800 p-5 rounded-2xl border border-slate-700">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2 text-slate-400">
          <Calendar class="w-4 h-4 text-indigo-400" />
          <span class="text-xs font-bold">投稿カレンダー (直近2週間)</span>
        </div>
      </div>

      <div class="flex justify-between items-center gap-1.5">
        <div
          v-for="day in last14Days"
          :key="day.date"
          class="w-full aspect-square rounded-[4px] transition-colors duration-300 relative group cursor-pointer"
          :class="[
            day.count === 0
              ? 'bg-slate-900 border border-slate-700'
              : day.count === 1
                ? 'bg-emerald-500/40 border border-emerald-500/50'
                : day.count === 2
                  ? 'bg-emerald-500/80 border border-emerald-500/50 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                  : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]',
          ]"
        >
          <div
            class="absolute -bottom-8 left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg border border-slate-600md"
          >
            {{ day.date }} : {{ day.count }}投稿
          </div>
        </div>
      </div>

      <div
        class="flex justify-between mt-2 text-[8px] text-slate-500 font-bold px-1"
      >
        <span>14日前</span>
        <span>今日</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users, TrendingUp, Target, Calendar } from "lucide-vue-next";
import { usePostsStore } from "../../stores/usePosts";
import type { AnalyzedPost } from "../../types";
import { useStats } from "./StatsGrid";

const props = defineProps<{ posts: AnalyzedPost[] }>();
const {
  totalReach,
  avgSaveRate,
  currentMonthReach,
  goalReach,
  reachProgress,
  last14Days,
} = useStats(props);
const postStore = usePostsStore();

// ✨ 追加：数字をクリックした時にポップアップを出して目標を上書きする関数
const changeGoalPrompt = () => {
  const promptVal = window.prompt(
    "今月の目標リーチ数を入力してください：",
    String(goalReach.value),
  );
  if (promptVal !== null) {
    const num = parseInt(promptVal, 10);
    if (!isNaN(num) && num > 0) {
      postStore.updateGoal(num);
    } else {
      alert("有効な数字を入力してください。");
    }
  }
};
</script>
