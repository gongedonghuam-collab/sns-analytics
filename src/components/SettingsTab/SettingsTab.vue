<template>
  <div class="space-y-6">
    <!-- アカウント情報セクション -->
    <div
      class="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center shadow-xl"
    >
      <div v-if="user" class="space-y-4">
        <div class="relative w-20 h-20 mx-auto">
          <img
            :src="user.photoURL"
            alt="Profile"
            class="w-full h-full rounded-full border-4 border-pink-500 shadow-lg shadow-pink-500/30 object-cover"
          />
          <div
            class="absolute bottom-0 right-0 bg-emerald-500 w-5 h-5 rounded-full border-2 border-slate-800"
          ></div>
        </div>
        <div>
          <p class="font-bold text-slate-200 text-lg">{{ user.displayName }}</p>
          <p class="text-[10px] text-slate-400 mt-1">{{ user.email }}</p>
        </div>
        <button
          @click="logout"
          class="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 rounded-xl mt-4 active:scale-95 transition-all"
        >
          ログアウト
        </button>
      </div>

      <div v-else class="space-y-4">
        <div
          class="w-20 h-20 bg-slate-700 rounded-full mx-auto flex items-center justify-center"
        >
          <User class="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <p class="font-bold text-slate-200 text-lg">ゲストユーザー</p>
          <p class="text-xs text-slate-500 mt-1">
            データ連携にはログインが必要です
          </p>
        </div>
        <button
          @click="loginWithGoogle"
          class="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white font-bold py-3 rounded-xl mt-4 shadow-lg shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Googleでログイン
        </button>
      </div>
    </div>

    <!-- 📖 使い方・FAQセクションを追加 -->
    <div
      class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl text-left"
    >
      <h3 class="text-sm font-bold text-pink-300 mb-4 flex items-center gap-2">
        <span>📖</span> 使い方ガイド
      </h3>

      <div class="space-y-4">
        <div class="border-b border-slate-700 pb-3">
          <p class="text-xs font-bold text-slate-200 mb-1">
            Q. どうやって使うの？
          </p>
          <p class="text-[10px] text-slate-400 leading-relaxed">
            右下の「＋」ボタンから、過去の投稿のインサイト数値を入力してください。データが蓄積されると、分析タブで目標達成率やカレンダーが確認できるようになります。
          </p>
        </div>

        <div class="border-b border-slate-700 pb-3">
          <p class="text-xs font-bold text-slate-200 mb-1">
            Q. AIシミュレーターとは？
          </p>
          <p class="text-[10px] text-slate-400 leading-relaxed">
            入力されたデータをAIがマクロに分析し、あなたの「バズる傾向（ターゲット×タグ×BGM）」を自動で導き出します。さらに「魔法の台本」ボタンを押せば、次回作の構成とキャプションを生成してくれます。
          </p>
        </div>

        <div class="border-b border-slate-700 pb-3">
          <p class="text-xs font-bold text-slate-200 mb-1">
            Q. 画像アップロード機能について
          </p>
          <p class="text-[10px] text-slate-400 leading-relaxed">
            インサイトのスクリーンショットを選択すると、AIが画像から数値を読み取って入力欄を埋めるサポートをします。読み取りミスがある場合は手動で修正してください。
          </p>
        </div>

        <div>
          <p class="text-xs font-bold text-slate-200 mb-1">
            Q. 殿堂入り・バズの基準は？
          </p>
          <p class="text-[10px] text-slate-400 leading-relaxed">
            当アプリでは、<span class="text-emerald-400"
              >「保存率3%以上」をバズ</span
            >、<span class="text-amber-400"
              >「保存率3%以上 かつ 3秒維持率60%以上」を殿堂入り</span
            >として自動判定しています。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { User } from "lucide-vue-next";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

const user = ref<any>(null);

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
  });
});

const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    user.value = result.user;
  } catch (error) {
    console.error("ログインエラー:", error);
    alert("ログインに失敗しました。");
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    user.value = null;
  } catch (error) {
    console.error("ログアウトエラー:", error);
  }
};
</script>
