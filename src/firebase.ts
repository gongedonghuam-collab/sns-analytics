import { getAI, GoogleAIBackend } from "firebase/ai";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";

// ⚠️ ここをご自身の firebaseConfig に書き換えてください！
const firebaseConfig = {
  apiKey: "AIzaSyBMGwxFJcLGc5wqmTGN73-fOpkn7SqJQls",
  authDomain: "politi-base.firebaseapp.com",
  projectId: "politi-base",
  storageBucket: "politi-base.firebasestorage.app",
  messagingSenderId: "1004202222988",
  appId: "1:1004202222988:web:f3b1915b2f28b70ed8e2a9",
  measurementId: "G-VCQNWKM8C9",
};

// Firebaseを起動して鍵を渡す
const app = initializeApp(firebaseConfig);

// 認証（ログイン）機能のシステムを取り出してエクスポートする
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((err) => {
  console.error("オフライン対応エラー:", err.code);
});
export const ai = getAI(app, { backend: new GoogleAIBackend() });
