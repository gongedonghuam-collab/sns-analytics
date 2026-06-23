import { computed } from "vue";
import { usePostsStore } from "../../stores/usePosts";
import type { AnalyzedPost } from "../../types";

export function useStats(props: { posts: AnalyzedPost[] }) {
  const postStore = usePostsStore();

  const totalReach = computed(() =>
    props.posts.reduce((sum, p) => sum + p.reach, 0),
  );

  const avgSaveRate = computed(() => {
    if (props.posts.length === 0) return "0.0";
    const avg =
      props.posts.reduce((sum, p) => sum + parseFloat(p.saveRate), 0) /
      props.posts.length;
    return avg.toFixed(1);
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthReach = computed(() => {
    return props.posts
      .filter((p) =>
        p.date.startsWith(String(currentMonth).padStart(2, "0") + "/"),
      )
      .reduce((sum, p) => sum + p.reach, 0);
  });

  // ✨ 固定値(100000)を廃止し、ストアの数値を参照するように修正
  const goalReach = computed(() => postStore.goalReach);
  const reachProgress = computed(() =>
    Math.min((currentMonthReach.value / goalReach.value) * 100, 100),
  );

  const last14Days = computed(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
      const count = props.posts.filter((p) => p.date === dateStr).length;
      days.push({ date: dateStr, count });
    }
    return days;
  });

  return {
    totalReach,
    avgSaveRate,
    currentMonthReach,
    goalReach,
    reachProgress,
    last14Days,
  };
}
