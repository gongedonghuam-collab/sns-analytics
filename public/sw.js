const CACHE_NAME = "viralytics-v2"; // バージョンを上げる
const ASSETS = ["/", "/index.html", "/favicon.svg", "/icons.svg"];

// インストール時に新しいService Workerをすぐに待機状態からアクティブにする
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

// アクティブになった時、古いキャッシュをすべて削除する
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// ネットワークファースト（常に通信して最新を取りに行く。圏外の時だけキャッシュを返す）
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    }),
  );
});
