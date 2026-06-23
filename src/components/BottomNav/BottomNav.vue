<template>
  <nav
    class="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-slate-900/90 backdrop-blur-md border-t border-slate-800 z-50 pb-safe"
  >
    <div class="flex justify-around items-center p-2">
      <button
        @click="$emit('update:activeTab', 'home')"
        class="flex flex-col items-center gap-1 p-2 w-16 transition-colors"
        :class="
          activeTab === 'home'
            ? 'text-pink-400'
            : 'text-slate-500 hover:text-slate-300'
        "
      >
        <Home
          class="w-6 h-6"
          :class="{ 'fill-pink-400/20': activeTab === 'home' }"
        />
        <span class="text-[10px] font-bold">ホーム</span>
      </button>
      <button
        @click="$emit('update:activeTab', 'analytics')"
        class="flex flex-col items-center gap-1 p-2 w-16 transition-colors"
        :class="
          activeTab === 'analytics'
            ? 'text-pink-400'
            : 'text-slate-500 hover:text-slate-300'
        "
      >
        <BarChart2
          class="w-6 h-6"
          :class="{ 'fill-pink-400/20': activeTab === 'analytics' }"
        />
        <span class="text-[10px] font-bold">分析</span>
      </button>
      <button
        @click="$emit('update:activeTab', 'settings')"
        class="flex flex-col items-center gap-1 p-2 w-16 transition-colors"
        :class="
          activeTab === 'settings'
            ? 'text-pink-400'
            : 'text-slate-500 hover:text-slate-300'
        "
      >
        <Settings
          class="w-6 h-6"
          :class="{ 'fill-pink-400/20': activeTab === 'settings' }"
        />
        <span class="text-[10px] font-bold">設定</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Home, BarChart2, Settings } from "lucide-vue-next";

// 3つのタブしか許容しない「専用の型」を作る
type TabType = "home" | "analytics" | "settings";

// genericなstringではなく、TabTypeを使うように修正
defineProps<{ activeTab: TabType }>();
defineEmits<{ (e: "update:activeTab", value: TabType): void }>();
</script>
