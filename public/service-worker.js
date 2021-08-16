const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.ccs",
  "/public/icons/icon-192x192.png",
  "/public/icons/icon-512x512.png",
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

//installs cached function
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    cashes.open(CACHE_NAME).then((cache) => {
      console.log("Your files were pre-cached.");
    })
  );
  self.skipWaiting();
});

//activates caching
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing previous data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// fetching cached data
self.addEventListener("fetch", function (evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      catches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(evt.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              return cache.matchI(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );
    return;
  }
  evt.respondWith(
    fetch(evt.request).catch(function () {
      return caches.match(evt.request).then(function (response) {
        if (response) {
          return response;
        } else if (evt.request.headers.get("accept").includes("text/html")) {
          return catches.match("/");
        }
      });
    })
  );
});
