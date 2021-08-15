// https://raw.githubusercontent.com/zphyrj/jsExperiments/main/LICENSE
// use github api https://api.github.com/repos/zphyrj/mvhs-app-pwa/commits?per_page=1&page=2
GITHUB_OWNER = 'zphyrj';
GITHUB_REPO = 'jsExperiments';
GITHUB_ROOT_PATH = 'pwaStarterTemplate'
GITHUB_URL = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/commits?per_page=1&page=1';
CACHE_NAME = 'pwa-starter-template';
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
self.addEventListener('install', function(event) {
  self.skipWaiting();
    // Perform install steps
});
// const githubLastCommit = await fetch(GITHUB_URL + '1').then(response => response.json());

self.addEventListener('fetch', function(event) {
  function getHeadDate(url) {
    return fetch(GITHUB_URL+'&path=/'+GITHUB_ROOT_PATH+new URL(url).pathname)
    .then(response => response.json())
    .catch((err)=>{
      console.log(err);
      return new Response('Service worker fetch error', {
        status: 500,
        statusText: 'Service worker fetch error'
        })
    });
  }

  function getCachedResponse(url) {
    return caches.match(url).then(function (response) {
      if (response) {
        return response;
      }
      return new Response('Service worker fetch error', {
        status: 500,
        statusText: 'Service worker fetch error'
      });
    });
  }

  function getFromServer(url) {
    const response = fetch(url)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          console.log('loading from cache due to bad response from server ' + event.request.url);
          return caches.match(url);
        }
        return response;
      })
    return response;
  }

  event.respondWith((async () => {
    const url = event.request.url;
    const headDate = (await getHeadDate(url))[0].commit.committer.date;
    console.log(headDate);
    const cachedResponse = await getCachedResponse(url);
    if (!headDate || headDate.status === 500) {
      console.log('loading from cache due to bad response from server ' + event.request.url);
      return await getCachedResponse(url);
    }
    if (cachedResponse.headers.get('last-modified') === headDate) {
      return cachedResponse;
    }
    const serverResponse = await getFromServer(url);
    const cache = await caches.open(CACHE_NAME);
    const clonedResponse = serverResponse.clone();
    let headers = new Headers(clonedResponse);
    headers.set('last-modified', headDate);
    const clonedWithHeader = await clonedResponse.blob().then(function (body) {
      return new Response(body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: headers
      });
    });
    cache.put(url, clonedWithHeader);
    return serverResponse;
    })());
  });
