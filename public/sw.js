/* VERSION: 0.0.2 */
const cacheBust = '?' + Date.now(); // dirty hack for the install phase... saves me versioning at buildtime... if SW dies then this doesn't work as well...don't judge me
importScripts(`/scripts/router.js`);
importScripts(`/scripts/dot.js`);
importScripts(`/scripts/DOMParser.js${cacheBust}`);
importScripts(`/scripts/platform/web.js${cacheBust}`);
importScripts(`/scripts/platform/common.js${cacheBust}`);
importScripts(`/scripts/routes/index.js${cacheBust}`);
importScripts(`/scripts/routes/root.js${cacheBust}`);
importScripts(`/scripts/routes/proxy.js${cacheBust}`);

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

// The proxy server '/proxy'
router.get(`${self.location.origin}/proxy`, (e) => {
  e.respondWith(routes['proxy'](dataPath, assetPath, e.request));
}, {urlMatchProperty: 'href'});

// The root '/'
router.get(`${self.location.origin}/$`, (e) => {
  e.respondWith(routes['root'](dataPath, assetPath));
}, {urlMatchProperty: 'href'});

