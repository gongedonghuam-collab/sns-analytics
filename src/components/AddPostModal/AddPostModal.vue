<template>
  <div
    v-if="isOpen"
    @click.self="$emit('close')"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
  >
    <div
      class="bg-slate-800 w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl animate-slide-up relative overflow-y-auto max-h-[90vh]"
    >
      <div
        v-if="isAnalyzing"
        class="absolute inset-0 z-50 bg-slate-900/90 rounded-3xl flex flex-col items-center justify-center"
      >
        <div
          class="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"
        ></div>
        <p class="text-pink-400 font-bold animate-pulse">AIが処理中...</p>
      </div>

      <div class="flex justify-between items-center mb-5">
        <!-- ✨ 編集モードか新規追加モードかでタイトルを出し分ける -->
        <h2 class="text-lg font-bold text-white">
          {{ isEditMode ? "投稿データの編集" : "新規データの追加" }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-white font-bold p-2"
        >
          ✕
        </button>
      </div>

      <!-- 編集モードの時は画像アップロードを隠す（数字だけいじる想定） -->
      <div v-if="!isEditMode" class="mb-4">
        <label
          class="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-indigo-500/50 rounded-xl cursor-pointer bg-indigo-900/20 hover:bg-indigo-900/40 transition-colors"
        >
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <p class="text-sm font-bold text-indigo-300">
              📸 インサイト画像をアップロード
            </p>
            <p class="text-[10px] text-indigo-400 mt-1">
              AIが数字を自動入力します
            </p>
          </div>
          <input
            type="file"
            class="hidden"
            accept="image/*"
            @change="handleImageUpload"
          />
        </label>
      </div>

      <form @submit.prevent="submitPost" class="space-y-4">
        <div>
          <label class="block text-xs text-slate-400 mb-1"
            >ターゲット層（自由入力 または 候補選択）</label
          >
          <input
            v-model="formData.persona"
            list="persona-options"
            type="text"
            required
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
            placeholder="例: 20代女性（コスメ・美容好き）"
          />
          <datalist id="persona-options">
            <option value="10代学生（トレンド・エンタメ）"></option>
            <option value="20代女性（美容・コスメ・ファッション）"></option>
            <option value="20代男性（ガジェット・テック・車）"></option>
            <option value="30代ママ（時短・育児・ライフハック）"></option>
            <option value="ビジネスパーソン（自己啓発・副業・PC）"></option>
            <option value="40代以上（健康・資産運用・グルメ）"></option>
          </datalist>
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1"
            >タグ（カンマ区切りで複数入力）</label
          >
          <input
            v-model="tagString"
            type="text"
            required
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
            placeholder="例: #Vlog, #ガジェット, #購入品"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-xs text-slate-400 mb-1"
            >動画のタイトル</label
          >
          <input
            v-model="formData.title"
            type="text"
            required
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
            placeholder="例: 【保存版】失敗しないデスク構築5選"
          />
          <button
            type="button"
            @click="generateTitle"
            class="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-transform active:scale-95 shadow-md shadow-indigo-500/20"
          >
            ✨ 上のターゲットとタグから「バズるタイトル」をAI自動生成
          </button>
        </div>

        <div class="grid grid-cols-4 gap-2">
          <div>
            <label class="block text-[10px] text-slate-400 mb-1">リーチ</label>
            <input
              v-model.number="formData.reach"
              type="number"
              required
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label class="block text-[10px] text-slate-400 mb-1">いいね</label>
            <input
              v-model.number="formData.likes"
              type="number"
              required
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label class="block text-[10px] text-slate-400 mb-1">保存</label>
            <input
              v-model.number="formData.saves"
              type="number"
              required
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label class="block text-[10px] text-slate-400 mb-1"
              >3秒維持(%)</label
            >
            <input
              v-model.number="formData.retentionRate3s"
              type="number"
              required
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">使用BGM</label>
          <input
            v-model="formData.bgm"
            type="text"
            required
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
            placeholder="例: トレンドの洋楽ポップ"
          />
        </div>

        <!-- ✨ ボタンのテキストも変更 -->
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3.5 rounded-xl mt-6 shadow-lg shadow-pink-500/20 active:scale-95 transition-transform"
        >
          {{ isEditMode ? "数値を更新する" : "データを追加する" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { getGenerativeModel } from "firebase/ai";
import { ai } from "../../firebase";

const props = defineProps<{
  isOpen: boolean;
  editingPost?: any; // ✨ 親から「今編集しようとしてるデータ」をもらう
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submit", data: any): void;
}>();

const tagString = ref("");
const isAnalyzing = ref(false);

const formData = ref({
  title: "",
  reach: 0,
  likes: 0,
  saves: 0,
  retentionRate3s: 0,
  bgm: "",
  persona: "",
});

// ✨ 編集モードかどうかを判定
const isEditMode = computed(() => !!props.editingPost);

// ✨ モーダルが開かれた時、編集データがあれば中身をセットする
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.editingPost) {
        formData.value = { ...props.editingPost };
        tagString.value = props.editingPost.tags
          ? props.editingPost.tags.join(", ")
          : "";
      } else {
        formData.value = {
          title: "",
          reach: 0,
          likes: 0,
          saves: 0,
          retentionRate3s: 0,
          bgm: "",
          persona: "",
        };
        tagString.value = "";
      }
    }
  },
);

const generateTitle = async () => {
  if (!tagString.value) {
    alert("先にタグを入力してください！AIがそれを元に考えます。");
    return;
  }
  isAnalyzing.value = true;
  try {
    const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
    const prompt = `あなたはSNSマーケティングのプロです。以下の条件で、思わずクリックしたくなるようなTikTok/Instagramのショート動画のタイトル案を1つだけ（カギカッコや余計な説明なしで）出力してください。
    ※アスタリスク(*)などの記号は絶対に使用しないでください。
    ターゲット: ${formData.value.persona || "指定なし"}
    関連タグ: ${tagString.value}
    BGMの雰囲気: ${formData.value.bgm || "トレンドのアップテンポ"}`;

    const result = await model.generateContent(prompt);
    formData.value.title = result.response.text().replace(/\*/g, "").trim();
  } catch (error) {
    console.error(error);
    alert("タイトルの生成に失敗しました。");
  } finally {
    isAnalyzing.value = false;
  }
};

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  isAnalyzing.value = true;
  try {
    const model = getGenerativeModel(ai, {
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    }).then((res) => res.split(",")[1]);

    const imagePart = { inlineData: { data: base64Data, mimeType: file.type } };

    const prompt = `この画像はInstagram/TikTokのインサイト（分析）画面です。画像から以下の数値を読み取り、必ずJSON形式で返してください。
{ "reach": リーチ数または再生数（カンマを抜いた数字のみ）, "likes": いいね数（カンマを抜いた数字のみ）, "saves": 保存数（カンマを抜いた数字のみ）, "retentionRate3s": 3秒維持率のパーセンテージ（%を除いた数字のみ） }
もし読み取れない項目があれば、0を入れてください。`;

    const result = await model.generateContent([prompt, imagePart]);
    const parsed = JSON.parse(result.response.text());

    formData.value.reach = Number(parsed.reach) || 0;
    formData.value.likes = Number(parsed.likes) || 0;
    formData.value.saves = Number(parsed.saves) || 0;
    formData.value.retentionRate3s = Number(parsed.retentionRate3s) || 0;
  } catch (error) {
    console.error(error);
    alert("画像の解析に失敗しました。");
  } finally {
    isAnalyzing.value = false;
  }
};

const submitPost = () => {
  const tags = tagString.value
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);
  // ✨ 編集モードの時は、元のIDなどの情報も一緒に親へ返す
  if (isEditMode.value) {
    emit("submit", { ...props.editingPost, ...formData.value, tags });
  } else {
    emit("submit", { ...formData.value, tags });
  }
};
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
