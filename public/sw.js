/* VERSION: 0.0.1 */
const cacheBust = '?' + Date.now(); // dirty hack for the install phase... saves me versioning at buildtime... if SW dies then this doesn't work as well...don't judge me
importScripts(`/scripts/router.js${cacheBust}`);
importScripts(`/scripts/dot.js${cacheBust}`);
importScripts(`/scripts/platform/web.js${cacheBust}`);
importScripts(`/scripts/platform/common.js${cacheBust}`);
importScripts(`/scripts/routes/root.js${cacheBust}`)

const assetPath = '/assets/';
const dataPath = '/data/'

var ASSET_CACHE_NAME = 'assest-cache';
var assetsToCache = [
  `${assetPath}templates/head.html`,
  `${assetPath}templates/foot.html`,
  `${assetPath}templates/body.html`,
];

self.addEventListener('install', (e) => {
  // Perform install steps
  e.waitUntil(
    caches.open(ASSET_CACHE_NAME)
      .then((cache) => {
        console.log(`${ASSET_CACHE_NAME}: Opened cache`);
        return cache.addAll(assetsToCache);
      })      
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

getCompiledTemplate(`${assetPath}templates/body.html`);

/*
  Router logic.
*/

router.get(`${self.location.origin}/`, (e) => {
  e.respondWith(root(dataPath, assetPath));
}, {urlMatchProperty: 'href'});