<template>
  <div
    class="bg-gradient-to-br from-indigo-900 to-purple-900 p-5 rounded-2xl border border-indigo-500/50 relative overflow-hidden shadow-lg shadow-purple-900/20 text-left"
  >
    <div
      v-if="postStore.isDeepAnalyzing"
      class="absolute inset-0 z-30 bg-purple-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4"
    >
      <div
        class="w-8 h-8 border-3 border-pink-400 border-t-transparent rounded-full animate-spin mb-2"
      ></div>
      <p class="text-xs text-pink-300 font-bold animate-pulse">
        全データをAIがクロス分析中...
      </p>
    </div>

    <div
      class="absolute -right-4 -top-4 w-24 h-24 bg-pink-500/20 blur-2xl rounded-full"
    ></div>

    <div class="flex justify-between items-center mb-3 relative z-10">
      <h2 class="text-sm font-bold text-pink-300 flex items-center gap-2">
        🔮 AI 全データディープ分析・バズ予測
      </h2>
      <button
        @click="postStore.analyzeAllPostsViaAI"
        :disabled="postStore.rawPosts.length === 0"
        class="text-[9px] bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/30 text-indigo-200 px-2 py-1 rounded-lg font-bold transition-all disabled:opacity-40"
      >
        🔄 再分析
      </button>
    </div>

    <div v-if="postStore.aiDeepResult" class="space-y-3 relative z-10">
      <div
        class="bg-slate-900/60 p-4 rounded-xl border border-indigo-500/30 space-y-2"
      >
        <p class="text-xs text-slate-400 font-bold">
          🎯 最適な掛け合わせパターン
        </p>
        <p class="text-sm font-bold text-white leading-relaxed">
          <span class="text-pink-400"
            >【層】{{ postStore.aiDeepResult.bestPersona }}</span
          ><br />
          <span class="text-emerald-400"
            >【タグ】{{ postStore.aiDeepResult.bestTag }}</span
          ><br />
          <span class="text-indigo-400"
            >【BGM】{{ postStore.aiDeepResult.bestBgm }}</span
          >
        </p>
      </div>

      <div
        class="bg-indigo-950/40 p-4 rounded-xl border border-pink-500/20 space-y-1"
      >
        <p class="text-xs text-pink-300 font-bold">
          🎬 次回おすすめの狙い目タイトル案
        </p>
        <p class="text-sm font-black text-white leading-snug">
          {{ postStore.aiDeepResult.titleIdea }}
        </p>
      </div>

      <div
        class="text-[11px] text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-700/50"
      >
        <p class="text-slate-200">
          <span class="text-pink-300 font-bold">💡 データ根拠とアドバイス:</span
          ><br />{{ postStore.aiDeepResult.deepAdvice }}
        </p>
      </div>

      <div class="pt-2">
        <button
          @click="generateActionPlan"
          :disabled="isGenerating"
          class="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white font-bold py-3 px-4 rounded-xl text-xs transition-transform active:scale-95 shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <div
            v-if="isGenerating"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></div>
          {{
            isGenerating
              ? "AIが魔法の台本を作成中..."
              : "✨ この企画の台本・投稿文を自動生成"
          }}
        </button>

        <div
          v-if="generatedContent"
          class="mt-4 p-4 bg-slate-900/80 rounded-xl border border-indigo-500/50 animate-slide-up"
        >
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-bold text-pink-300"
              >📝 生成された台本＆投稿文</span
            >
            <button
              @click="copyToClipboard"
              class="text-[10px] bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-white font-bold transition-colors shadow"
            >
              コピーする
            </button>
          </div>
          <pre
            class="text-[10px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed"
            >{{ generatedContent }}</pre
          >
        </div>
      </div>
    </div>

    <div
      v-else
      class="bg-slate-900/60 p-4 rounded-xl border border-indigo-500/30 text-center py-6 relative z-10"
    >
      <p class="text-xs text-slate-400 leading-relaxed">
        データを追加、またはログインすると、AIが全データを多角的にクロス分析し、あなた専用の「絶対に滑らない勝ちパターン」をここに自動で算出します！
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getGenerativeModel } from "firebase/ai";
import { ai } from "../../firebase";
import { usePostsStore } from "../../stores/usePosts";

const postStore = usePostsStore();
const isGenerating = ref(false);
const generatedContent = ref("");

const generateActionPlan = async () => {
  if (!postStore.aiDeepResult) return;
  isGenerating.value = true;

  try {
    const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
    // ✨ 「凄腕のSNSコンサルタント」へ変更
    const prompt = `あなたは凄腕のSNSコンサルタントです。
以下の「AIが分析した勝ちパターン」を使って、次に投稿するTikTok/Instagramリール動画の【①動画の構成案（3秒のフック・展開・オチ）】と【②そのままコピペして使える投稿文（キャプション・絵文字入り）】と【③最適なハッシュタグ30個】を作成してください。
※アスタリスク(*)やシャープ(#)以外のマークダウン記号は絶対に使わず、改行とスペースだけで見やすく出力してください。

・タイトル案: ${postStore.aiDeepResult.titleIdea}
・ターゲット層: ${postStore.aiDeepResult.bestPersona}
・関連タグ: ${postStore.aiDeepResult.bestTag}
・BGM: ${postStore.aiDeepResult.bestBgm}
・分析アドバイス: ${postStore.aiDeepResult.deepAdvice}`;

    const result = await model.generateContent(prompt);
    generatedContent.value = result.response.text().replace(/\*/g, "").trim();
  } catch (error) {
    console.error("生成エラー:", error);
    alert("台本の生成に失敗しました。");
  } finally {
    isGenerating.value = false;
  }
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(generatedContent.value);
  alert("クリップボードにコピーしました！");
};
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideUp {
  from {
    transform: translateY(10%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
