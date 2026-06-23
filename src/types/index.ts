export interface Post {
  id: number;
  title: string;
  reach: number;
  likes: number;
  saves: number;
  date: string;
  retentionRate3s: number;
  tags: string[];
  bgm: string;
  persona: string;
  uid?: string;
  docId?: string; // ✨ 追加：Firestore削除用のID
}

export interface AnalyzedPost extends Post {
  saveRate: string;
  isViral: boolean;
  needsHookImprovement: boolean;
  isHallOfFame: boolean;
}
