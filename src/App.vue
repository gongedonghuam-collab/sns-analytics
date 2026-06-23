<template>
  <div
    class="max-w-md mx-auto min-h-screen bg-slate-900 pb-24 font-sans text-slate-200 relative shadow-2xl overflow-hidden"
  >
    <LayoutHeader />

    <main class="p-5">
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center py-32 space-y-4"
      >
        <div
          class="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="text-xs font-bold text-slate-400 animate-pulse">
          データを読み込み中...
        </p>
      </div>

      <transition v-else name="fade" mode="out-in">
        <div
          v-if="!currentUser && activeTab !== 'settings'"
          class="flex flex-col items-center py-6 px-2 animate-slide-up pb-20"
        >
          <div
            class="w-16 h-16 bg-gradient-to-tr from-pink-500 to-violet-500 rounded-2xl rotate-12 flex items-center justify-center shadow-lg shadow-pink-500/20 mb-6"
          >
            <span class="text-3xl -rotate-12">📈</span>
          </div>
          <h2
            class="text-2xl font-black text-white mb-3 text-center leading-tight"
          >
            感覚でのSNS運用は、<br /><span
              class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400"
              >もう終わりにしよう。</span
            >
          </h2>
          <p class="text-xs text-slate-400 mb-8 text-center leading-relaxed">
            Viralytics(バイラリティクス)は、ショート動画特化のAI分析ツール。<br />過去のデータから、あなたの「勝ちパターン」を導き出します。
          </p>

          <div class="w-full space-y-3 mb-10">
            <div
              class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center gap-4 shadow-md"
            >
              <div
                class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg shrink-0"
              >
                1️⃣
              </div>
              <div class="text-left">
                <h3 class="text-sm font-bold text-slate-200">
                  投稿データを記録
                </h3>
                <p class="text-[10px] text-slate-400 mt-1">
                  リーチや維持率を入力してデータを蓄積。
                </p>
              </div>
            </div>
            <div
              class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center gap-4 shadow-md"
            >
              <div
                class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg shrink-0"
              >
                2️⃣
              </div>
              <div class="text-left">
                <h3 class="text-sm font-bold text-slate-200">
                  パフォーマンスを可視化
                </h3>
                <p class="text-[10px] text-slate-400 mt-1">
                  バズの基準値（保存率や維持率）を自動判定します。
                </p>
              </div>
            </div>
            <div
              class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center gap-4 shadow-md"
            >
              <div
                class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg shrink-0"
              >
                3️⃣
              </div>
              <div class="text-left">
                <h3 class="text-sm font-bold text-slate-200">
                  AIが次回作を提案
                </h3>
                <p class="text-[10px] text-slate-400 mt-1">
                  過去の成功データから、次バズる構成と台本を生成。
                </p>
              </div>
            </div>
          </div>

          <button
            @click="activeTab = 'settings'"
            class="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/20 active:scale-95 transition-all text-sm"
          >
            無料で使い始める (Googleログイン)
          </button>
        </div>

        <div v-else-if="activeTab === 'home'" class="space-y-6">
          <AiSimulator />

          <div
            v-if="hallOfFamePosts.length > 0"
            class="bg-amber-900/20 border border-amber-500/30 p-4 rounded-2xl"
          >
            <h2
              class="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1"
            >
              👑 あなたの殿堂入りテンプレート
            </h2>
            <p class="text-[10px] text-amber-200/70 mb-3">
              保存率3%かつ維持率60%を超えた最高の動画です。構成をマネしましょう。
            </p>
            <div class="flex gap-3 overflow-x-auto pb-2 snap-x">
              <div
                v-for="post in hallOfFamePosts"
                :key="post.id"
                class="min-w-[140px] bg-slate-800 border border-amber-500/20 p-3 rounded-xl snap-start"
              >
                <p class="text-xs font-bold text-slate-200 truncate">
                  {{ post.title }}
                </p>
                <p class="text-[10px] text-slate-400 mt-1">
                  保存: {{ post.saveRate }}% / 維持: {{ post.retentionRate3s }}%
                </p>
              </div>
            </div>
          </div>

          <!-- ✨ @edit イベントを受け取ってモーダルを開くようにする -->
          <PostList :posts="analyzedPosts" @edit="openEditModal" />
        </div>

        <div v-else-if="activeTab === 'analytics'" class="space-y-6">
          <StatsGrid :posts="analyzedPosts" />
          <AnalyticsChart :posts="analyzedPosts" />
        </div>

        <div v-else-if="activeTab === 'settings'" class="space-y-6">
          <SettingsTab />
        </div>
      </transition>
    </main>

    <BottomNav :activeTab="activeTab" @update:activeTab="activeTab = $event" />

    <!-- 新規追加ボタン -->
    <button
      v-if="currentUser && (activeTab === 'home' || activeTab === 'analytics')"
      @click="openNewModal"
      class="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/40 text-white hover:scale-105 active:scale-95 transition-all z-40"
    >
      <Plus class="w-6 h-6" />
    </button>

    <!-- ✨ editingPost を渡す -->
    <AddPostModal
      :isOpen="isModalOpen"
      :editingPost="editingPost"
      @close="isModalOpen = false"
      @submit="handlePostSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { usePostsStore } from "./stores/usePosts";
import { Plus } from "lucide-vue-next";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";

import LayoutHeader from "./components/LayoutHeader/LayoutHeader.vue";
import AiSimulator from "./components/AiSimulator/AiSimulator.vue";
import StatsGrid from "./components/StatsGrid/StatsGrid.vue";
import AnalyticsChart from "./components/AnalyticsChart/AnalyticsChart.vue";
import PostList from "./components/PostList/PostList.vue";
import SettingsTab from "./components/SettingsTab/SettingsTab.vue";
import BottomNav from "./components/BottomNav/BottomNav.vue";
import AddPostModal from "./components/AddPostModal/AddPostModal.vue";
import type { AnalyzedPost } from "./types";

const activeTab = ref<"home" | "analytics" | "settings">("home");
const isModalOpen = ref(false);
const currentUser = ref<User | null>(null);

// ✨ 編集中のデータを保持する変数
const editingPost = ref<AnalyzedPost | null>(null);

const postStore = usePostsStore();
const { analyzedPosts, hallOfFamePosts, isLoading } = storeToRefs(postStore);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    if (user) {
      postStore.fetchPosts();
    } else {
      postStore.rawPosts = [];
    }
  });
});

// ✨ 新規追加でモーダルを開く
const openNewModal = () => {
  editingPost.value = null; // 編集データをクリア
  isModalOpen.value = true;
};

// ✨ 編集でモーダルを開く
const openEditModal = (post: AnalyzedPost) => {
  editingPost.value = post; // 編集データをセット
  isModalOpen.value = true;
};

// ✨ 送信時の処理（新規か更新かを自動判別）
const handlePostSubmit = async (data: any) => {
  if (editingPost.value && data.docId) {
    // 編集モード：FirestoreとStoreを更新
    await postStore.updatePost(data.docId, data.id, data);
  } else {
    // 新規追加モード
    await postStore.addPost(data);
  }
  isModalOpen.value = false;
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
