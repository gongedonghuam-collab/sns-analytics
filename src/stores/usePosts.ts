import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { getGenerativeModel } from "firebase/ai";
import { db, auth, ai } from "../firebase";
import type { Post, AnalyzedPost } from "../types";

export const usePostsStore = defineStore("posts", () => {
  const rawPosts = ref<Post[]>([]);
  const isLoading = ref(false);
  const currentSort = ref<string>("newest");

  const isDeepAnalyzing = ref(false);
  const aiDeepResult = ref<{
    bestPersona: string;
    bestTag: string;
    bestBgm: string;
    titleIdea: string;
    deepAdvice: string;
  } | null>(null);

  const goalReach = ref<number>(
    Number(localStorage.getItem("hairlytics_goal")) || 100000,
  );

  const updateGoal = (newGoal: number) => {
    if (newGoal <= 0 || isNaN(newGoal)) return;
    goalReach.value = newGoal;
    localStorage.setItem("hairlytics_goal", String(newGoal));
  };

  const analyzedPosts = computed<AnalyzedPost[]>(() => {
    const base = rawPosts.value.map((post) => {
      const reachVal = Number(post.reach) || 0;
      const savesVal = Number(post.saves) || 0;
      const retentionVal = Number(post.retentionRate3s) || 0;

      const saveRate =
        reachVal > 0 ? ((savesVal / reachVal) * 100).toFixed(1) : "0.0";
      const isViral = parseFloat(saveRate) >= 3.0;
      const needsHookImprovement = retentionVal < 50;
      const isHallOfFame = parseFloat(saveRate) >= 3.0 && retentionVal >= 60;

      return {
        ...post,
        reach: reachVal,
        saves: savesVal,
        retentionRate3s: retentionVal,
        saveRate,
        isViral,
        needsHookImprovement,
        isHallOfFame,
      };
    });

    if (currentSort.value === "reach") {
      return base.sort((a, b) => b.reach - a.reach);
    } else if (currentSort.value === "saveRate") {
      return base.sort(
        (a, b) => parseFloat(b.saveRate) - parseFloat(a.saveRate),
      );
    } else if (currentSort.value === "retention") {
      return base.sort((a, b) => b.retentionRate3s - a.retentionRate3s);
    } else {
      return base.sort((a, b) => b.id - a.id);
    }
  });

  const hallOfFamePosts = computed(() => {
    return analyzedPosts.value.filter((p) => p.isHallOfFame);
  });

  const analyzeAllPostsViaAI = async () => {
    if (rawPosts.value.length === 0) return;
    isDeepAnalyzing.value = true;
    try {
      const model = getGenerativeModel(ai, {
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const dataSummary = rawPosts.value
        .map(
          (p) =>
            `・タイトル: ${p.title}, ターゲット: ${p.persona}, タグ: ${p.tags.join(",")}, BGM: ${p.bgm}, リーチ: ${p.reach}, いいね: ${p.likes}, 保存: ${p.saves}, 3秒維持: ${p.retentionRate3s}%`,
        )
        .join("\n");

      const prompt = `あなたはSNSを何人もバズらせてきた天才マーケターです。
以下は、あるSNSクリエイターのこれまでの全投稿データ（インサイト数値）です。
これらのデータをマクロに分析し、次にどんな【ターゲット層 × ハッシュタグ × BGM】の組み合わせで動画を作れば確実に大ヒット（バズ・高保存率）するかをガチで予測してください。
必ず、以下のJSON形式でのみ回答を出力してください（※アスタリスク等の記号や説明は一切不要です）。

{
  "bestPersona": "次に最も狙うべき具体的なターゲット層",
  "bestTag": "次に最も使うべきメインのハッシュタグ1つ",
  "bestBgm": "次に最も合わせるべきBGMの名前や雰囲気",
  "titleIdea": "全データ分析から導き出した、次回の絶対に滑らない動画タイトル案（※記号不使用）",
  "deepAdvice": "なぜこの組み合わせが弾き出されたのか、過去の数値データ（リーチ、保存率、3秒維持率の傾向）を具体的に引用しながら、クリエイターが納得できる解説と撮影アドバイスを200文字程度で論理的に書いてください。"
}

【全投稿データ】
${dataSummary}`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      aiDeepResult.value = parsed;
    } catch (error) {
      console.error("AIディープ分析エラー:", error);
    } finally {
      isDeepAnalyzing.value = false;
    }
  };

  const fetchPosts = async () => {
    const user = auth.currentUser;
    if (!user) {
      rawPosts.value = [];
      return;
    }
    isLoading.value = true;
    try {
      const q = query(
        collection(db, "posts"),
        where("uid", "==", user.uid),
        orderBy("id", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const fetchedData: Post[] = [];
      querySnapshot.forEach((document) => {
        fetchedData.push({ ...document.data(), docId: document.id } as Post);
      });
      rawPosts.value = fetchedData;

      if (fetchedData.length > 0) {
        analyzeAllPostsViaAI();
      }
    } catch (error) {
      console.error("データの取得に失敗:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const addPost = async (newPostData: Omit<Post, "id" | "date">) => {
    const user = auth.currentUser;
    if (!user) return alert("ログインが必要です");

    const nextId = Date.now();
    const today = new Date();
    const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;

    const fullPost = {
      id: nextId,
      date: dateStr,
      uid: user.uid,
      ...newPostData,
    };

    try {
      const docRef = await addDoc(collection(db, "posts"), fullPost);
      rawPosts.value.unshift({ ...fullPost, docId: docRef.id });
      analyzeAllPostsViaAI();
    } catch (error) {
      console.error("保存失敗:", error);
    }
  };

  // ✨ 追加：投稿を上書き更新する機能
  const updatePost = async (
    docId: string,
    localId: number,
    updatedData: Partial<Post>,
  ) => {
    try {
      await updateDoc(doc(db, "posts", docId), updatedData);
      // ローカルのデータも更新する
      const index = rawPosts.value.findIndex((p) => p.id === localId);
      if (index !== -1) {
        rawPosts.value[index] = { ...rawPosts.value[index], ...updatedData };
      }
      analyzeAllPostsViaAI();
    } catch (error) {
      console.error("更新失敗:", error);
      alert("データの更新に失敗しました。");
    }
  };

  const deletePost = async (docId: string | undefined, localId: number) => {
    if (!docId) {
      rawPosts.value = rawPosts.value.filter((p) => p.id !== localId);
      return;
    }
    const isConfirmed = window.confirm(
      "このデータを削除してもよろしいですか？",
    );
    if (!isConfirmed) return;

    try {
      await deleteDoc(doc(db, "posts", docId));
      rawPosts.value = rawPosts.value.filter((p) => p.id !== localId);
      analyzeAllPostsViaAI();
    } catch (error) {
      console.error("削除失敗:", error);
    }
  };

  return {
    rawPosts,
    analyzedPosts,
    hallOfFamePosts,
    aiDeepResult,
    isDeepAnalyzing,
    analyzeAllPostsViaAI,
    goalReach,
    updateGoal,
    currentSort,
    fetchPosts,
    addPost,
    updatePost,
    deletePost,
    isLoading,
  };
});
