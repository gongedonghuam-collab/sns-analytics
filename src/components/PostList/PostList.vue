<template>
  <div>
    <div class="flex justify-between items-center mb-3 px-1">
      <h2 class="text-sm font-bold text-slate-300">投稿パフォーマンス詳細</h2>
      <select
        v-model="postStore.currentSort"
        class="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-pink-500 cursor-pointer"
      >
        <option value="newest">📅 新しい順</option>
        <option value="reach">🔥 リーチ数順</option>
        <option value="saveRate">💾 保存率順</option>
        <option value="retention">⏱️ 3秒維持率順</option>
      </select>
    </div>

    <div
      v-if="posts.length === 0"
      class="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative overflow-hidden shadow-lg"
    >
      <div
        class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full"
      ></div>
      <h3 class="text-sm font-bold text-slate-200 mb-5 flex items-center gap-2">
        <span class="text-lg">🚀</span> さっそく分析を始めましょう！
      </h3>

      <div class="space-y-3 mb-6 relative z-10">
        <div
          class="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50"
        >
          <span
            class="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shrink-0 shadow"
            >Step 1</span
          >
          <p class="text-xs text-slate-300">
            右下の<span class="text-pink-400 font-bold">「＋」ボタン</span
            >からデータを追加
          </p>
        </div>
        <div
          class="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50"
        >
          <span
            class="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shrink-0 shadow"
            >Step 2</span
          >
          <p class="text-xs text-slate-300">
            データが溜まると<span class="text-pink-400 font-bold"
              >勝ちパターン</span
            >が見えます
          </p>
        </div>
        <div
          class="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50"
        >
          <span
            class="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shrink-0 shadow"
            >Step 3</span
          >
          <p class="text-xs text-slate-300">
            AIが次回作の<span class="text-pink-400 font-bold"
              >台本を自動生成！</span
            >
          </p>
        </div>
      </div>

      <p
        class="text-[10px] text-slate-400 text-center relative z-10 leading-relaxed"
      >
        ※画像アップロード機能を使えば、インサイト画面から数値をある程度自動で読み取ることも可能です。
      </p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-slate-800 p-4 rounded-2xl border border-slate-700 relative overflow-hidden"
      >
        <div
          v-if="post.isHallOfFame"
          class="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"
        ></div>

        <div class="flex justify-between items-start mb-2 relative z-10 gap-3">
          <h3
            class="font-bold text-sm text-left flex-1 break-all leading-normal text-slate-100"
          >
            {{ post.title }}
          </h3>

          <div class="flex items-center gap-2 shrink-0">
            <span
              v-if="post.isHallOfFame"
              class="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-1 rounded-full font-bold border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)] flex items-center gap-1"
            >
              👑 殿堂入り
            </span>
            <span
              v-else-if="post.isViral"
              class="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-1 rounded-full font-bold border border-emerald-500/30"
            >
              🔥 バズ
            </span>

            <button
              @click="postStore.deletePost(post.docId, post.id)"
              class="text-slate-500 hover:text-red-400 transition-colors p-1"
              title="削除"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5 mb-3 relative z-10">
          <span
            v-if="post.persona"
            class="text-[10px] bg-pink-900/40 text-pink-300 border border-pink-500/20 px-2 py-0.5 rounded-md break-all"
          >
            🎯 {{ post.persona }}
          </span>
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md break-all"
          >
            {{ tag }}
          </span>
          <span
            v-if="post.bgm"
            class="text-[10px] bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-md flex items-center gap-1 break-all"
          >
            🎵 {{ post.bgm }}
          </span>
        </div>

        <div
          v-if="post.needsHookImprovement"
          class="mb-3 bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-start gap-2 relative z-10"
        >
          <span class="text-red-400 text-xs">⚠️</span>
          <p class="text-[10px] text-red-300 leading-tight mt-0.5">
            最初の3秒で半分以上が離脱しています。冒頭のフック（引き）を改善しましょう。
          </p>
        </div>

        <div
          class="grid grid-cols-4 gap-2 mt-3 text-xs border-t border-slate-700 pt-3 relative z-10"
        >
          <div>
            <p class="text-slate-500 text-[9px]">リーチ</p>
            <p class="font-bold text-slate-200 mt-0.5">
              {{ post.reach.toLocaleString() }}
            </p>
          </div>
          <div>
            <p class="text-slate-500 text-[9px]">いいね</p>
            <p class="font-bold text-slate-200 mt-0.5">
              {{ post.likes.toLocaleString() }}
            </p>
          </div>
          <div>
            <p class="text-slate-500 text-[9px]">保存率</p>
            <p
              class="font-bold mt-0.5"
              :class="post.isViral ? 'text-emerald-400' : 'text-slate-200'"
            >
              {{ post.saveRate }}%
            </p>
          </div>
          <div>
            <p class="text-slate-500 text-[9px]">3秒維持率</p>
            <p
              class="font-bold mt-0.5"
              :class="
                post.needsHookImprovement
                  ? 'text-red-400'
                  : post.isHallOfFame
                    ? 'text-amber-400'
                    : 'text-slate-200'
              "
            >
              {{ post.retentionRate3s }}%
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trash2 } from "lucide-vue-next";
import { usePostsStore } from "../../stores/usePosts";
import type { AnalyzedPost } from "../../types";

defineProps<{ posts: AnalyzedPost[] }>();
const postStore = usePostsStore();
</script>
